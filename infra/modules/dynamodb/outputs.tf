# Outputs del modulo dynamodb segun el contrato de interfaces.

output "students_table_name" {
  description = "Nombre de la tabla de estudiantes"
  value       = aws_dynamodb_table.students.name
}

output "students_table_arn" {
  description = "ARN de la tabla de estudiantes"
  value       = aws_dynamodb_table.students.arn
}

output "access_log_table_name" {
  description = "Nombre de la tabla de bitacora de accesos"
  value       = aws_dynamodb_table.access_log.name
}

output "access_log_table_arn" {
  description = "ARN de la tabla de bitacora de accesos"
  value       = aws_dynamodb_table.access_log.arn
}
