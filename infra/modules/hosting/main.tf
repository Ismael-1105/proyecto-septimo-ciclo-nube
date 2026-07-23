# Modulo hosting: alojamiento del panel web de administracion como sitio
# estatico. El informe da a elegir entre Amplify y CloudFront con S3; el
# contrato (CONVENTIONS.md) fija S3 privado mas CloudFront con Origin Access
# Control, sin dominio propio (por confirmar): la URL de la distribucion es
# el punto de acceso al panel.

# ---------------------------------------------------------------------------
# Bucket del panel: contiene el build estatico (HTML, JS, CSS) de la SPA.
# Cifrado SSE-S3 (AES256): es contenido estatico publico de la aplicacion,
# no datos biometricos, por lo que no requiere la clave KMS del proyecto.
# ---------------------------------------------------------------------------

resource "aws_s3_bucket" "panel" {
  bucket = "${var.name_prefix}-panel-${var.bucket_suffix}"

  tags = var.tags
}

resource "aws_s3_bucket_server_side_encryption_configuration" "panel" {
  bucket = aws_s3_bucket.panel.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "panel" {
  bucket = aws_s3_bucket.panel.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ---------------------------------------------------------------------------
# Origin Access Control: CloudFront firma con SigV4 sus peticiones al bucket,
# de modo que el bucket permanece privado y solo la distribucion puede leerlo.
# ---------------------------------------------------------------------------

resource "aws_cloudfront_origin_access_control" "panel" {
  name                              = "${var.name_prefix}-panel-oac"
  description                       = "Acceso de CloudFront al bucket privado del panel"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# ---------------------------------------------------------------------------
# Distribucion CloudFront: sirve la SPA por HTTPS con el certificado por
# defecto de CloudFront (sin dominio propio, por confirmar). Los errores 403
# y 404 del origen se redirigen a /index.html con codigo 200 porque el
# enrutamiento de la SPA se resuelve en el cliente.
# ---------------------------------------------------------------------------

resource "aws_cloudfront_distribution" "panel" {
  enabled             = true
  comment             = "${var.name_prefix}-panel"
  default_root_object = "index.html"
  price_class         = "PriceClass_100"

  origin {
    domain_name              = aws_s3_bucket.panel.bucket_regional_domain_name
    origin_id                = "s3-panel"
    origin_access_control_id = aws_cloudfront_origin_access_control.panel.id
  }

  default_cache_behavior {
    target_origin_id       = "s3-panel"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }
  }

  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = var.tags
}

# ---------------------------------------------------------------------------
# Politica del bucket: solo el service principal de CloudFront puede hacer
# GetObject, y unicamente cuando la peticion proviene de esta distribucion
# (condicion sobre el ARN de la distribucion via aws:SourceArn).
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "panel" {
  statement {
    sid     = "AllowCloudFrontServicePrincipalReadOnly"
    effect  = "Allow"
    actions = ["s3:GetObject"]

    resources = ["${aws_s3_bucket.panel.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.panel.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "panel" {
  bucket = aws_s3_bucket.panel.id
  policy = data.aws_iam_policy_document.panel.json

  # La politica referencia el ARN de la distribucion, por lo que debe
  # aplicarse despues del public access block (permite politicas de bucket
  # solo de service principals, no publicas).
  depends_on = [aws_s3_bucket_public_access_block.panel]
}
