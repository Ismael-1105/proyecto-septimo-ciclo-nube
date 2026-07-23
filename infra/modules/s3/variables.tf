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
  description = "ARN de la clave KMS del modulo kms para el cifrado SSE-KMS de ambos buckets"
  type        = string
}

variable "bucket_suffix" {
  description = "Sufijo para garantizar unicidad global del nombre de los buckets (placeholder, valor real por confirmar)"
  type        = string
}

variable "evidence_retention_days" {
  description = "Dias de retencion de las capturas en el bucket de evidencias antes de expirar (minimizacion de datos biometricos)"
  type        = number
  default     = 90
}
