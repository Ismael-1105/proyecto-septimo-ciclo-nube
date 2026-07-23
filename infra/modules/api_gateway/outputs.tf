output "api_invoke_url" {
  description = "URL de invocacion del stage dev (base para /access y /enrollment)"
  value       = aws_api_gateway_stage.dev.invoke_url
}

output "rest_api_id" {
  description = "ID de la REST API de API Gateway"
  value       = aws_api_gateway_rest_api.this.id
}

output "api_key_id" {
  description = "ID de la API key del kiosco (el valor se recupera con la CLI, no se versiona)"
  value       = aws_api_gateway_api_key.kiosk.id
}
