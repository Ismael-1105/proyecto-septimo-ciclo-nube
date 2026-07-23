# Outputs obligatorios segun el contrato de interfaces (CONVENTIONS.md).

output "key_arn" {
  description = "ARN de la clave KMS, lo consumen s3, dynamodb y sns para cifrado en reposo"
  value       = aws_kms_key.main.arn
}

output "key_id" {
  description = "ID de la clave KMS"
  value       = aws_kms_key.main.key_id
}
