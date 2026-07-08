# Inventario de Pantallas y Mapa de Contenido Jerárquico

**Proyecto:** FaceAccess Lab — Sistema de Control de Acceso Biométrico
**Asignatura:** Programación en la Nube — VII Ciclo
**Documento:** GTA-24_ApellidoNombre_InventarioMapa.pdf

---

## 1. Inventario de Pantallas

| ID | Nombre Descriptivo | Nivel Jerárquico | Sección Padre | Estado |
|---|---|---|---|---|
| **P-01** | Inicio — Landing Page | 1 (Raíz) | — | Existente |
| P-01.01 | Hero / Presentación del sistema | 2 | P-01 Inicio | Existente |
| P-01.02 | Características (Bento Grid — 3 cards) | 2 | P-01 Inicio | Existente |
| P-01.03 | Flujo de funcionamiento interactivo (6 fases) | 2 | P-01 Inicio | Existente |
| P-01.04 | Llamado a la acción — Solicitar auditoría | 2 | P-01 Inicio | Existente |
| P-M.01 | Modal — Formulario de solicitud de auditoría | 3 | P-01.04 CTA | Existente |
| P-M.01a | Estado — Confirmación de envío exitoso | 4 | P-M.01 Modal | Existente |
| **P-02** | Kiosco — Demo de Escaneo Facial | 1 (Raíz) | — | Existente |
| P-02.01 | Barra de selección de perfil de simulación | 2 | P-02 Kiosco | Existente |
| P-02.02 | Vista de cámara (feed) | 2 | P-02 Kiosco | Existente |
| P-02.02a | Sub-estado — Imagen estática (preset) | 3 | P-02.02 Cámara | Existente |
| P-02.02b | Sub-estado — Webcam en vivo | 3 | P-02.02 Cámara | Existente |
| P-02.02c | Sub-estado — Superposición HUD de escaneo | 3 | P-02.02 Cámara | Existente |
| P-02.03 | Panel de estado de verificación | 2 | P-02 Kiosco | Existente |
| P-02.03a | Paso 1 — Detectando rostro | 3 | P-02.03 Estado | Existente |
| P-02.03b | Paso 2 — Detección de vivacidad | 3 | P-02.03 Estado | Existente |
| P-02.03c | Paso 3 — Comparación biométrica | 3 | P-02.03 Estado | Existente |
| P-02.03d | Paso 4 — Permisos y horarios | 3 | P-02.03 Estado | Existente |
| P-02.04 | Barra de progreso y controles | 2 | P-02 Kiosco | Existente |
| P-02.05 | Resultado — Acceso Concedido (pantalla verde) | 2 | P-02 Kiosco | Existente |
| P-02.06 | Resultado — Acceso Denegado (pantalla roja) | 2 | P-02 Kiosco | Existente |
| P-02.07 | Acción — Descargar recibo de entrada | 2 | P-02 Kiosco | Existente |
| P-02.08 | Footer informativo (enlaces: Normativa, Garantía, Seguridad) | 2 | P-02 Kiosco | Existente |
| **P-03** | Dashboard — Panel Administrativo | 1 (Raíz) | — | Existente |
| P-03.01 | Sidebar de navegación interna | 2 | P-03 Dashboard | Existente |
| P-03.01a | Indicador de estado de hardware (Kiosk-042) | 3 | P-03.01 Sidebar | Existente |
| P-03.02 | Vista General — Tablero de métricas | 2 | P-03 Dashboard | Existente |
| P-03.02a | Tarjetas de estadísticas (4 cards) | 3 | P-03.02 Vista General | Existente |
| P-03.02b | Gráfico de barras — Accesos por día | 3 | P-03.02 Vista General | Existente |
| P-03.02c | Gráfico de dona — Tasa de autorización | 3 | P-03.02 Vista General | Existente |
| P-03.02d | Tabla — Últimas lecturas (preview de logs) | 3 | P-03.02 Vista General | Existente |
| P-03.03 | Alumnos — Gestión de identidades biométricas | 2 | P-03 Dashboard | Existente |
| P-03.03a | Tabla de alumnos con búsqueda | 3 | P-03.03 Alumnos | Existente |
| P-03.03b | Modal — Formulario de matriculación | 3 | P-03.03 Alumnos | Existente |
| P-03.03c | Acción — Suspender/Habilitar alumno | 3 | P-03.03 Alumnos | Existente |
| P-03.04 | Historial — Registro de accesos | 2 | P-03 Dashboard | Existente |
| P-03.04a | Barra de búsqueda y filtros (Permitido/Denegado) | 3 | P-03.04 Historial | Existente |
| P-03.04b | Tabla de logs con ID, fecha, hora, fidelidad | 3 | P-03.04 Historial | Existente |
| P-03.04c | Acción — Exportar CSV | 3 | P-03.04 Historial | Existente |
| P-03.04d | Acción — Limpiar historial | 3 | P-03.04 Historial | Existente |
| P-03.05 | Calibración — Ajuste de sensores y umbrales | 2 | P-03 Dashboard | Existente |
| P-03.05a | Panel — Parámetros del sensor (sliders) | 3 | P-03.05 Calibración | Existente |
| P-03.05b | Panel — Incidencias de hardware | 3 | P-03.05 Calibración | Existente |
| **P-04** | Arquitectura — Consola de Servicios Cloud | 1 (Raíz) | — | Existente |
| P-04.01 | Encabezado — Topología Serverless | 2 | P-04 Arquitectura | Existente |
| P-04.02 | Cuadrícula de servicios AWS (9 servicios) | 2 | P-04 Arquitectura | Existente |
| P-04.03 | Panel de telemetría CloudWatch por servicio | 2 | P-04 Arquitectura | Existente |
| P-04.04 | Sección — Resiliencia Desconectada (Offline) | 2 | P-04 Arquitectura | Existente |
| P-04.04a | Card — Caché Local Cifrada (AES-256) | 3 | P-04.04 Offline | Existente |
| P-04.04b | Card — Teclado Alternativo (OTP) | 3 | P-04.04 Offline | Existente |
| P-04.04c | Card — Relé Normalmente Cerrado | 3 | P-04.04 Offline | Existente |
| **P-G.01** | Header — Barra de navegación global | 1 (Global) | — | Existente |
| P-G.01a | Logo / Marca FaceAccess Lab | 2 | P-G.01 Header | Existente |
| P-G.01b | Navegación principal (4 enlaces: Inicio, Demo, Dashboard, Arquitectura) | 2 | P-G.01 Header | Existente |
| P-G.01c | Menú móvil (drawer responsivo) | 2 | P-G.01 Header | Existente |
| P-G.01d | Botón — Cambio de tema (claro/oscuro) | 2 | P-G.01 Header | Existente |
| P-M.02 | Panel — Notificaciones / Alertas | 2 | P-G.01 Header | Existente |
| P-M.02a | Elemento — Alerta de intruso denegado | 3 | P-M.02 Notificaciones | Existente |
| P-M.02b | Elemento — Alerta de kiosco en línea | 3 | P-M.02 Notificaciones | Existente |
| P-M.02c | Estado vacío — Sin alertas activas | 3 | P-M.02 Notificaciones | Existente |
| P-M.02d | Acción — Marcar todas como leídas | 3 | P-M.02 Notificaciones | Existente |
| P-G.01e | Indicador — Rol de usuario (Operario) | 2 | P-G.01 Header | Existente |

