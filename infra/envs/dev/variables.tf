variable "aws_region" {
  description = "Region AWS del despliegue (fija por Face Liveness)"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Nombre del entorno"
  type        = string
  default     = "dev"
}

variable "bucket_suffix" {
  description = "Sufijo para unicidad global de buckets S3 (por confirmar con el grupo, ej. iniciales mas numero de cuenta corto)"
  type        = string
}

variable "alert_email" {
  description = "Correo del responsable que recibe alertas SNS (por confirmar; vacio = sin suscripcion)"
  type        = string
  default     = ""
}

variable "similarity_threshold" {
  description = "Umbral de similitud facial para conceder acceso (el informe fija el orden del 95 al 99 por ciento)"
  type        = string
  default     = "95"
}

variable "evidence_retention_days" {
  description = "Dias de retencion de evidencias en S3 antes de expirar (minimizacion de datos biometricos)"
  type        = number
  default     = 90
}
