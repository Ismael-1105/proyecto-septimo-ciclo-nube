# Variables comunes del contrato (CONVENTIONS.md).

variable "name_prefix" {
  description = "Prefijo de nombres, formato proyecto-entorno (ej. afl-dev)"
  type        = string
}

variable "tags" {
  description = "Tags comunes aplicados a todos los recursos"
  type        = map(string)
}

# Variables especificas del modulo.

variable "kms_key_arn" {
  description = "ARN de la clave KMS usada para cifrar el topic"
  type        = string
}

variable "alert_email" {
  description = "correo del responsable, por confirmar"
  type        = string
  default     = ""
}