---

## 2. Mapa de Contenido Jerárquico

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     FACEACCESS LAB — MAPA DE CONTENIDO                    │
└──────────────────────────────────────────────────────────────────────────┘

NIVEL 1 (Raíz)          NIVEL 2 (Sección)            NIVEL 3 (Subsección)        NIVEL 4
════════════════════    ════════════════════════     ════════════════════════    ═══════

[P-G.01] HEADER GLOBAL ─┬─ P-G.01a Logo/Marca
                        ├─ P-G.01b Navegación principal (4 rutas)
                        ├─ P-G.01c Menú móvil drawer
                        ├─ P-G.01d Toggle tema (claro/oscuro)
                        ├─ P-G.01e Rol de usuario (Operario)
                        └─ [P-M.02] Notificaciones ─┬─ P-M.02a Alerta intruso
                                                     ├─ P-M.02b Alerta kiosco
                                                     ├─ P-M.02c Estado vacío
                                                     └─ P-M.02d Marcar leídas

[P-01] INICIO ──────────┬─ P-01.01 Hero / Presentación
                        ├─ P-01.02 Características (Bento Grid)
                        ├─ P-01.03 Flujo interactivo (6 fases)
                        └─ P-01.04 CTA Auditoría ──── [P-M.01] Modal ─── P-M.01a Confirmación
                                                                  formulario     envío

