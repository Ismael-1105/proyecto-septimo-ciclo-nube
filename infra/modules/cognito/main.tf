# Modulo cognito: autenticacion de los administradores del panel web
# (encargado de laboratorio o docente). El proyecto delega en Cognito la
# gestion de usuarios, contraseñas y MFA en lugar de desarrollar un modulo
# de identidad propio.

# User pool de administradores. No existe registro publico: las cuentas se
# crean manualmente desde la consola de AWS o la CLI.
resource "aws_cognito_user_pool" "admins" {
  name = "${var.name_prefix}-admins"

  # Politica de contraseñas fuerte para cuentas con privilegios de gestion.
  password_policy {
    minimum_length    = 12
    require_uppercase = true
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
  }

  # MFA opcional con aplicacion TOTP (Google Authenticator o similar).
  mfa_configuration = "OPTIONAL"

  software_token_mfa_configuration {
    enabled = true
  }

  # Solo un administrador puede crear usuarios; sin auto registro.
  admin_create_user_config {
    allow_admin_create_user_only = true
  }

  # Recuperacion de cuenta unicamente por correo verificado.
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  tags = var.tags
}

# Cliente del panel web. Es una aplicacion publica de navegador, por lo que
# no genera secret; usa el flujo SRP para no transmitir la contraseña.
resource "aws_cognito_user_pool_client" "panel" {
  name         = "${var.name_prefix}-panel"
  user_pool_id = aws_cognito_user_pool.admins.id

  generate_secret = false

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]
}
