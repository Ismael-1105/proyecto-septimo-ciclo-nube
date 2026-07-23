# Outputs exactos del contrato de interfaces (CONVENTIONS.md)

output "log_group_names" {
  description = "Nombres de los log groups de las Lambdas, por funcion"
  value = {
    access     = aws_cloudwatch_log_group.access.name
    enrollment = aws_cloudwatch_log_group.enrollment.name
  }
}

output "alarm_arns" {
  description = "ARNs de las alarmas de CloudWatch creadas por el modulo"
  value = [
    aws_cloudwatch_metric_alarm.access_errors.arn,
    aws_cloudwatch_metric_alarm.enrollment_errors.arn,
    aws_cloudwatch_metric_alarm.access_throttles.arn,
  ]
}
