# Modulo sns

## Que crea

Un topic SNS llamado `${var.name_prefix}-alertas`, cifrado con la clave KMS del proyecto (`kms_master_key_id = var.kms_key_arn`). Si la variable `alert_email` no esta vacia, crea ademas una suscripcion de protocolo `email` hacia ese correo.

## Por que existe

El informe del proyecto exige notificar a los responsables ante intentos de acceso de personas no reconocidas y otras anomalias. Este topic centraliza esas notificaciones: recibe alertas de accesos denegados, personas no reconocidas y alarmas de CloudWatch (las alarmas se cablean desde el modulo `cloudwatch` en `infra/envs/dev/main.tf`).

## Confirmacion manual de la suscripcion

La suscripcion por email no queda activa al aplicar Terraform: AWS envia un mensaje de confirmacion al buzon del destinatario y este debe aceptarlo manualmente. Hasta entonces la suscripcion figura como pendiente y no entrega notificaciones.

## Variables

| Nombre | Tipo | Default | Descripcion |
|---|---|---|---|
| `name_prefix` | `string` | (requerida) | Prefijo de nombres, formato proyecto-entorno (ej. `afl-dev`) |
| `tags` | `map(string)` | (requerida) | Tags comunes aplicados a todos los recursos |
| `kms_key_arn` | `string` | (requerida) | ARN de la clave KMS usada para cifrar el topic |
| `alert_email` | `string` | `""` | Correo del responsable, por confirmar. Si queda vacio no se crea la suscripcion |

## Outputs

| Nombre | Descripcion |
|---|---|
| `alerts_topic_arn` | ARN del topic SNS de alertas |

## Nota de costo

Practicamente nulo al volumen esperado del laboratorio: SNS cobra por millon de publicaciones y las notificaciones por email entran en el nivel gratuito a esta escala.
