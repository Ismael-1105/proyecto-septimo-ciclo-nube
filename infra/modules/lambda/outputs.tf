# Outputs del modulo lambda segun el contrato de interfaces.

output "access_lambda_name" {
  description = "Nombre de la funcion de acceso"
  value       = aws_lambda_function.access.function_name
}

output "access_lambda_arn" {
  description = "ARN de la funcion de acceso"
  value       = aws_lambda_function.access.arn
}

output "access_lambda_invoke_arn" {
  description = "ARN de invocacion de la funcion de acceso para API Gateway"
  value       = aws_lambda_function.access.invoke_arn
}

output "enrollment_lambda_name" {
  description = "Nombre de la funcion de enrolamiento"
  value       = aws_lambda_function.enrollment.function_name
}

output "enrollment_lambda_arn" {
  description = "ARN de la funcion de enrolamiento"
  value       = aws_lambda_function.enrollment.arn
}

output "enrollment_lambda_invoke_arn" {
  description = "ARN de invocacion de la funcion de enrolamiento para API Gateway"
  value       = aws_lambda_function.enrollment.invoke_arn
}
