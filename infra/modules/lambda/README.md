# Modulo lambda

## Que crea

Dos funciones Lambda en Python 3.12 sobre arquitectura arm64, con handler `app.handler`, timeout de 30 segundos y 256 MB de memoria:

- `${name_prefix}-access`: orquesta el flujo de la puerta (liveness, SearchFacesByImage sobre la coleccion, consulta de autorizacion en DynamoDB, registro en la bitacora y respuesta al kiosco).
- `${name_prefix}-enrollment`: registra estudiantes (IndexFaces sobre la coleccion de Rekognition y alta en la tabla students).

Este modulo no crea log groups (los crea el modulo cloudwatch) ni roles IAM (llegan por variable desde el modulo iam), segun el contrato de CONVENTIONS.md.

## Por que existe

El informe concentra la logica de negocio en funciones sin servidor porque los accesos al laboratorio son eventos esporadicos: la capacidad escala de forma automatica y solo se paga por ejecucion, sin servidores encendidos en espera.

## De donde sale el codigo fuente

Del repositorio, en `backend/src/access_handler/` y `backend/src/enrollment_handler/`. Cada carpeta se empaqueta con `data "archive_file"` en un zip dentro de `builds/` (carpeta excluida por .gitignore) y el hash del zip dispara el redespliegue cuando cambia el codigo.

## Variables

| Nombre | Tipo | Descripcion |
|---|---|---|
| `name_prefix` | string | Prefijo de nombres, formato proyecto-entorno (ej. `afl-dev`) |
| `tags` | map(string) | Tags comunes aplicados a todos los recursos |
| `access_lambda_role_arn` | string | ARN del rol IAM de la funcion de acceso, provisto por el modulo iam |
| `enrollment_lambda_role_arn` | string | ARN del rol IAM de la funcion de enrolamiento, provisto por el modulo iam |
| `environment_variables` | map(string) | Variables de entorno compartidas: COLLECTION_ID, STUDENTS_TABLE, ACCESS_LOG_TABLE, ENROLLMENT_BUCKET, EVIDENCE_BUCKET, ALERTS_TOPIC_ARN y SIMILARITY_THRESHOLD |

## Outputs

| Nombre | Descripcion |
|---|---|
| `access_lambda_name` | Nombre de la funcion de acceso |
| `access_lambda_arn` | ARN de la funcion de acceso |
| `access_lambda_invoke_arn` | ARN de invocacion de la funcion de acceso para API Gateway |
| `enrollment_lambda_name` | Nombre de la funcion de enrolamiento |
| `enrollment_lambda_arn` | ARN de la funcion de enrolamiento |
| `enrollment_lambda_invoke_arn` | ARN de invocacion de la funcion de enrolamiento para API Gateway |

## Nota de costo

La capa gratuita de Lambda incluye 1 millon de invocaciones mensuales y un margen de computo que el trafico de un laboratorio no alcanza, por lo que el costo esperado es practicamente nulo a este volumen. Cifras reales por confirmar con la calculadora de AWS.
