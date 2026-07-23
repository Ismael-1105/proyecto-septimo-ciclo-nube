# Outputs del contrato de interfaces (CONVENTIONS.md). Los consume el modulo
# iam (ARNs para politicas de minimo privilegio) y el modulo lambda via las
# variables de entorno que cablea infra/envs/dev/main.tf.

output "enrollment_bucket_name" {
  description = "Nombre del bucket de imagenes de enrolamiento"
  value       = aws_s3_bucket.enrollment.bucket
}

output "enrollment_bucket_arn" {
  description = "ARN del bucket de imagenes de enrolamiento"
  value       = aws_s3_bucket.enrollment.arn
}

output "evidence_bucket_name" {
  description = "Nombre del bucket de evidencias de eventos"
  value       = aws_s3_bucket.evidence.bucket
}

output "evidence_bucket_arn" {
  description = "ARN del bucket de evidencias de eventos"
  value       = aws_s3_bucket.evidence.arn
}
