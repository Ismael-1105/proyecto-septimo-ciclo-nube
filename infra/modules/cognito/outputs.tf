# Outputs del contrato de interfaces (nombres literales).

output "user_pool_id" {
  description = "ID del user pool de administradores"
  value       = aws_cognito_user_pool.admins.id
}

output "user_pool_arn" {
  description = "ARN del user pool, usado por el authorizer de API Gateway"
  value       = aws_cognito_user_pool.admins.arn
}

output "user_pool_client_id" {
  description = "ID del cliente del panel web (sin secret)"
  value       = aws_cognito_user_pool_client.panel.id
}
