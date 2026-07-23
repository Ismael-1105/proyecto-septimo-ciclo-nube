# Modulo dynamodb

## Que crea

Dos tablas DynamoDB con billing PAY_PER_REQUEST, cifrado en reposo con la clave KMS del proyecto y point in time recovery habilitado.

## Por que existe

El informe exige que cada intento de acceso quede registrado en la nube de forma consultable y auditable. DynamoDB responde a ese requisito con baja latencia en la consulta de autorizacion que se hace en la puerta y con escrituras frecuentes de bitacora sin administrar servidores ni capacidad.

## Esquema de las tablas

### Tabla `${name_prefix}-students`

Catalogo de estudiantes: estado de habilitacion, horarios permitidos y `face_id` de la coleccion de Rekognition.

| Elemento | Valor |
|---|---|
| Hash key | `student_id` (S) |

### Tabla `${name_prefix}-access-log`

Bitacora de accesos: cada evento guarda identidad, marca temporal, resultado (concedido o denegado) y porcentaje de similitud.

| Elemento | Valor |
|---|---|
| Hash key | `event_id` (S) |
| GSI `by-student` | hash `student_id` (S), range `timestamp` (S), projection ALL |

## Variables

| Nombre | Tipo | Descripcion |
|---|---|---|
| `name_prefix` | string | Prefijo de nombres, formato proyecto-entorno (ej. `afl-dev`) |
| `tags` | map(string) | Tags comunes aplicados a todos los recursos |
| `kms_key_arn` | string | ARN de la clave KMS para el cifrado de las tablas |

## Outputs

| Nombre | Descripcion |
|---|---|
| `students_table_name` | Nombre de la tabla de estudiantes |
| `students_table_arn` | ARN de la tabla de estudiantes |
| `access_log_table_name` | Nombre de la tabla de bitacora de accesos |
| `access_log_table_arn` | ARN de la tabla de bitacora de accesos |

## Nota de costo

Con PAY_PER_REQUEST se paga solo por peticion, sin capacidad aprovisionada. La capa gratuita de AWS cubre un volumen de lecturas, escrituras y almacenamiento que supera con holgura el trafico de un laboratorio, por lo que el costo esperado es bajo. Cifras reales por confirmar con la calculadora de AWS.
