# Variables del modulo dynamodb.

variable "name_prefix" {
  description = "Prefijo de nombres, formato proyecto-entorno (ej. afl-dev)"
  type        = string
}

variable "tags" {
  description = "Tags comunes aplicados a todos los recursos"
  type        = map(string)
}

variable "kms_key_arn" {
  description = "ARN de la clave KMS del modulo kms para el cifrado de las tablas"
  type        = string
}
