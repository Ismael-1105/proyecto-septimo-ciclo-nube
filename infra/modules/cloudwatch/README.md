# Modulo cloudwatch

## Que crea

Observabilidad de las dos funciones Lambda del sistema:

- Dos log groups `/aws/lambda/<funcion>` (acceso y enrolamiento) con retencion de 30 dias. Este modulo es el dueño de los log groups; el modulo lambda no los crea.
- Dos alarmas de errores (metrica `Errors`, namespace `AWS/Lambda`, suma en periodos de 5 minutos, umbral de 1 o mas), una por funcion, que notifican al topic SNS de alertas.
- Una alarma de throttles sobre la funcion de acceso, la funcion critica: si se estrangula, la puerta del laboratorio no abre.

## Por que existe

El informe del proyecto exige vigilar la salud y el desempeño del sistema con registros, metricas y alarmas. Ademas, la retencion limitada de logs a 30 dias responde al principio de minimizacion de datos, ya que los registros pueden contener identificadores de estudiantes.

## Variables

| Variable | Tipo | Descripcion |
|---|---|---|
| `name_prefix` | `string` | Prefijo de nombres, formato proyecto-entorno (ej. `afl-dev`) |
| `tags` | `map(string)` | Tags comunes aplicados a todos los recursos |
| `access_lambda_name` | `string` | Nombre de la funcion Lambda de acceso |
| `enrollment_lambda_name` | `string` | Nombre de la funcion Lambda de enrolamiento |
| `alerts_topic_arn` | `string` | ARN del topic SNS de alertas |

## Outputs

| Output | Tipo | Descripcion |
|---|---|---|
| `log_group_names` | `map(string)` | Nombres de los log groups, claves `access` y `enrollment` |
| `alarm_arns` | `list(string)` | ARNs de las tres alarmas creadas |

## Nota de costo

CloudWatch Logs cobra por GB ingerido y almacenado; las alarmas se cobran por unidad. A este volumen (un laboratorio, trafico bajo) el costo es marginal.
