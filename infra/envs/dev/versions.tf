# Unico lugar del repo donde se declaran versiones y providers (ver CONVENTIONS.md).
terraform {
  required_version = ">= 1.9.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    # Requerido por el modulo lambda (empaquetado con data "archive_file").
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }

  # TODO(backend-remoto): cuando el grupo tenga cuenta AWS definitiva, migrar el
  # estado a un backend s3 con bloqueo (bucket y tabla por confirmar). Mientras
  # tanto el estado es local y NUNCA se versiona (ya cubierto por .gitignore).
}
