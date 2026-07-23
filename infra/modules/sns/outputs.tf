output "alerts_topic_arn" {
  description = "ARN del topic SNS de alertas"
  value       = aws_sns_topic.alerts.arn
}
