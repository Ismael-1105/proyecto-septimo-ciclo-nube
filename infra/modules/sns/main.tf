# Modulo sns: topic de alertas del proyecto Acceso Facial Lab.
# Recibe alertas de accesos denegados, personas no reconocidas y
# alarmas de CloudWatch. El cableado con otros modulos lo hace
# infra/envs/dev/main.tf.

resource "aws_sns_topic" "alerts" {
  name              = "${var.name_prefix}-alertas"
  kms_master_key_id = var.kms_key_arn

  tags = var.tags
}

# Suscripcion por correo del responsable. Solo se crea si alert_email
# no esta vacio. La confirmacion es manual desde el buzon del destinatario.
resource "aws_sns_topic_subscription" "alert_email" {
  count = var.alert_email != "" ? 1 : 0

  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}
