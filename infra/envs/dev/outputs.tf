# Valores que el equipo necesita despues del apply.

output "api_invoke_url" {
  description = "URL base del API (rutas POST /access y POST /enrollment)"
  value       = module.api_gateway.api_invoke_url
}

output "api_key_id" {
  description = "ID de la API key del kiosco (el valor se recupera con: aws apigateway get-api-key --include-value)"
  value       = module.api_gateway.api_key_id
}

output "panel_url" {
  description = "URL del panel de administracion (CloudFront)"
  value       = module.hosting.panel_url
}

output "panel_bucket_name" {
  description = "Bucket donde se sube el build del panel"
  value       = module.hosting.panel_bucket_name
}

output "collection_id" {
  description = "Coleccion de rostros de Rekognition"
  value       = module.rekognition.collection_id
}

output "students_table_name" {
  description = "Tabla de estudiantes"
  value       = module.dynamodb.students_table_name
}

output "access_log_table_name" {
  description = "Tabla bitacora de accesos"
  value       = module.dynamodb.access_log_table_name
}

output "user_pool_id" {
  description = "User pool de administradores (para crear usuarios y configurar el panel)"
  value       = module.cognito.user_pool_id
}

output "user_pool_client_id" {
  description = "Client id del panel web"
  value       = module.cognito.user_pool_client_id
}

output "alerts_topic_arn" {
  description = "Topic SNS de alertas"
  value       = module.sns.alerts_topic_arn
}
