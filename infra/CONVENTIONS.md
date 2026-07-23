# CONVENTIONS.md — Contrato de convenciones Terraform

> Contrato obligatorio para todo modulo de `infra/modules/`. Cualquier agente o
> persona que escriba Terraform en este repo lo cumple al pie de la letra.
> La arquitectura de referencia esta en
> `../acceso_facial_vault/Documentacion/Definicion-Proyecto.md`.

---

## Versiones y proveedor

- Terraform: `required_version = ">= 1.9.0"`.
- Provider AWS: `hashicorp/aws`, `version = "~> 6.0"`.
- Region unica: `us-east-1` (disponibilidad de Rekognition Face Liveness).
- Los bloques `terraform {}` con `required_providers` van SOLO en
  `infra/envs/dev/versions.tf`. Los modulos no declaran provider propio.

## Nomenclatura

- Slug del proyecto: `afl` (Acceso Facial Lab).
- Todo recurso se nombra con el prefijo recibido:
  `"${var.name_prefix}-<recurso>"`, por ejemplo `afl-dev-acceso`.
- Nombres de recursos Terraform (labels) en ingles corto y snake_case:
  `aws_dynamodb_table.students`, `aws_lambda_function.access`.
- Buckets S3 requieren unicidad global: el nombre incluye
  `var.bucket_suffix` (placeholder, valor real por confirmar).

## Variables comunes (obligatorias en TODO modulo)

```hcl
variable "name_prefix" {
  description = "Prefijo de nombres, formato proyecto-entorno (ej. afl-dev)"
  type        = string
}

variable "tags" {
  description = "Tags comunes aplicados a todos los recursos"
  type        = map(string)
}
```

Los tags comunes se definen una sola vez en el entorno:
`Project = "acceso-facial-lab"`, `Environment = "dev"`, `ManagedBy = "terraform"`.
Todo recurso que soporte tags los recibe con `tags = var.tags`.

## Estructura de cada modulo

```
infra/modules/<nombre>/
├── main.tf        <- recursos
├── variables.tf   <- name_prefix, tags y las especificas del modulo
├── outputs.tf     <- exactamente los outputs del contrato de interfaces
└── README.md      <- que crea, por que existe (segun el informe), variables,
                      outputs y nota de costo si aplica
```

## Contrato de interfaces entre modulos

Cada modulo expone EXACTAMENTE estos outputs (nombres literales) y recibe estas
variables especificas ademas de las comunes. El cableado entre modulos lo hace
`infra/envs/dev/main.tf`, nunca un modulo llamando a otro.

| Modulo | Variables especificas | Outputs obligatorios |
|---|---|---|
| kms | (ninguna) | `key_arn`, `key_id` |
| s3 | `kms_key_arn`, `bucket_suffix`, `evidence_retention_days` (default 90) | `enrollment_bucket_name`, `enrollment_bucket_arn`, `evidence_bucket_name`, `evidence_bucket_arn` |
| dynamodb | `kms_key_arn` | `students_table_name`, `students_table_arn`, `access_log_table_name`, `access_log_table_arn` |
| rekognition | (ninguna) | `collection_id`, `collection_arn` |
| sns | `kms_key_arn`, `alert_email` (default "", si vacio no crea suscripcion) | `alerts_topic_arn` |
| cognito | (ninguna) | `user_pool_id`, `user_pool_arn`, `user_pool_client_id` |
| iam | `students_table_arn`, `access_log_table_arn`, `enrollment_bucket_arn`, `evidence_bucket_arn`, `collection_arn`, `kms_key_arn`, `alerts_topic_arn` | `access_lambda_role_arn`, `enrollment_lambda_role_arn` |
| lambda | `access_lambda_role_arn`, `enrollment_lambda_role_arn`, `environment_variables` (map(string)) | `access_lambda_name`, `access_lambda_arn`, `access_lambda_invoke_arn`, `enrollment_lambda_name`, `enrollment_lambda_arn`, `enrollment_lambda_invoke_arn` |
| api_gateway | `access_lambda_name`, `access_lambda_invoke_arn`, `enrollment_lambda_name`, `enrollment_lambda_invoke_arn`, `cognito_user_pool_arn` | `api_invoke_url`, `rest_api_id`, `api_key_id` |
| cloudwatch | `access_lambda_name`, `enrollment_lambda_name`, `alerts_topic_arn` | `log_group_names` (map), `alarm_arns` (list) |
| hosting | `bucket_suffix` | `panel_bucket_name`, `cloudfront_distribution_id`, `panel_url` |

## Decisiones de diseño ya tomadas (respetarlas)

- **api_gateway** usa REST API (`aws_api_gateway_*`), no HTTP API, porque AWS
  WAF solo se asocia a REST APIs. Dos rutas: `POST /access` para el kiosco,
  protegida con API key y usage plan; `POST /enrollment` para el panel,
  protegida con authorizer de Cognito.
- **cloudwatch** es el dueño de los log groups `/aws/lambda/<funcion>`
  (retencion 30 dias) y de las alarmas de errores hacia SNS. El modulo lambda
  NO crea log groups.
- **lambda**: runtime `python3.12`, handler `app.handler`, empaquetado con
  `data "archive_file"` desde `${path.root}/../../../backend/src/access_handler/`
  y `${path.root}/../../../backend/src/enrollment_handler/` (`path.root` es
  `infra/envs/dev`, tres niveles arriba esta la raiz del repo).
- **dynamodb**: billing `PAY_PER_REQUEST`. Tabla `students` con hash key
  `student_id` (S). Tabla `access-log` con hash key `event_id` (S) y GSI
  `by-student` (hash `student_id`, range `timestamp`).
- **s3 y dynamodb** cifran con la clave del modulo kms. Buckets con acceso
  publico bloqueado y versionado activo; evidencias con lifecycle de
  expiracion a `evidence_retention_days`.
- **iam**: un rol por funcion Lambda, politicas inline de minimo privilegio
  (solo las acciones y ARNs que esa funcion necesita). Nada de politicas
  administradas amplias tipo `AmazonRekognitionFullAccess`.
- **rekognition**: solo la coleccion de rostros es recurso Terraform. Face
  Liveness es una API en tiempo de ejecucion; sus permisos van en iam.
- **hosting**: S3 privado mas CloudFront con Origin Access Control. Sin
  dominio propio (por confirmar); la URL de CloudFront es el punto de acceso.

## Reglas de estilo y calidad

1. Comentarios y READMEs en español, sin emojis y sin guiones largos.
2. Nada de datos reales inventados: account IDs, ARNs externos, emails y
   presupuestos son variables con placeholder y comentario "por confirmar".
3. Toda variable con `description`; outputs con `description`.
4. `terraform fmt` limpio antes de dar por terminado cualquier archivo.
5. Ningun secreto en el codigo. `terraform.tfvars` esta en `.gitignore`; solo
   se versiona `terraform.tfvars.example`.
6. Si un recurso queda pendiente de decision se deja un comentario
   `# TODO(<tema>): ...` con la pregunta concreta.
