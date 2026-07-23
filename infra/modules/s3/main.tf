# Modulo s3: buckets de objetos de imagen del proyecto.
# El informe separa los datos estructurados (DynamoDB) de los objetos de
# imagen (S3): aqui viven las imagenes de enrolamiento y las evidencias.
# Ambos buckets cifran con la clave KMS del modulo kms (var.kms_key_arn);
# el cableado lo hace infra/envs/dev/main.tf, nunca este modulo.

# ---------------------------------------------------------------------------
# Bucket de enrolamiento: imagenes de rostro subidas por el administrador.
# ---------------------------------------------------------------------------

resource "aws_s3_bucket" "enrollment" {
  bucket = "${var.name_prefix}-enrollment-${var.bucket_suffix}"

  tags = var.tags
}

resource "aws_s3_bucket_versioning" "enrollment" {
  bucket = aws_s3_bucket.enrollment.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "enrollment" {
  bucket = aws_s3_bucket.enrollment.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = var.kms_key_arn
    }
  }
}

resource "aws_s3_bucket_public_access_block" "enrollment" {
  bucket = aws_s3_bucket.enrollment.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ---------------------------------------------------------------------------
# Bucket de evidencias: capturas de eventos relevantes (accesos denegados).
# ---------------------------------------------------------------------------

resource "aws_s3_bucket" "evidence" {
  bucket = "${var.name_prefix}-evidence-${var.bucket_suffix}"

  tags = var.tags
}

resource "aws_s3_bucket_versioning" "evidence" {
  bucket = aws_s3_bucket.evidence.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "evidence" {
  bucket = aws_s3_bucket.evidence.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = var.kms_key_arn
    }
  }
}

resource "aws_s3_bucket_public_access_block" "evidence" {
  bucket = aws_s3_bucket.evidence.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Minimizacion de datos biometricos: las evidencias expiran a los
# var.evidence_retention_days dias. Con versionado activo tambien se
# expiran las versiones no vigentes para que no queden copias residuales.
resource "aws_s3_bucket_lifecycle_configuration" "evidence" {
  bucket = aws_s3_bucket.evidence.id

  rule {
    id     = "expire-evidence"
    status = "Enabled"

    filter {}

    expiration {
      days = var.evidence_retention_days
    }

    noncurrent_version_expiration {
      noncurrent_days = var.evidence_retention_days
    }
  }
}
