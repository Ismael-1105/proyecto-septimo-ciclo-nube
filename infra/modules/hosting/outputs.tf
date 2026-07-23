# Outputs del contrato de interfaces (CONVENTIONS.md). El nombre del bucket
# y el ID de la distribucion se usan en el despliegue del build del panel
# (aws s3 sync mas invalidacion); la URL es el punto de acceso al panel.

output "panel_bucket_name" {
  description = "Nombre del bucket que aloja el build estatico del panel"
  value       = aws_s3_bucket.panel.bucket
}

output "cloudfront_distribution_id" {
  description = "ID de la distribucion CloudFront que sirve el panel"
  value       = aws_cloudfront_distribution.panel.id
}

output "panel_url" {
  description = "URL HTTPS del panel de administracion (dominio de CloudFront)"
  value       = "https://${aws_cloudfront_distribution.panel.domain_name}"
}
