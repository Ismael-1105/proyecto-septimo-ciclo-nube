# Variables del modulo lambda.

variable "name_prefix" {
  description = "Prefijo de nombres, formato proyecto-entorno (ej. afl-dev)"
  type        = string
}

variable "tags" {
  description = "Tags comunes aplicados a todos los recursos"
  type        = map(string)
}

variable "access_lambda_role_arn" {
  description = "ARN del rol IAM de la funcion de acceso, provisto por el modulo iam"
  type        = string
}

variable "enrollment_lambda_role_arn" {
  description = "ARN del rol IAM de la funcion de enrolamiento, provisto por el modulo iam"
  type        = string
}

variable "environment_variables" {
  description = "Variables de entorno compartidas por ambas funciones: COLLECTION_ID, STUDENTS_TABLE, ACCESS_LOG_TABLE, ENROLLMENT_BUCKET, EVIDENCE_BUCKET, ALERTS_TOPIC_ARN y SIMILARITY_THRESHOLD"
  type        = map(string)
}
