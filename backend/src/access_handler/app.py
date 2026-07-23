"""Lambda de ACCESO del proyecto Acceso-Facial-Lab.

Orquesta la decision de acceso al laboratorio de computacion. El kiosco de la
puerta ya ejecuto la verificacion de vivacidad (Rekognition Face Liveness) y
envia la solicitud por API Gateway (POST /access, protegido con API key).

Flujo que implementa esta funcion:

1. Validar el payload recibido: imagen del rostro en base64 y el identificador
   de sesion de liveness generado por el kiosco.
2. Confirmar el resultado de vivacidad contra Rekognition mediante
   GetFaceLivenessSessionResults, usando el id de sesion recibido.
3. Buscar el rostro en la coleccion (COLLECTION_ID) con SearchFacesByImage,
   aplicando el umbral de similitud de la variable SIMILARITY_THRESHOLD.
4. Si hay coincidencia, consultar en DynamoDB (tabla STUDENTS_TABLE) si el
   estudiante esta habilitado y dentro del horario permitido.
5. Registrar SIEMPRE el evento en la bitacora (tabla ACCESS_LOG_TABLE).
6. Si el acceso es denegado o el rostro no es reconocido, publicar una alerta
   en SNS (ALERTS_TOPIC_ARN) y guardar la imagen como evidencia en S3
   (EVIDENCE_BUCKET).
7. Responder al kiosco: {"decision": "concedido" | "denegado", "motivo": "..."}.
"""

import base64
import json
import logging
import os
import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Variables de entorno de la funcion (definidas en la plantilla de despliegue).
COLLECTION_ID = os.environ.get("COLLECTION_ID", "")
STUDENTS_TABLE = os.environ.get("STUDENTS_TABLE", "")
ACCESS_LOG_TABLE = os.environ.get("ACCESS_LOG_TABLE", "")
EVIDENCE_BUCKET = os.environ.get("EVIDENCE_BUCKET", "")
ALERTS_TOPIC_ARN = os.environ.get("ALERTS_TOPIC_ARN", "")
SIMILARITY_THRESHOLD = float(os.environ.get("SIMILARITY_THRESHOLD", "95"))
LIVENESS_THRESHOLD = float(os.environ.get("LIVENESS_THRESHOLD", "80"))

# Zona horaria de Ecuador continental (sin horario de verano).
TZ_ECUADOR = timezone(timedelta(hours=-5))

DIAS_SEMANA = ("lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo")

# Clientes boto3 creados fuera del handler para reutilizarlos entre
# invocaciones calientes de la Lambda.
rekognition_client = boto3.client("rekognition")
dynamodb_resource = boto3.resource("dynamodb")
s3_client = boto3.client("s3")
sns_client = boto3.client("sns")


def _verify_liveness(session_id):
    """Confirma el resultado de vivacidad de la sesion indicada.

    Devuelve un dict con "is_live" (bool) y "confidence" (float). Solo se
    considera vivo si la sesion termino en SUCCEEDED y la confianza supera
    LIVENESS_THRESHOLD.
    """
    result = rekognition_client.get_face_liveness_session_results(SessionId=session_id)
    status = result.get("Status", "")
    confidence = float(result.get("Confidence", 0.0))
    return {
        "is_live": status == "SUCCEEDED" and confidence >= LIVENESS_THRESHOLD,
        "confidence": confidence,
    }


def _search_face(image_bytes):
    """Busca el rostro de la imagen en la coleccion de estudiantes.

    Devuelve un dict con "student_id" (str o None) y "similarity" (float).
    El student_id proviene del ExternalImageId con el que se indexo el rostro.
    """
    try:
        result = rekognition_client.search_faces_by_image(
            CollectionId=COLLECTION_ID,
            Image={"Bytes": image_bytes},
            FaceMatchThreshold=SIMILARITY_THRESHOLD,
            MaxFaces=1,
        )
    except ClientError as error:
        # InvalidParameterException: Rekognition no detecto ningun rostro en
        # la imagen; se trata como no reconocido, no como error del sistema.
        if error.response["Error"]["Code"] == "InvalidParameterException":
            logger.info("No se detecto rostro en la imagen recibida")
            return {"student_id": None, "similarity": 0.0}
        raise

    matches = result.get("FaceMatches", [])
    if not matches:
        return {"student_id": None, "similarity": 0.0}

    best = matches[0]
    return {
        "student_id": best["Face"].get("ExternalImageId"),
        "similarity": float(best.get("Similarity", 0.0)),
    }


def _check_authorization(student_id):
    """Verifica si el estudiante esta habilitado y en horario permitido.

    El registro puede traer "horarios": lista de franjas con "dia" (nombre en
    minusculas, ej. "lunes"), "inicio" y "fin" en formato HH:MM, hora local de
    Ecuador. Sin franjas definidas, el estudiante habilitado accede siempre.
    """
    table = dynamodb_resource.Table(STUDENTS_TABLE)
    result = table.get_item(Key={"student_id": student_id})
    item = result.get("Item")

    if not item:
        return {"authorized": False, "reason": "estudiante no registrado en el catalogo"}
    if not item.get("habilitado", False):
        return {"authorized": False, "reason": "estudiante deshabilitado"}

    horarios = item.get("horarios") or []
    if not horarios:
        return {"authorized": True, "reason": ""}

    ahora = datetime.now(TZ_ECUADOR)
    dia_actual = DIAS_SEMANA[ahora.weekday()]
    hora_actual = ahora.strftime("%H:%M")

    for franja in horarios:
        if franja.get("dia") == dia_actual and franja.get("inicio", "") <= hora_actual <= franja.get("fin", ""):
            return {"authorized": True, "reason": ""}

    return {"authorized": False, "reason": "fuera del horario permitido"}


