# Modulo cognito

## Que crea

- `aws_cognito_user_pool` `${name_prefix}-admins`: user pool para los administradores del panel web (encargado de laboratorio o docente), con politica de contraseñas fuerte (minimo 12 caracteres, mayusculas, minusculas, numeros y simbolos), MFA opcional por aplicacion TOTP y recuperacion de cuenta por correo verificado.
- `aws_cognito_user_pool_client` `${name_prefix}-panel`: cliente sin secret para la aplicacion web publica del panel, con los flujos `ALLOW_USER_SRP_AUTH` y `ALLOW_REFRESH_TOKEN_AUTH`.

## Por que existe

El informe delega en Cognito la gestion de usuarios, contraseñas y MFA, de modo que el proyecto no desarrolla un modulo de identidad propio. El user pool respalda al authorizer de Cognito que protege la ruta `POST /enrollment` en el modulo api_gateway.

No hay registro publico: `allow_admin_create_user_only` esta activado y los administradores se crean manualmente desde la consola de AWS o la CLI (`aws cognito-idp admin-create-user`).

## Variables

| Nombre | Tipo | Descripcion |
|---|---|---|
| `name_prefix` | `string` | Prefijo de nombres, formato proyecto-entorno (ej. `afl-dev`) |
| `tags` | `map(string)` | Tags comunes aplicados a todos los recursos |

## Outputs

| Nombre | Descripcion |
|---|---|
| `user_pool_id` | ID del user pool de administradores |
| `user_pool_arn` | ARN del user pool, usado por el authorizer de API Gateway |
| `user_pool_client_id` | ID del cliente del panel web (sin secret) |

## Costo

Cognito tiene una capa gratuita amplia para usuarios activos mensuales. Con un puñado de administradores el costo es nulo a este volumen.
