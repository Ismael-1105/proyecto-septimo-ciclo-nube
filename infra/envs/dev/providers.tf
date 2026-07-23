provider "aws" {
  # Region fija del proyecto: us-east-1 por disponibilidad de Rekognition
  # Face Liveness (ver CONVENTIONS.md).
  region = var.aws_region
}