def _log_event(event_id, student_id, decision, similarity, motivo):
    """Registra el evento de acceso en la bitacora, se ejecuta SIEMPRE.

    Los errores se registran en el log pero no interrumpen el flujo: la
    respuesta al kiosco no debe fallar por un problema de bitacora.
    """
    try:
        table = dynamodb_resource.Table(ACCESS_LOG_TABLE)
        table.put_item(Item={
            "event_id": event_id,
            "student_id": student_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "decision": decision,
            "similarity": Decimal(str(round(similarity, 2))),
            "motivo": motivo,
        })
    except ClientError:
        logger.exception("No se pudo registrar el evento %s en la bitacora", event_id)


def _handle_denied(event_id, student_id, motivo, image_bytes):
    """Gestiona un acceso denegado o no reconocido: evidencia y alerta.

    Guarda la imagen capturada en S3 y publica la alerta en SNS. Los errores
    se registran pero no interrumpen la respuesta al kiosco.
    """
    try:
        s3_client.put_object(
            Bucket=EVIDENCE_BUCKET,
            Key=f"evidencias/{event_id}.jpg",
            Body=image_bytes,
            ContentType="image/jpeg",
        )
    except ClientError:
        logger.exception("No se pudo guardar la evidencia del evento %s", event_id)

    try:
        sns_client.publish(
            TopicArn=ALERTS_TOPIC_ARN,
            Subject="Acceso denegado en laboratorio",
            Message=json.dumps({
                "event_id": event_id,
                "student_id": student_id,
                "motivo": motivo,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }, ensure_ascii=False),
        )
    except ClientError:
        logger.exception("No se pudo publicar la alerta del evento %s", event_id)


def _response(status_code, body_dict):
    """Construye una respuesta valida de API Gateway proxy integration."""
    return {
        "statusCode": status_code,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(body_dict, ensure_ascii=False),
    }


def handler(event, context):
    """Punto de entrada de la Lambda invocada por API Gateway (POST /access)."""
    try:
        # Parseo del body (API Gateway proxy integration entrega el body como
        # cadena, posiblemente codificada en base64 segun isBase64Encoded).
        raw_body = event.get("body") or "{}"
        if event.get("isBase64Encoded"):
            raw_body = base64.b64decode(raw_body).decode("utf-8")
        payload = json.loads(raw_body)

        image_b64 = payload.get("image")
        session_id = payload.get("liveness_session_id")

        if not image_b64 or not session_id:
            logger.warning("Payload invalido: falta image o liveness_session_id")
            return _response(400, {
                "decision": "denegado",
                "motivo": "payload invalido: se requiere image y liveness_session_id",
            })

        try:
            image_bytes = base64.b64decode(image_b64, validate=True)
        except (ValueError, TypeError):
            logger.warning("La imagen recibida no es base64 valido")
            return _response(400, {
                "decision": "denegado",
                "motivo": "payload invalido: image no es base64 valido",
            })

        event_id = str(uuid.uuid4())
        logger.info("Evento de acceso recibido: event_id=%s", event_id)

        # 1. Vivacidad: sin persona real no se continua con la identificacion.
        liveness = _verify_liveness(session_id)
        if not liveness["is_live"]:
            motivo = "verificacion de vivacidad fallida"
            _log_event(event_id, "desconocido", "denegado", 0.0, motivo)
            _handle_denied(event_id, "desconocido", motivo, image_bytes)
            return _response(200, {"decision": "denegado", "motivo": motivo})

        # 2. Identificacion contra la coleccion de rostros enrolados.
        match = _search_face(image_bytes)
        if not match["student_id"]:
            motivo = "rostro no reconocido"
            _log_event(event_id, "desconocido", "denegado", match["similarity"], motivo)
            _handle_denied(event_id, "desconocido", motivo, image_bytes)
            return _response(200, {"decision": "denegado", "motivo": motivo})

        # 3. Autorizacion: habilitacion y horario del estudiante identificado.
        auth = _check_authorization(match["student_id"])
        decision = "concedido" if auth["authorized"] else "denegado"
        motivo = "acceso concedido" if auth["authorized"] else auth["reason"]

        # 4. Bitacora siempre; evidencia y alerta solo en denegados.
        _log_event(event_id, match["student_id"], decision, match["similarity"], motivo)
        if not auth["authorized"]:
            _handle_denied(event_id, match["student_id"], motivo, image_bytes)

        return _response(200, {
            "decision": decision,
            "motivo": motivo,
            "student_id": match["student_id"],
            "similarity": round(match["similarity"], 2),
        })

    except json.JSONDecodeError:
        logger.warning("El body recibido no es JSON valido")
        return _response(400, {
            "decision": "denegado",
            "motivo": "payload invalido: el body debe ser JSON",
        })
    except Exception:
        # Respuesta generica al cliente, sin stack trace: el detalle queda en
        # CloudWatch Logs.
        logger.exception("Error inesperado procesando la solicitud de acceso")
        return _response(500, {
            "decision": "denegado",
            "motivo": "error interno",
        })
