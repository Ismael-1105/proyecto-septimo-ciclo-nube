# Modulo iam: roles de ejecucion para las funciones Lambda del proyecto.
# Un rol por funcion, con politicas inline de minimo privilegio: cada funcion
# recibe solo las acciones y los ARNs que necesita. No se usan politicas
# administradas amplias; los permisos de logs equivalen en inline a
# AWSLambdaBasicExecutionRole (sin CreateLogGroup, porque los log groups
# los crea y administra el modulo cloudwatch).

# Politica de confianza comun: solo el servicio Lambda puede asumir los roles.
data "aws_iam_policy_document" "lambda_assume" {
  statement {
    sid     = "LambdaAssumeRole"
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

# ---------------------------------------------------------------------------
# Rol 1: funcion de acceso (kiosco). Verifica rostros contra la coleccion,
# consulta estudiantes, registra eventos, guarda evidencias y publica alertas.
# ---------------------------------------------------------------------------

resource "aws_iam_role" "access" {
  name               = "${var.name_prefix}-access-lambda"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
  tags               = var.tags
}

data "aws_iam_policy_document" "access" {
  statement {
    sid       = "RekognitionSearchFaces"
    effect    = "Allow"
    actions   = ["rekognition:SearchFacesByImage"]
    resources = [var.collection_arn]
  }

  # Las sesiones de Face Liveness se crean en tiempo de ejecucion y no tienen
  # un ARN previo que se pueda acotar, por eso el Resource es "*".
  statement {
    sid    = "RekognitionFaceLiveness"
    effect = "Allow"
    actions = [
      "rekognition:CreateFaceLivenessSession",
      "rekognition:GetFaceLivenessSessionResults",
    ]
    resources = ["*"]
  }

  statement {
    sid       = "DynamoDbReadStudents"
    effect    = "Allow"
    actions   = ["dynamodb:GetItem"]
    resources = [var.students_table_arn]
  }

  statement {
    sid       = "DynamoDbWriteAccessLog"
    effect    = "Allow"
    actions   = ["dynamodb:PutItem"]
    resources = [var.access_log_table_arn]
  }

  statement {
    sid       = "DynamoDbQueryAccessLogIndexes"
    effect    = "Allow"
    actions   = ["dynamodb:Query"]
    resources = ["${var.access_log_table_arn}/index/*"]
  }

  statement {
    sid       = "S3PutEvidence"
    effect    = "Allow"
    actions   = ["s3:PutObject"]
    resources = ["${var.evidence_bucket_arn}/*"]
  }

  statement {
    sid       = "SnsPublishAlerts"
    effect    = "Allow"
    actions   = ["sns:Publish"]
    resources = [var.alerts_topic_arn]
  }

  statement {
    sid    = "KmsUseProjectKey"
    effect = "Allow"
    actions = [
      "kms:Decrypt",
      "kms:GenerateDataKey",
    ]
    resources = [var.kms_key_arn]
  }

  # Equivalente inline de AWSLambdaBasicExecutionRole para escribir logs.
  statement {
    sid    = "CloudWatchLogsWrite"
    effect = "Allow"
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "access" {
  name   = "${var.name_prefix}-access-lambda-policy"
  role   = aws_iam_role.access.id
  policy = data.aws_iam_policy_document.access.json
}

# ---------------------------------------------------------------------------
# Rol 2: funcion de enrolamiento (panel). Indexa y elimina rostros de la
# coleccion, mantiene la tabla de estudiantes y lee las fotos de enrolamiento.
# ---------------------------------------------------------------------------

resource "aws_iam_role" "enrollment" {
  name               = "${var.name_prefix}-enrollment-lambda"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
  tags               = var.tags
}

data "aws_iam_policy_document" "enrollment" {
  statement {
    sid    = "RekognitionManageFaces"
    effect = "Allow"
    actions = [
      "rekognition:IndexFaces",
      "rekognition:DeleteFaces",
    ]
    resources = [var.collection_arn]
  }

  statement {
    sid    = "DynamoDbManageStudents"
    effect = "Allow"
    actions = [
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:GetItem",
    ]
    resources = [var.students_table_arn]
  }

  statement {
    sid    = "S3EnrollmentObjects"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
    ]
    resources = ["${var.enrollment_bucket_arn}/*"]
  }

  statement {
    sid    = "KmsUseProjectKey"
    effect = "Allow"
    actions = [
      "kms:Decrypt",
      "kms:GenerateDataKey",
    ]
    resources = [var.kms_key_arn]
  }

  # Equivalente inline de AWSLambdaBasicExecutionRole para escribir logs.
  statement {
    sid    = "CloudWatchLogsWrite"
    effect = "Allow"
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "enrollment" {
  name   = "${var.name_prefix}-enrollment-lambda-policy"
  role   = aws_iam_role.enrollment.id
  policy = data.aws_iam_policy_document.enrollment.json
}
