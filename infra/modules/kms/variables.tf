# Variables comunes del contrato (CONVENTIONS.md). El modulo kms no
# recibe variables especificas.

variable "name_prefix" {
  description = "Prefijo de nombres, formato proyecto-entorno (ej. afl-dev)"
  type        = string
}

variable "tags" {
  description = "Tags comunes aplicados a todos los recursos"
  type        = map(string)
}
