# Variables del modulo iam. Las comunes (name_prefix, tags) las exige el
# contrato de CONVENTIONS.md; las especificas son ARNs que llegan cableados
# desde los otros modulos a traves de infra/envs/dev/main.tf.

variable "name_prefix" {
  description = "Prefijo de nombres, formato proyecto-entorno (ej. afl-dev)"
  type        = string
}

variable "tags" {
  description = "Tags comunes aplicados a todos los recursos"
  type        = map(string)
}

variable "students_table_arn" {
  description = "ARN de la tabla DynamoDB de estudiantes (modulo dynamodb)"
  type        = string
}

variable "access_log_table_arn" {
  description = "ARN de la tabla DynamoDB de registro de accesos (modulo dynamodb)"
  type        = string
}

variable "enrollment_bucket_arn" {
  description = "ARN del bucket S3 de fotos de enrolamiento (modulo s3)"
  type        = string
}

variable "evidence_bucket_arn" {
  description = "ARN del bucket S3 de evidencias de acceso (modulo s3)"
  type        = string
}

variable "collection_arn" {
  description = "ARN de la coleccion de rostros de Rekognition (modulo rekognition)"
  type        = string
}

variable "kms_key_arn" {
  description = "ARN de la clave KMS del proyecto (modulo kms)"
  type        = string
}

variable "alerts_topic_arn" {
  description = "ARN del topico SNS de alertas (modulo sns)"
  type        = string
}
