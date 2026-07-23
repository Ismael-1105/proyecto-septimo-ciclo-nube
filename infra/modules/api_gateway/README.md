# Modulo api_gateway

## Que crea

- `aws_api_gateway_rest_api` `${name_prefix}-api`: REST API regional con dos rutas. Se usa REST API y no HTTP API porque AWS WAF solo se asocia a REST APIs.
- `POST /access`: integracion AWS_PROXY con la Lambda de acceso, protegida con API key (`api_key_required`).
- `POST /enrollment`: integracion AWS_PROXY con la Lambda de enrolamiento, protegida con un authorizer `COGNITO_USER_POOLS` sobre el user pool de administradores.
- `aws_api_gateway_deployment` y `aws_api_gateway_stage` `dev`, con trigger sha1 para redesplegar al cambiar rutas, metodos, integraciones o el authorizer.
- `aws_api_gateway_api_key` `${name_prefix}-kiosk` con `aws_api_gateway_usage_plan` (throttle de 10 rps con burst 20 y cuota de 5000 peticiones diarias, ajustable) y su `aws_api_gateway_usage_plan_key`.
- Dos `aws_lambda_permission` para que API Gateway invoque cada funcion, con `source_arn` acotado al metodo y ruta exactos de esta API.
- `aws_wafv2_web_acl` regional con la regla administrada `AWSManagedRulesCommonRuleSet` y un limite de tasa por IP (300 peticiones por ventana de 5 minutos, ajustable), asociada al stage con `aws_wafv2_web_acl_association`.

## Por que existe

El informe exige exponer un punto de entrada gestionado con autenticacion, control de tasa y cifrado en transito (TLS lo aporta API Gateway) sin exponer la logica interna: los clientes nunca hablan con las Lambdas ni con los datos directamente. El WAF añade una capa de proteccion contra ataques web comunes y abuso automatizado antes de que el trafico llegue a la API.

## Quien consume cada ruta

| Ruta | Consumidor | Credencial |
|---|---|---|
| `POST /access` | Kiosco de la puerta | API key en el header `x-api-key`, limitada por el usage plan |
| `POST /enrollment` | Panel de administracion | Token JWT de Cognito en el header `Authorization` |

## Como recuperar la API key

El valor de la key no se versiona ni se imprime en outputs. Se recupera con la CLI usando el output `api_key_id`:

```
aws apigateway get-api-key --api-key <api_key_id> --include-value --query value --output text
```

## Variables

| Nombre | Tipo | Descripcion |
|---|---|---|
| `name_prefix` | `string` | Prefijo de nombres, formato proyecto-entorno (ej. `afl-dev`) |
| `tags` | `map(string)` | Tags comunes aplicados a todos los recursos |
| `access_lambda_name` | `string` | Nombre de la Lambda de acceso, para el permiso de invocacion |
| `access_lambda_invoke_arn` | `string` | Invoke ARN de la Lambda de acceso para `POST /access` |
| `enrollment_lambda_name` | `string` | Nombre de la Lambda de enrolamiento, para el permiso de invocacion |
| `enrollment_lambda_invoke_arn` | `string` | Invoke ARN de la Lambda de enrolamiento para `POST /enrollment` |
| `cognito_user_pool_arn` | `string` | ARN del user pool que respalda al authorizer de Cognito |

## Outputs

| Nombre | Descripcion |
|---|---|
| `api_invoke_url` | URL de invocacion del stage `dev`, base para `/access` y `/enrollment` |
| `rest_api_id` | ID de la REST API |
| `api_key_id` | ID de la API key del kiosco, insumo del comando de la CLI de arriba |

## Costo

API Gateway REST cobra por millon de llamadas; a los volumenes de un laboratorio el consumo es marginal. AWS WAF cobra un fijo mensual por web ACL y por cada regla, mas un monto por millon de peticiones inspeccionadas (montos por confirmar en la calculadora de AWS para us-east-1).
