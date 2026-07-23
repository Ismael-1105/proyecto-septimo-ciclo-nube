# Modulo kms

## Que crea

Una clave KMS de cliente (`aws_kms_key`) con rotacion automatica habilitada y politica por defecto de la cuenta, junto con su alias (`aws_kms_alias`) en formato `alias/${var.name_prefix}`, por ejemplo `alias/afl-dev`.

## Por que existe

El informe de definicion del proyecto exige cifrado en reposo con KMS porque el sistema trata datos biometricos sensibles, categoria protegida por la LOPDP de Ecuador. Esta clave es la unica del proyecto: los modulos `s3` (imagenes de enrolamiento y evidencias), `dynamodb` (tablas de estudiantes y bitacora de accesos) y `sns` (topico de alertas) la referencian a traves del output `key_arn`. El cableado entre modulos lo realiza `infra/envs/dev/main.tf`.

## Variables

| Nombre | Tipo | Descripcion |
|---|---|---|
| `name_prefix` | `string` | Prefijo de nombres, formato proyecto-entorno (ej. `afl-dev`) |
| `tags` | `map(string)` | Tags comunes aplicados a todos los recursos |

## Outputs

| Nombre | Descripcion |
|---|---|
| `key_arn` | ARN de la clave KMS, lo consumen s3, dynamodb y sns para cifrado en reposo |
| `key_id` | ID de la clave KMS |

## Nota de costo

AWS KMS cobra una tarifa mensual por cada clave de cliente y ademas cobra por peticiones a la API de la clave (monto exacto por confirmar segun la tarifa vigente de la region `us-east-1`).
