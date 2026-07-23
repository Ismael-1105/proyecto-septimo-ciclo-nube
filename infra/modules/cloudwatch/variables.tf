# Variables comunes (obligatorias en todo modulo segun CONVENTIONS.md)

variable "name_prefix" {
  description = "Prefijo de nombres, formato proyecto-entorno (ej. afl-dev)"
  type        = string
}

variable "tags" {
  description = "Tags comunes aplicados a todos los recursos"
  type        = map(string)
}

# Variables especificas del modulo

variable "access_lambda_name" {
  description = "Nombre de la funcion Lambda de acceso (salida del modulo lambda)"
  type        = string
}

variable "enrollment_lambda_name" {
  description = "Nombre de la funcion Lambda de enrolamiento (salida del modulo lambda)"
  type        = string
}

variable "alerts_topic_arn" {
  description = "ARN del topic SNS de alertas (salida del modulo sns)"
  type        = string
}
