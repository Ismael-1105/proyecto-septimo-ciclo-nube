# Backend API

Backend del proyecto implementado como funciones serverless de Vercel en el
directorio `api/`. Cada archivo se despliega como un endpoint bajo el mismo
dominio HTTPS de la aplicacion (https://faceaccess-lab.vercel.app), por lo que
todo el trafico hacia el backend viaja cifrado con TLS y hereda la redireccion
automatica de HTTP a HTTPS de la plataforma.

Este backend replica en pequeño la logica que en la arquitectura final ejecutan
las funciones Lambda con Rekognition y DynamoDB (ver el repositorio de
infraestructura NBE_BACK). Los datos se mantienen en un almacen en memoria por
instancia (`api/_lib/store.ts`): sirven para la demo, no son persistentes.

## Endpoints

### GET /api/health

Estado del servicio. Devuelve ademas el protocolo con el que llego la peticion
(cabecera `x-forwarded-proto`), util como evidencia de que el backend se sirve
por HTTPS.

### GET /api/students

Lista los estudiantes enrolados.

### POST /api/students

Enrola un estudiante nuevo. Cuerpo JSON requerido:

```json
{ "id": "student-ejemplo", "name": "Nombre Apellido", "career": "Carrera", "lab": "LAB-01" }
```

Responde 201 con el registro creado, 400 si faltan campos y 409 si el id ya
existe.

### POST /api/access/verify

Decide un intento de acceso. Cuerpo JSON requerido:

```json
{ "studentId": "student-ismael", "similarity": 98.7 }
```

Reglas de decision: el estudiante debe estar enrolado, habilitado
(`status: allowed`) y la similitud debe alcanzar el umbral de 95. Todo intento,
concedido o denegado, queda registrado en la bitacora con fecha, hora,
resultado y porcentaje de similitud, igual que en el diseño de la solucion.

### GET /api/access-logs

Devuelve la bitacora de accesos, con los eventos mas recientes primero.

## Pruebas rapidas

```bash
curl https://faceaccess-lab.vercel.app/api/health
curl https://faceaccess-lab.vercel.app/api/students
curl -X POST https://faceaccess-lab.vercel.app/api/access/verify \
  -H "Content-Type: application/json" \
  -d '{"studentId":"student-ismael","similarity":98.7}'
curl https://faceaccess-lab.vercel.app/api/access-logs
```