[P-02] KIOSCO ──────────┬─ P-02.01 Barra de selección de perfil
                        ├─ P-02.02 Vista de cámara ──┬─ P-02.02a Imagen preset
                        │                            ├─ P-02.02b Webcam en vivo
                        │                            └─ P-02.02c HUD escaneo
                        ├─ P-02.03 Panel de estado ──┬─ P-02.03a Paso 1: Rostro
                        │       (4 pasos)            ├─ P-02.03b Paso 2: Vivacidad
                        │                            ├─ P-02.03c Paso 3: Comparación
                        │                            └─ P-02.03d Paso 4: Permisos
                        ├─ P-02.04 Barra de progreso + Controles
                        ├─ P-02.05 Resultado: Acceso CONCEDIDO
                        ├─ P-02.06 Resultado: Acceso DENEGADO
                        ├─ P-02.07 Acción: Descargar recibo
                        └─ P-02.08 Footer (Normativa, Garantía, Seguridad)

[P-03] DASHBOARD ───────┬─ P-03.01 Sidebar ───────── P-03.01a Estado hardware
                        ├─ [P-03.02] Vista General ──┬─ P-03.02a Tarjetas stats (4)
                        │                            ├─ P-03.02b Gráfico barras
                        │                            ├─ P-03.02c Gráfico dona
                        │                            └─ P-03.02d Últimas lecturas
                        ├─ [P-03.03] Alumnos ────────┬─ P-03.03a Tabla + búsqueda
                        │                            ├─ P-03.03b Formulario matrícula
                        │                            └─ P-03.03c Acción suspender/habilitar
                        ├─ [P-03.04] Historial ──────┬─ P-03.04a Búsqueda + filtros
                        │                            ├─ P-03.04b Tabla de logs
                        │                            ├─ P-03.04c Exportar CSV
                        │                            └─ P-03.04d Limpiar historial
                        └─ [P-03.05] Calibración ────┬─ P-03.05a Parámetros sensor
                                                     └─ P-03.05b Incidencias hardware

[P-04] ARQUITECTURA ────┬─ P-04.01 Encabezado topología
                        ├─ P-04.02 Cuadrícula AWS (9 servicios)
                        ├─ P-04.03 Panel telemetría CloudWatch
                        └─ P-04.04 Offline ──────────┬─ P-04.04a Caché local
                                                     ├─ P-04.04b Teclado OTP
                                                     └─ P-04.04c Relé cerrado


PROFUNDIDAD MÁXIMA: 4 niveles
  (P-01 → P-01.04 → P-M.01 → P-M.01a)

PUNTOS DE ENTRADA ALTERNATIVOS:
  ╔═══ ENTRADA DIRECTA 1: Notificaciones ═══╗
  ║  Desde P-M.02 → clic en alerta →       ║
  ║  lleva al Dashboard (P-03.02) para      ║
  ║  ver detalles del incidente             ║
  ╚══════════════════════════════════════════╝
  ╔═══ ENTRADA DIRECTA 2: CTA Hero ═════════╗
  ║  Desde P-01.01 → botón "Iniciar demo   ║
  ║  interactiva" → salto directo a P-02    ║
  ║  (Kiosco), sin pasar por navegación     ║
  ╚══════════════════════════════════════════╝
  ╔═══ ENTRADA DIRECTA 3: Sidebar ══════════╗
  ║  Desde P-03.01 → acceso directo a       ║
  ║  cualquiera de las 4 subsecciones del   ║
  ║  Dashboard sin jerarquía intermedia     ║
  ╚══════════════════════════════════════════╝
