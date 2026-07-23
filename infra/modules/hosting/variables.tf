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

variable "bucket_suffix" {
  description = "Sufijo para garantizar unicidad global del nombre del bucket del panel (placeholder, valor real por confirmar)"
  type        = string
}
