# Modulo rekognition

## Que crea

Una coleccion de rostros (`aws_rekognition_collection`) con `collection_id` en formato `${var.name_prefix}-rostros`, por ejemplo `afl-dev-rostros`. La coleccion es el nucleo de la identificacion 1:N del sistema: almacena los vectores faciales (no las imagenes) de los estudiantes enrolados. Las funciones Lambda la consumen en tiempo de ejecucion con `IndexFaces` (enrolamiento) y `SearchFacesByImage` (control de acceso en el kiosco).

## Por que existe

El proyecto necesita identificar la identidad de un estudiante a partir de su rostro, no solo detectar que hay un rostro en la imagen. Amazon Rekognition ofrece identificacion gestionada 1:N contra una coleccion de vectores faciales, mientras que Google Cloud Vision solo detecta rostros y sus atributos sin resolver identidad. Por esa razon la eleccion de AWS es de fondo y no solo de conveniencia.

## Aclaracion sobre Face Liveness

Rekognition Face Liveness (verificacion de vivacidad anti suplantacion) NO es un recurso de Terraform y no aparece en este modulo. Es una API que se invoca en tiempo de ejecucion mediante `CreateFaceLivenessSession` y `GetFaceLivenessSessionResults`, y sus permisos se otorgan en el modulo `iam`. No busque un recurso de liveness en este ni en ningun otro modulo: no existe.

## Variables

| Nombre | Tipo | Descripcion |
|---|---|---|
| `name_prefix` | `string` | Prefijo de nombres, formato proyecto-entorno (ej. `afl-dev`) |
| `tags` | `map(string)` | Tags comunes aplicados a todos los recursos |

## Outputs

| Nombre | Descripcion |
|---|---|
| `collection_id` | ID de la coleccion de rostros, lo consumen las Lambdas para `IndexFaces` y `SearchFacesByImage` |
| `collection_arn` | ARN de la coleccion de rostros, lo consume el modulo `iam` para politicas de minimo privilegio |

## Nota de costo

Rekognition cobra por imagen procesada: cada imagen indexada con `IndexFaces` y cada busqueda con `SearchFacesByImage` genera cargo, y cada verificacion de Face Liveness se cobra por sesion (montos exactos por confirmar segun la tarifa vigente de `us-east-1`). Face Liveness no tiene capa gratuita. El almacenamiento de vectores faciales en la coleccion tambien tiene un cargo mensual por rostro almacenado (monto por confirmar).
