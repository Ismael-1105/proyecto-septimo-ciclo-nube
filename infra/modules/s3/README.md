# Modulo s3

## Que crea

Dos buckets S3 privados:

- **Enrolamiento** (`${name_prefix}-enrollment-${bucket_suffix}`): imagenes de rostro subidas por el administrador durante el registro de estudiantes.
- **Evidencias** (`${name_prefix}-evidence-${bucket_suffix}`): capturas de eventos relevantes, en particular accesos denegados.

Ambos buckets tienen cifrado SSE-KMS con la clave del modulo kms, versionado activo y bloqueo total de acceso publico (los cuatro flags del public access block en true). Solo el bucket de evidencias lleva una regla de lifecycle que expira los objetos (y sus versiones no vigentes) a los `evidence_retention_days` dias, para cumplir la minimizacion de datos biometricos.

## Por que existe

El informe separa los datos estructurados (tablas DynamoDB) de los objetos de imagen (S3) para optimizar costo y rendimiento: DynamoDB no esta pensado para blobs grandes y S3 almacena objetos a un costo por GB muy inferior. El cifrado en reposo con clave de cliente y el ciclo de vida de expiracion son exigencias derivadas de que se manejan datos biometricos.

## Variables

| Nombre | Tipo | Default | Descripcion |
|---|---|---|---|
| `name_prefix` | `string` | (requerida) | Prefijo de nombres, formato proyecto-entorno (ej. `afl-dev`) |
| `tags` | `map(string)` | (requerida) | Tags comunes aplicados a todos los recursos |
| `kms_key_arn` | `string` | (requerida) | ARN de la clave KMS para el cifrado SSE-KMS de ambos buckets |
| `bucket_suffix` | `string` | (requerida) | Sufijo para unicidad global del nombre (placeholder, valor real por confirmar) |
| `evidence_retention_days` | `number` | `90` | Dias de retencion de las evidencias antes de expirar |

## Outputs

| Nombre | Descripcion |
|---|---|
| `enrollment_bucket_name` | Nombre del bucket de imagenes de enrolamiento |
| `enrollment_bucket_arn` | ARN del bucket de imagenes de enrolamiento |
| `evidence_bucket_name` | Nombre del bucket de evidencias de eventos |
| `evidence_bucket_arn` | ARN del bucket de evidencias de eventos |

## Nota de costo

S3 cobra por GB almacenado al mes y por peticiones (PUT, GET). Para el volumen de un laboratorio (imagenes pequenas y pocos eventos al dia) el costo esperado es bajo; el lifecycle de evidencias ademas evita acumulacion indefinida. La capa gratuita de AWS cubre un uso basico de S3 durante los primeros 12 meses de la cuenta. Cifras concretas por confirmar con el volumen real.
