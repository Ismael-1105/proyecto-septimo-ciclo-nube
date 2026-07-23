# Modulo iam

## Que crea

Dos roles IAM de ejecucion para las funciones Lambda del proyecto, cada uno
con su politica de confianza hacia `lambda.amazonaws.com` y una politica
inline construida con `data "aws_iam_policy_document"`:

- `${name_prefix}-access-lambda`: rol de la funcion de acceso (kiosco).
- `${name_prefix}-enrollment-lambda`: rol de la funcion de enrolamiento (panel).

## Por que existe

El informe exige minimo privilegio: cada funcion accede solo a los recursos
que necesita para su tarea y nada mas. Por eso hay un rol por funcion con
politicas inline acotadas a los ARNs recibidos de los otros modulos, en lugar
de politicas administradas amplias tipo `AmazonRekognitionFullAccess`. La
unica excepcion de alcance es Face Liveness: sus sesiones se crean en tiempo
de ejecucion y no tienen ARN previo, asi que esas dos acciones van con
`Resource "*"`. Los permisos de logs son el equivalente inline de
`AWSLambdaBasicExecutionRole`, sin `CreateLogGroup` porque los log groups los
administra el modulo cloudwatch.

## Que puede hacer cada rol

| Servicio | Rol de acceso | Rol de enrolamiento |
|---|---|---|
| Rekognition | `SearchFacesByImage` sobre la coleccion; `CreateFaceLivenessSession` y `GetFaceLivenessSessionResults` (sin ARN acotable) | `IndexFaces` y `DeleteFaces` sobre la coleccion |
| DynamoDB | `GetItem` en tabla de estudiantes; `PutItem` en tabla de accesos; `Query` en los indices de la tabla de accesos | `PutItem`, `UpdateItem`, `GetItem` en tabla de estudiantes |
| S3 | `PutObject` en el bucket de evidencias | `GetObject` y `PutObject` en el bucket de enrolamiento |
| SNS | `Publish` en el topico de alertas | (sin acceso) |
| KMS | `Decrypt` y `GenerateDataKey` sobre la clave del proyecto | `Decrypt` y `GenerateDataKey` sobre la clave del proyecto |
| CloudWatch Logs | `CreateLogStream` y `PutLogEvents` | `CreateLogStream` y `PutLogEvents` |

## Variables

| Variable | Tipo | Descripcion |
|---|---|---|
| `name_prefix` | string | Prefijo de nombres, formato proyecto-entorno (ej. `afl-dev`) |
| `tags` | map(string) | Tags comunes aplicados a todos los recursos |
| `students_table_arn` | string | ARN de la tabla DynamoDB de estudiantes |
| `access_log_table_arn` | string | ARN de la tabla DynamoDB de registro de accesos |
| `enrollment_bucket_arn` | string | ARN del bucket S3 de fotos de enrolamiento |
| `evidence_bucket_arn` | string | ARN del bucket S3 de evidencias |
| `collection_arn` | string | ARN de la coleccion de rostros de Rekognition |
| `kms_key_arn` | string | ARN de la clave KMS del proyecto |
| `alerts_topic_arn` | string | ARN del topico SNS de alertas |

## Outputs

| Output | Descripcion |
|---|---|
| `access_lambda_role_arn` | ARN del rol de ejecucion de la Lambda de acceso |
| `enrollment_lambda_role_arn` | ARN del rol de ejecucion de la Lambda de enrolamiento |

## Costo

IAM no tiene costo: roles y politicas son gratuitos en AWS.
