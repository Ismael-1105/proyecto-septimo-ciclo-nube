# Modulo dynamodb: tablas de estudiantes y bitacora de accesos.
# Billing PAY_PER_REQUEST y cifrado con la clave KMS del modulo kms,
# segun el contrato de CONVENTIONS.md.

# Catalogo de estudiantes: estado de habilitacion, horarios permitidos
# y face_id de la coleccion de Rekognition. Solo se declaran los
# atributos que participan en claves; el resto del item es libre.
resource "aws_dynamodb_table" "students" {
  name         = "${var.name_prefix}-students"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "student_id"

  attribute {
    name = "student_id"
    type = "S"
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = var.kms_key_arn
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = var.tags
}

# Bitacora de accesos: un item por evento con identidad, marca temporal,
# resultado (concedido o denegado) y porcentaje de similitud. El GSI
# by-student permite consultar el historial de un estudiante ordenado
# por fecha.
resource "aws_dynamodb_table" "access_log" {
  name         = "${var.name_prefix}-access-log"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "event_id"

  attribute {
    name = "event_id"
    type = "S"
  }

  attribute {
    name = "student_id"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "S"
  }

  global_secondary_index {
    name            = "by-student"
    hash_key        = "student_id"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = var.kms_key_arn
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = var.tags
}
