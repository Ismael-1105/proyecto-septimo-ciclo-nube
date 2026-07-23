# Modulo kms: clave de cliente para el cifrado en reposo del proyecto.
# La clave la consumen los modulos s3, dynamodb y sns via el output key_arn;
# el cableado lo hace infra/envs/dev/main.tf, nunca este modulo.

resource "aws_kms_key" "main" {
  description         = "Clave de cifrado en reposo para datos biometricos y bitacora (${var.name_prefix})"
  enable_key_rotation = true

  # Politica por defecto: al no declarar policy, AWS aplica la politica
  # que otorga administracion a la cuenta propietaria.

  tags = var.tags
}

resource "aws_kms_alias" "main" {
  name          = "alias/${var.name_prefix}"
  target_key_id = aws_kms_key.main.key_id
}
