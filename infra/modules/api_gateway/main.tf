# Modulo api_gateway: punto de entrada unico de la solucion. Expone la API
# gestionada que consume el kiosco de la puerta (POST /access, con API key y
# usage plan) y el panel de administracion (POST /enrollment, con authorizer
# de Cognito). Se usa REST API y no HTTP API porque AWS WAF solo se asocia a
# REST APIs.

resource "aws_api_gateway_rest_api" "this" {
  name        = "${var.name_prefix}-api"
  description = "API de control de acceso facial al laboratorio"

  # Endpoint regional: la solucion vive en una sola region (us-east-1) y no
  # necesita la distribucion edge del tipo EDGE.
  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = var.tags
}

# ---------------------------------------------------------------------------
# Ruta POST /access: la consume el kiosco de la puerta. Se protege con API
# key porque el kiosco es un dispositivo, no un usuario humano con sesion.
# ---------------------------------------------------------------------------

resource "aws_api_gateway_resource" "access" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_rest_api.this.root_resource_id
  path_part   = "access"
}

resource "aws_api_gateway_method" "access_post" {
  rest_api_id      = aws_api_gateway_rest_api.this.id
  resource_id      = aws_api_gateway_resource.access.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = true
}

# Integracion proxy: API Gateway pasa la peticion completa a la Lambda de
# acceso y devuelve su respuesta sin transformaciones.
resource "aws_api_gateway_integration" "access_post" {
  rest_api_id             = aws_api_gateway_rest_api.this.id
  resource_id             = aws_api_gateway_resource.access.id
  http_method             = aws_api_gateway_method.access_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.access_lambda_invoke_arn
}

# ---------------------------------------------------------------------------
# Ruta POST /enrollment: la consume el panel de administracion. Se protege
# con el user pool de Cognito, de modo que solo administradores autenticados
# pueden registrar estudiantes.
# ---------------------------------------------------------------------------

resource "aws_api_gateway_authorizer" "cognito" {
  name            = "${var.name_prefix}-cognito"
  rest_api_id     = aws_api_gateway_rest_api.this.id
  type            = "COGNITO_USER_POOLS"
  provider_arns   = [var.cognito_user_pool_arn]
  identity_source = "method.request.header.Authorization"
}

resource "aws_api_gateway_resource" "enrollment" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_rest_api.this.root_resource_id
  path_part   = "enrollment"
}

resource "aws_api_gateway_method" "enrollment_post" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.enrollment.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "enrollment_post" {
  rest_api_id             = aws_api_gateway_rest_api.this.id
  resource_id             = aws_api_gateway_resource.enrollment.id
  http_method             = aws_api_gateway_method.enrollment_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.enrollment_lambda_invoke_arn
}

# ---------------------------------------------------------------------------
# Deployment y stage. El trigger con sha1 fuerza la recreacion del deployment
# cuando cambia cualquier ruta, metodo, integracion o el authorizer; sin esto
# API Gateway seguiria sirviendo la configuracion vieja.
# ---------------------------------------------------------------------------

resource "aws_api_gateway_deployment" "this" {
  rest_api_id = aws_api_gateway_rest_api.this.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.access.id,
      aws_api_gateway_method.access_post.id,
      aws_api_gateway_integration.access_post.id,
      aws_api_gateway_resource.enrollment.id,
      aws_api_gateway_method.enrollment_post.id,
      aws_api_gateway_integration.enrollment_post.id,
      aws_api_gateway_authorizer.cognito.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "dev" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  deployment_id = aws_api_gateway_deployment.this.id
  stage_name    = "dev"

  tags = var.tags
}

# ---------------------------------------------------------------------------
# API key y usage plan del kiosco. El usage plan aplica control de tasa
# (throttle) y cuota diaria para que un kiosco comprometido o con fallas no
# genere costos ni carga descontrolada.
# ---------------------------------------------------------------------------

resource "aws_api_gateway_api_key" "kiosk" {
  name        = "${var.name_prefix}-kiosk"
  description = "API key del kiosco de la puerta para POST /access"

  tags = var.tags
}

resource "aws_api_gateway_usage_plan" "kiosk" {
  name        = "${var.name_prefix}-kiosk"
  description = "Plan de uso del kiosco: throttle moderado y cuota diaria"

  api_stages {
    api_id = aws_api_gateway_rest_api.this.id
    stage  = aws_api_gateway_stage.dev.stage_name
  }

  # Throttle moderado: un kiosco fisico no supera unas pocas peticiones por
  # segundo en operacion normal.
  throttle_settings {
    rate_limit  = 10
    burst_limit = 20
  }

  # Cuota diaria razonable para un laboratorio; ajustable segun el uso real
  # observado en CloudWatch.
  quota_settings {
    limit  = 5000
    period = "DAY"
  }

  tags = var.tags
}

resource "aws_api_gateway_usage_plan_key" "kiosk" {
  key_id        = aws_api_gateway_api_key.kiosk.id
  key_type      = "API_KEY"
  usage_plan_id = aws_api_gateway_usage_plan.kiosk.id
}

# ---------------------------------------------------------------------------
# Permisos de invocacion: API Gateway necesita permiso explicito para invocar
# cada Lambda. El source_arn se acota al metodo y ruta exactos de esta API.
# ---------------------------------------------------------------------------

resource "aws_lambda_permission" "access" {
  statement_id  = "AllowAPIGatewayInvokeAccess"
  action        = "lambda:InvokeFunction"
  function_name = var.access_lambda_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.this.execution_arn}/*/POST/access"
}

resource "aws_lambda_permission" "enrollment" {
  statement_id  = "AllowAPIGatewayInvokeEnrollment"
  action        = "lambda:InvokeFunction"
  function_name = var.enrollment_lambda_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.this.execution_arn}/*/POST/enrollment"
}

# ---------------------------------------------------------------------------
# AWS WAF: web ACL regional asociada al stage. Aplica el conjunto de reglas
# administradas comunes de AWS (inyecciones, exploits conocidos) y un limite
# de tasa por IP contra abuso automatizado.
# ---------------------------------------------------------------------------

resource "aws_wafv2_web_acl" "this" {
  name        = "${var.name_prefix}-api-waf"
  description = "Proteccion del punto de entrada de la API de acceso facial"
  scope       = "REGIONAL"

  default_action {
    allow {}
  }

  # Reglas administradas comunes de AWS: cubren OWASP basico sin
  # mantenimiento propio.
  rule {
    name     = "aws-common-rule-set"
    priority = 1

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.name_prefix}-common-rule-set"
      sampled_requests_enabled   = true
    }
  }

  # Limite de tasa por IP: 300 peticiones en la ventana de 5 minutos que usa
  # WAF; ajustable segun el trafico real del kiosco y del panel.
  rule {
    name     = "rate-limit-per-ip"
    priority = 2

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 300
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.name_prefix}-rate-limit"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.name_prefix}-api-waf"
    sampled_requests_enabled   = true
  }

  tags = var.tags
}

resource "aws_wafv2_web_acl_association" "api" {
  resource_arn = aws_api_gateway_stage.dev.arn
  web_acl_arn  = aws_wafv2_web_acl.this.arn
}
