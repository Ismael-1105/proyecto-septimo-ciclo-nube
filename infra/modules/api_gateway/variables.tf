variable "name_prefix" {
  description = "Prefijo de nombres, formato proyecto-entorno (ej. afl-dev)"
  type        = string
}

variable "tags" {
  description = "Tags comunes aplicados a todos los recursos"
  type        = map(string)
}

variable "access_lambda_name" {
  description = "Nombre de la funcion Lambda de acceso (para el permiso de invocacion)"
  type        = string
}

variable "access_lambda_invoke_arn" {
  description = "Invoke ARN de la Lambda de acceso para la integracion AWS_PROXY de POST /access"
  type        = string
}

variable "enrollment_lambda_name" {
  description = "Nombre de la funcion Lambda de enrolamiento (para el permiso de invocacion)"
  type        = string
}

variable "enrollment_lambda_invoke_arn" {
  description = "Invoke ARN de la Lambda de enrolamiento para la integracion AWS_PROXY de POST /enrollment"
  type        = string
}

variable "cognito_user_pool_arn" {
  description = "ARN del user pool de Cognito que respalda al authorizer de POST /enrollment"
  type        = string
}
