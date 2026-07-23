# Entorno dev: cablea los modulos entre si segun el contrato de interfaces
# de infra/CONVENTIONS.md. Los modulos nunca se llaman entre ellos; todo pasa
# por este archivo.

locals {
  # Slug del proyecto: afl (Acceso Facial Lab). Prefijo de todo recurso.
  name_prefix = "afl-${var.environment}"

  tags = {
    Project     = "acceso-facial-lab"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# Capa de seguridad: clave de cifrado en reposo (datos biometricos, LOPDP).
module "kms" {
  source      = "../../modules/kms"
  name_prefix = local.name_prefix
  tags        = local.tags
}

# Capa de datos: imagenes de enrolamiento y evidencias.
module "s3" {
  source                  = "../../modules/s3"
  name_prefix             = local.name_prefix
  tags                    = local.tags
  kms_key_arn             = module.kms.key_arn
  bucket_suffix           = var.bucket_suffix
  evidence_retention_days = var.evidence_retention_days
}

# Capa de datos: catalogo de estudiantes y bitacora de accesos.
module "dynamodb" {
  source      = "../../modules/dynamodb"
  name_prefix = local.name_prefix
  tags        = local.tags
  kms_key_arn = module.kms.key_arn
}

# Capa de reconocimiento: coleccion de rostros (identificacion 1:N).
module "rekognition" {
  source      = "../../modules/rekognition"
  name_prefix = local.name_prefix
  tags        = local.tags
}

# Notificaciones a responsables (accesos denegados, anomalias, alarmas).
module "sns" {
  source      = "../../modules/sns"
  name_prefix = local.name_prefix
  tags        = local.tags
  kms_key_arn = module.kms.key_arn
  alert_email = var.alert_email
}

# Identidad de administradores del panel.
module "cognito" {
  source      = "../../modules/cognito"
  name_prefix = local.name_prefix
  tags        = local.tags
}

# Minimo privilegio: un rol por funcion Lambda, acotado a estos ARNs.
module "iam" {
  source                = "../../modules/iam"
  name_prefix           = local.name_prefix
  tags                  = local.tags
  students_table_arn    = module.dynamodb.students_table_arn
  access_log_table_arn  = module.dynamodb.access_log_table_arn
  enrollment_bucket_arn = module.s3.enrollment_bucket_arn
  evidence_bucket_arn   = module.s3.evidence_bucket_arn
  collection_arn        = module.rekognition.collection_arn
  kms_key_arn           = module.kms.key_arn
  alerts_topic_arn      = module.sns.alerts_topic_arn
}

# Capa de computo: orquestacion del acceso y enrolamiento.
module "lambda" {
  source                     = "../../modules/lambda"
  name_prefix                = local.name_prefix
  tags                       = local.tags
  access_lambda_role_arn     = module.iam.access_lambda_role_arn
  enrollment_lambda_role_arn = module.iam.enrollment_lambda_role_arn

  environment_variables = {
    COLLECTION_ID        = module.rekognition.collection_id
    STUDENTS_TABLE       = module.dynamodb.students_table_name
    ACCESS_LOG_TABLE     = module.dynamodb.access_log_table_name
    ENROLLMENT_BUCKET    = module.s3.enrollment_bucket_name
    EVIDENCE_BUCKET      = module.s3.evidence_bucket_name
    ALERTS_TOPIC_ARN     = module.sns.alerts_topic_arn
    SIMILARITY_THRESHOLD = var.similarity_threshold
  }
}

# Capa de ingreso: REST API con WAF, API key para el kiosco y Cognito para el panel.
module "api_gateway" {
  source                       = "../../modules/api_gateway"
  name_prefix                  = local.name_prefix
  tags                         = local.tags
  access_lambda_name           = module.lambda.access_lambda_name
  access_lambda_invoke_arn     = module.lambda.access_lambda_invoke_arn
  enrollment_lambda_name       = module.lambda.enrollment_lambda_name
  enrollment_lambda_invoke_arn = module.lambda.enrollment_lambda_invoke_arn
  cognito_user_pool_arn        = module.cognito.user_pool_arn
}

# Observabilidad: log groups (dueño segun contrato) y alarmas hacia SNS.
module "cloudwatch" {
  source                 = "../../modules/cloudwatch"
  name_prefix            = local.name_prefix
  tags                   = local.tags
  access_lambda_name     = module.lambda.access_lambda_name
  enrollment_lambda_name = module.lambda.enrollment_lambda_name
  alerts_topic_arn       = module.sns.alerts_topic_arn
}

# Panel de administracion: sitio estatico privado tras CloudFront.
module "hosting" {
  source        = "../../modules/hosting"
  name_prefix   = local.name_prefix
  tags          = local.tags
  bucket_suffix = var.bucket_suffix
}