```

---

## 3. Análisis de la Estructura

### 3.1 Profundidad Máxima

La profundidad máxima del sistema es de **4 niveles** (N1 → N2 → N3 → N4), que se alcanza únicamente en:

- **P-01.04 → P-M.01 → P-M.01a**: Landing Page → CTA Auditoría → Modal formulario → Confirmación de envío

El resto de las rutas se mantienen en **2 o 3 niveles**, lo cual está dentro del rango recomendado (3–4 niveles). La excepción puntual en nivel 4 es aceptable porque:

1. Se trata de un **flujo modal transaccional** (formulario → confirmación), no de una navegación persistente.
2. El usuario no necesita "navegar hacia atrás" desde la confirmación; el modal se cierra automáticamente tras 3 segundos.
3. La acción de enviar el formulario es un **callejón sin salida** (dead-end) que no requiere profundizar más.

**Conclusión:** No se superan los niveles recomendados de forma problemática. El nivel 4 es justificado y no afecta la usabilidad.

### 3.2 Puntos de Entrada Alternativos (No Jerárquicos)

El sistema ofrece **3 puntos de entrada alternativos** donde el usuario llega a una pantalla sin seguir la ruta jerárquica estándar desde la raíz:

1. **Notificaciones → Dashboard (P-M.02 → P-03.02)**
   - El usuario recibe una alerta y al interactuar con ella es llevado directamente a la Vista General del Dashboard.
   - *Justificación:* Reducción de fricción en escenarios de emergencia (intento de intrusión).

2. **Hero CTA → Kiosco (P-01.01 → P-02)**
   - El botón "Iniciar demo interactiva" en el Hero salta directamente a la simulación de escaneo.
   - *Justificación:* Conversión directa desde la landing page; elimina 2 clics de navegación.

3. **Sidebar → Subsecciones del Dashboard (P-03.01 → P-03.03/4/5)**
   - La navegación lateral permite acceder a Alumnos, Historial o Calibración sin pasar por Vista General.
   - *Justificación:* Patrón de dashboard estándar; el sidebar funciona como navegación plana dentro de la sección.

### 3.3 Sección Recomendada para Reorganización

**Sección propuesta: P-02 Kiosco — Pasos del Pipeline de Escaneo (P-02.03a → P-02.03d)**

*Problema actual:*
Los 4 pasos del pipeline (Detectar rostro → Vivacidad → Comparación biométrica → Permisos) están secuenciados como subsecciones de P-02.03 Panel de Estado. Sin embargo, este panel solo es visible durante los estados `scanning` y `processing`, y desaparece en el estado `result`. Esto crea una dependencia temporal frágil: los pasos no existen como pantallas independientes sino como sub-componentes renderizados condicionalmente dentro del mismo contenedor.

*Propuesta de reorganización:*
- Elevar los 4 pasos a subsecciones independientes de P-02 (nivel 2), no anidadas dentro de P-02.03:
  - P-02.03 → **Eliminar** como contenedor padre
  - P-02.03a → **P-02.03** (nivel 2, promovido): Detección de rostro
  - P-02.03b → **P-02.04** (nivel 2, promovido): Prueba de vida
  - P-02.03c → **P-02.05** (nivel 2, promovido): Comparación biométrica
  - P-02.03d → **P-02.06** (nivel 2, promovido): Verificación de permisos
  - P-02.04 → **P-02.07** (mover): Barra de progreso
  - P-02.05 → **P-02.08** (mover): Resultado concedido
  - P-02.06 → **P-02.09** (mover): Resultado denegado

*Beneficio:*
- La profundidad del Kiosco se reduce de 3 a 2 niveles máximos.
- Cada paso es identificable como una pantalla independiente, facilitando la navegación directa.
- El modelo conceptual se alinea con la interfaz de usuario (el progreso se muestra como pasos secuenciales en la UI).

---

## 4. Resumen de Métricas

| Métrica | Valor |
|---|---|
| Total de pantallas/componentes inventariados | 48 |
| Pantallas raíz (Nivel 1) | 4 (Inicio, Kiosco, Dashboard, Arquitectura) |
| Pantallas globales | 1 (Header) + 1 (Notificaciones) |
| Modales/Overlays | 2 (Auditoría, Notificaciones) |
| Profundidad máxima | 4 niveles |
| Profundidad promedio | 2.3 niveles |
| Puntos de entrada alternativos | 3 |
| Subsecciones con estado (por diseñar / por eliminar) | Ninguna |
