# Modulo hosting

## Que crea

El alojamiento del panel web de administracion como sitio estatico:

- **Bucket del panel** (`${name_prefix}-panel-${bucket_suffix}`): bucket S3 privado con bloqueo total de acceso publico y cifrado SSE-S3 (AES256; el contenido es el build publico de la app, no requiere KMS). Contiene el build de la SPA (HTML, JS, CSS).
- **Origin Access Control** tipo `s3` con firma SigV4, para que CloudFront lea el bucket sin exponerlo.
- **Distribucion CloudFront** con `index.html` como objeto raiz, redireccion a HTTPS, certificado por defecto de CloudFront (sin dominio propio, por confirmar), `PriceClass_100` y respuestas de error 403 y 404 redirigidas a `/index.html` con codigo 200 (necesario para el enrutamiento de la SPA).
- **Politica de bucket** que permite `s3:GetObject` unicamente al service principal `cloudfront.amazonaws.com` condicionado al ARN de esta distribucion.

## Por que existe

El informe pide publicar el panel administrativo como sitio estatico de despliegue sencillo y bajo costo. De las dos opciones planteadas (Amplify o CloudFront con S3), el contrato fija CloudFront con S3 y Origin Access Control: el bucket queda privado y la distribucion es el unico punto de acceso, servido por HTTPS.

## Como subir el build del panel

Con el build generado (por ejemplo en `dist/`), sincronizar hacia el bucket e invalidar la cache de CloudFront:

```bash
aws s3 sync dist/ "s3://$(terraform output -raw panel_bucket_name)" --delete

aws cloudfront create-invalidation \
  --distribution-id "$(terraform output -raw cloudfront_distribution_id)" \
  --paths "/*"
```

Los comandos `terraform output` se ejecutan desde `infra/envs/dev/`.

## Variables

| Nombre | Tipo | Default | Descripcion |
|---|---|---|---|
| `name_prefix` | `string` | (requerida) | Prefijo de nombres, formato proyecto-entorno (ej. `afl-dev`) |
| `tags` | `map(string)` | (requerida) | Tags comunes aplicados a todos los recursos |
| `bucket_suffix` | `string` | (requerida) | Sufijo para unicidad global del nombre del bucket (placeholder, valor real por confirmar) |

## Outputs

| Nombre | Descripcion |
|---|---|
| `panel_bucket_name` | Nombre del bucket que aloja el build estatico del panel |
| `cloudfront_distribution_id` | ID de la distribucion CloudFront que sirve el panel |
| `panel_url` | URL HTTPS del panel (dominio de la distribucion CloudFront) |

## Nota de costo

CloudFront incluye una capa gratuita permanente (1 TB de transferencia de salida y 10 millones de peticiones al mes), muy por encima del trafico esperado de un panel de laboratorio. El almacenamiento S3 del build es de unos pocos MB. El costo esperado del modulo es marginal; cifras concretas por confirmar con el uso real.
