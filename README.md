# FaceAccess Lab

Sistema inteligente de control de acceso por reconocimiento facial para laboratorios universitarios.

Este repositorio contiene el proyecto completo: el frontend (React + Vite), el
backend de demo desplegado en Vercel (`api/`), las Lambdas de la arquitectura
AWS (`backend/`), el cliente del kiosco (`edge/`) y la infraestructura como
codigo en Terraform (`infra/`).

## Estructura del repositorio

```
src/        Frontend React (portal docente y kiosco)
api/        Backend serverless de demo en Vercel (ver docs/backend-api.md)
backend/    Lambdas Python de la arquitectura AWS (acceso y enrolamiento)
edge/       Cliente Python del kiosco (Raspberry Pi)
infra/      Infraestructura Terraform modular de AWS (11 modulos)
docs/       Documentacion del proyecto
```

La arquitectura de la solucion es serverless sobre AWS: API Gateway, Lambda,
Rekognition (colecciones y Face Liveness), DynamoDB, S3, Cognito, KMS, SNS y
CloudWatch, aprovisionados con los modulos de `infra/`. El despliegue web de
demostracion se sirve por HTTPS en https://faceaccess-lab.vercel.app.

## Roles de usuario

| Rol | Interfaz | Acceso |
|---|---|---|
| **Estudiante** | Kiosco de pantalla unica | Solo mira a la camara conectada a la PC. El sistema verifica si esta en la lista de autorizados. |
| **Docente** | Portal administrativo | Dashboard, gestion de alumnos, historial de accesos, calibracion y arquitectura cloud. |

## Pantallas

- **Kiosco (DemoView)** — Camara, pipeline de escaneo facial (deteccion de rostro, prueba de vida, comparacion biometrica, verificacion de permisos), resultado concedido/denegado.
- **Dashboard (AdminView)** — Metricas, graficos, tabla de alumnos con toggle de acceso, historial con exportacion CSV, calibracion del sensor.
- **Arquitectura (ArchitectureView)** — Consola de servicios AWS con panel de telemetria CloudWatch.
- **Inicio (HomeView)** — Landing page del portal docente con hero, pipeline interactivo y modal de auditoria.

## Stack

React 19, TypeScript 5.8, Vite 6, TailwindCSS 4, Motion, Phosphor Icons, Gemini API

## Requisitos

- Node.js 18+
- pnpm

## Instalacion

```bash
pnpm install
```

## Variables de entorno

Crear `.env`:

```
GEMINI_API_KEY=tu_api_key
```

## Ejecutar

```bash
pnpm dev       # Desarrollo (Vite)
pnpm build     # Build produccion
pnpm preview   # Previsualizar build
```

## Imagenes

Las imagenes se colocan en `public/images/`. Ver `public/images/LEEME.txt` para los nombres requeridos. Si una imagen falta, se usa `camera-feed-bg.jpg` como fallback automatico.

```
public/images/
  camera-feed-bg.jpg
  scan-demo-profile.jpg
  home-hero-preview.jpg
  default-avatar.jpg
  students/
    ismael-gonzalez.jpg
    alejandro-morales.jpg
    sofia-villarreal.jpg
    julian-rivas.jpg
    persona-desconocida.jpg
```

## Estructura

```
src/
  App.tsx                    # Raiz, estado global, temas claro/oscuro
  index.css                  # TailwindCSS, tokens de diseno
  types.ts                   # Interfaces: Student, AccessLog, CloudService
  data.ts                    # Datos de prueba
  components/
    Header.tsx               # Barra de navegacion (solo portal docente)
    HomeView.tsx             # Landing page
    DemoView.tsx             # Kiosco de reconocimiento facial
    AdminView.tsx            # Panel administrativo
    ArchitectureView.tsx     # Consola de servicios AWS
```
