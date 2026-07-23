# Modulo cloudwatch: observabilidad de las funciones Lambda.
# Este modulo es el dueño de los log groups /aws/lambda/<funcion>
# (el modulo lambda NO los crea, segun CONVENTIONS.md) y de las
# alarmas de errores y throttles que notifican al topic SNS de alertas.

# Log group de la funcion de acceso. Retencion limitada a 30 dias
# por minimizacion de datos.
resource "aws_cloudwatch_log_group" "access" {
  name              = "/aws/lambda/${var.access_lambda_name}"
  retention_in_days = 30

  tags = var.tags
}

# Log group de la funcion de enrolamiento. Misma retencion.
resource "aws_cloudwatch_log_group" "enrollment" {
  name              = "/aws/lambda/${var.enrollment_lambda_name}"
  retention_in_days = 30

  tags = var.tags
}

# Alarma de errores de la funcion de acceso: un error o mas en 5 minutos
# dispara notificacion al topic de alertas.
resource "aws_cloudwatch_metric_alarm" "access_errors" {
  alarm_name          = "${var.name_prefix}-access-errors"
  alarm_description   = "Errores en la Lambda de acceso (1 o mas en 5 minutos)"
  namespace           = "AWS/Lambda"
  metric_name         = "Errors"
  statistic           = "Sum"
  period              = 300
  evaluation_periods  = 1
  threshold           = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = var.access_lambda_name
  }

  alarm_actions = [var.alerts_topic_arn]

  tags = var.tags
}

# Alarma de errores de la funcion de enrolamiento.
resource "aws_cloudwatch_metric_alarm" "enrollment_errors" {
  alarm_name          = "${var.name_prefix}-enrollment-errors"
  alarm_description   = "Errores en la Lambda de enrolamiento (1 o mas en 5 minutos)"
  namespace           = "AWS/Lambda"
  metric_name         = "Errors"
  statistic           = "Sum"
  period              = 300
  evaluation_periods  = 1
  threshold           = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = var.enrollment_lambda_name
  }

  alarm_actions = [var.alerts_topic_arn]

  tags = var.tags
}

# Alarma de throttles de la funcion de acceso. Es la funcion critica:
# si se estrangula, la puerta del laboratorio no abre.
resource "aws_cloudwatch_metric_alarm" "access_throttles" {
  alarm_name          = "${var.name_prefix}-access-throttles"
  alarm_description   = "Throttles en la Lambda de acceso (funcion critica de apertura de puerta)"
  namespace           = "AWS/Lambda"
  metric_name         = "Throttles"
  statistic           = "Sum"
  period              = 300
  evaluation_periods  = 1
  threshold           = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = var.access_lambda_name
  }

  alarm_actions = [var.alerts_topic_arn]

  tags = var.tags
}
