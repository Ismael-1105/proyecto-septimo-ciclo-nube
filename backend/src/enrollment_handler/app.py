"""Lambda de enrolamiento del proyecto Acceso-Facial-Lab.

Flujo implementado (segun el informe de definicion del sistema):

1. El administrador, autenticado con Cognito en el panel web, envia por
   API Gateway (POST /enrollment) los datos de un estudiante y su fotografia.
2. La funcion valida el payload: student_id, nombre, horarios permitidos y
   la imagen, que puede llegar en base64 (imagen_base64) o como clave de un
   objeto ya subido al bucket ENROLLMENT_BUCKET (clave_s3).
3. Si la imagen vino en base64, se guarda cifrada en S3 (cifrado del lado del
   servidor con KMS).
4. Se invoca Rekognition IndexFaces sobre la coleccion COLLECTION_ID con
   ExternalImageId igual al student_id para extraer el vector facial.
5. Se guarda o actualiza el registro del estudiante en DynamoDB (tabla
   STUDENTS_TABLE) con su face_id, estado habilitado y horarios permitidos.
6. Se responde con el resultado del alta.

Baja (derecho de eliminacion, LOPDP): si el payload trae accion "baja",
se elimina el rostro de la coleccion con DeleteFaces y se marca el registro
del estudiante como deshabilitado en DynamoDB.
"""

import base64
import json
import logging
import os

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Variables de entorno inyectadas por la plantilla de infraestructura.
COLLECTION_ID = os.environ.get("COLLECTION_ID", "")
STUDENTS_TABLE = os.environ.get("STUDENTS_TABLE", "")
ENROLLMENT_BUCKET = os.environ.get("ENROLLMENT_BUCKET", "")

# Clientes boto3 fuera del handler para reutilizarlos entre invocaciones
# (se crean una sola vez por contenedor de ejecucion).
s3_client = boto3.client("s3")
rekognition_client = boto3.client("rekognition")
dynamodb = boto3.resource("dynamodb")


class EnrollmentError(Exception):
    """Error controlado del flujo de enrolamiento, se reporta con 422."""


def handler(event, context):
    """Punto de entrada de la Lambda (API Gateway proxy integration)."""
    try:
        body = json.loads(event.get("body") or "{}")
    except (json.JSONDecodeError, TypeError):
        logger.warning("Body recibido no es JSON valido")
        return _response(400, {"estado": "error", "mensaje": "Payload invalido"})

    try:
        accion = body.get("accion", "alta")
        student_id = body.get("student_id")

        if not student_id:
            return _response(400, {"estado": "error", "mensaje": "Falta student_id"})

        if accion == "baja":
            resultado = _deactivate_student(student_id)
            logger.info("Baja procesada para student_id=%s", student_id)
            return _response(200, {"estado": "ok", "accion": "baja", "resultado": resultado})

        # Alta: validacion de campos obligatorios.
        nombre = body.get("nombre")
        horarios = body.get("horarios")
        imagen_base64 = body.get("imagen_base64")
        clave_s3 = body.get("clave_s3")

        if not nombre or horarios is None:
            return _response(400, {"estado": "error", "mensaje": "Faltan nombre u horarios"})
        if not imagen_base64 and not clave_s3:
            return _response(400, {"estado": "error", "mensaje": "Se requiere imagen_base64 o clave_s3"})

        clave = _store_image(student_id, imagen_base64, clave_s3)
        face_id = _index_face(student_id, clave)
        registro = _save_student(student_id, body, face_id)

        logger.info("Alta procesada para student_id=%s face_id=%s", student_id, face_id)
        return _response(200, {"estado": "ok", "accion": "alta", "registro": registro})

    except EnrollmentError as error:
        logger.warning("Enrolamiento rechazado para student_id=%s: %s", body.get("student_id"), error)
        return _response(422, {"estado": "error", "mensaje": str(error)})
    except Exception:
        # Respuesta generica: no se exponen stack traces al cliente.
        logger.exception("Error no controlado en el handler de enrolamiento")
        return _response(500, {"estado": "error", "mensaje": "Error interno"})


def _store_image(student_id, imagen_base64, clave_s3):
    """Guarda la fotografia del estudiante cifrada en S3 si vino en base64.

    Si el payload trae clave_s3 (objeto ya subido al bucket), se devuelve esa
    misma clave sin subir nada. Devuelve la clave del objeto con la foto.
    """
    if clave_s3:
        return clave_s3

    try:
        imagen_bytes = base64.b64decode(imagen_base64, validate=True)
    except (ValueError, TypeError):
        raise EnrollmentError("imagen_base64 no es base64 valido")

    clave = f"enrolamiento/{student_id}.jpg"
    s3_client.put_object(
        Bucket=ENROLLMENT_BUCKET,
        Key=clave,
        Body=imagen_bytes,
        ContentType="image/jpeg",
        ServerSideEncryption="aws:kms",
    )
    return clave


def _index_face(student_id, clave_s3):
    """Indexa el rostro del estudiante en la coleccion de Rekognition.

    Devuelve el face_id asignado por Rekognition. Si la fotografia no contiene
    un rostro detectable se lanza un error controlado.
    """
    result = rekognition_client.index_faces(
        CollectionId=COLLECTION_ID,
        Image={"S3Object": {"Bucket": ENROLLMENT_BUCKET, "Name": clave_s3}},
        ExternalImageId=student_id,
        MaxFaces=1,
        QualityFilter="AUTO",
    )
    face_records = result.get("FaceRecords", [])
    if not face_records:
        raise EnrollmentError("No se detecto un rostro valido en la fotografia")
    return face_records[0]["Face"]["FaceId"]


def _save_student(student_id, datos, face_id):
    """Guarda o actualiza el registro del estudiante en DynamoDB.

    Devuelve el item guardado.
    """
    item = {
        "student_id": student_id,
        "nombre": datos["nombre"],
        "horarios": datos["horarios"],
        "face_id": face_id,
        "habilitado": True,
    }
    dynamodb.Table(STUDENTS_TABLE).put_item(Item=item)
    return item


def _deactivate_student(student_id):
    """Da de baja al estudiante: elimina su rostro y deshabilita el registro.

    Cumple el derecho de eliminacion de la LOPDP: el vector facial se borra de
    la coleccion de Rekognition y el registro queda deshabilitado en DynamoDB.
    """
    table = dynamodb.Table(STUDENTS_TABLE)
    result = table.get_item(Key={"student_id": student_id})
    item = result.get("Item")
    if not item:
        raise EnrollmentError(f"El estudiante {student_id} no existe en el catalogo")

    deleted_faces = []
    face_id = item.get("face_id")
    if face_id:
        respuesta = rekognition_client.delete_faces(
            CollectionId=COLLECTION_ID,
            FaceIds=[face_id],
        )
        deleted_faces = respuesta.get("DeletedFaces", [])

    table.update_item(
        Key={"student_id": student_id},
        UpdateExpression="SET habilitado = :v",
        ExpressionAttributeValues={":v": False},
    )
    return {"face_ids_eliminados": deleted_faces, "habilitado": False}


def _response(status_code, payload):
    """Construye una respuesta valida de API Gateway proxy integration."""
    return {
        "statusCode": status_code,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(payload, ensure_ascii=False),
    }
