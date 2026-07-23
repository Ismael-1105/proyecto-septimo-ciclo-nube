# Modulo lambda: funciones de acceso y de enrolamiento en Python.
# Los roles IAM llegan por variable desde el modulo iam y los log groups
# los crea el modulo cloudwatch, segun el contrato de CONVENTIONS.md.

# Empaquetado de la funcion de acceso desde el codigo fuente del backend.
# El zip se genera en builds/, carpeta excluida por .gitignore.
data "archive_file" "access" {
  type        = "zip"
  source_dir  = "${path.root}/../../../backend/src/access_handler"
  output_path = "${path.module}/builds/access.zip"
}

# Empaquetado de la funcion de enrolamiento.
data "archive_file" "enrollment" {
  type        = "zip"
  source_dir  = "${path.root}/../../../backend/src/enrollment_handler"
  output_path = "${path.module}/builds/enrollment.zip"
}

# Funcion de acceso: orquesta el flujo de la puerta (liveness,
# SearchFacesByImage sobre la coleccion, consulta de autorizacion en
# DynamoDB, registro en la bitacora y respuesta al kiosco).
resource "aws_lambda_function" "access" {
  function_name = "${var.name_prefix}-access"
  role          = var.access_lambda_role_arn

  filename         = data.archive_file.access.output_path
  source_code_hash = data.archive_file.access.output_base64sha256

  runtime       = "python3.12"
  handler       = "app.handler"
  timeout       = 30
  memory_size   = 256
  architectures = ["arm64"]

  environment {
    variables = var.environment_variables
  }

  tags = var.tags
}

# Funcion de enrolamiento: registra estudiantes (IndexFaces sobre la
# coleccion de Rekognition y alta del item en la tabla students).
resource "aws_lambda_function" "enrollment" {
  function_name = "${var.name_prefix}-enrollment"
  role          = var.enrollment_lambda_role_arn

  filename         = data.archive_file.enrollment.output_path
  source_code_hash = data.archive_file.enrollment.output_base64sha256

  runtime       = "python3.12"
  handler       = "app.handler"
  timeout       = 30
  memory_size   = 256
  architectures = ["arm64"]

  environment {
    variables = var.environment_variables
  }

  tags = var.tags
}
