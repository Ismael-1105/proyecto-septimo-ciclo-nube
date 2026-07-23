# Outputs del modulo iam, exactamente los del contrato de interfaces.

output "access_lambda_role_arn" {
  description = "ARN del rol de ejecucion de la Lambda de acceso"
  value       = aws_iam_role.access.arn
}

output "enrollment_lambda_role_arn" {
  description = "ARN del rol de ejecucion de la Lambda de enrolamiento"
  value       = aws_iam_role.enrollment.arn
}
