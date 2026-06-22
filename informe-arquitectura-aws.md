# INFORME DE ARQUITECTURA AWS - LECCIÓN PRÁCTICA S7
## Application Load Balancer con Auto Scaling Group

**Cuenta AWS:** 503561454267  
**Región:** us-east-1 (N. Virginia)  
**Fecha de inspección:** 19 de junio de 2026  
**Propietario:** Ismael

---

## 1. DIAGRAMA DE ARQUITECTURA

```
                              INTERNET
                                 |
                                 | (HTTP :80)
                                 |
                    +---------------------------+
                    |  Application Load Balancer |
                    |  alb-leccionS7-Ismael     |
                    |  DNS: alb-leccionS7-Ismael |
                    |  -1122480519.us-east-1     |
                    |  .elb.amazonaws.com        |
                    |  (internet-facing)         |
                    +---------------------------+
                       |                   |
              AZ us-east-1a          AZ us-east-1b
                       |                   |
          +------------+------+   +--------+----------+
          |  Listener HTTP:80  |   |  Listener HTTP:80 |
          |  Forward to TG     |   |  Forward to TG    |
          +------------+------+   +--------+----------+
                       |                   |
                       v                   v
              +-----------------------------+
              |    TARGET GROUP              |
              |    gd-leccionS7-Ismael       |
              |    Protocol: HTTP            |
              |    Port: 80                  |
              |    Health Check: HTTP /      |
              +-----------------------------+
                       |                   |
         +-------------+------+   +--------+----------+
         | subnet-public-A     |   | subnet-public-B    |
         | 10.0.2.0/25         |   | 10.0.2.128/25     |
         | us-east-1a          |   | us-east-1b         |
         +---------------------+   +--------------------+
                  |                            |
    +-------------+----------+   +-------------+----------+
    | EC2: i-0464baeb65c06edd0|   | EC2: i-082dede82eedc713a|
    | IP Privada: 10.0.2.12   |   | IP Privada: 10.0.2.249  |
    | IP Pública: 54.166.163.172|  | IP Pública: 3.235.248.229|
    | NGINX + HTML personalizado|  | NGINX + HTML personalizado|
    | Tipo: t2.micro           |   | Tipo: t2.micro          |
    +--------------------------+   +-------------------------+
```

---

## 2. INFRAESTRUCTURA DE RED

### 2.1 VPC Principal

| Campo | Valor |
|-------|-------|
| **VPC ID** | `vpc-0770ed59c03e29f70` |
| **Nombre** | `vpc_leccions7-ismael` |
| **CIDR Block** | `10.0.2.0/24` |
| **Estado** | `available` |
| **Región** | `us-east-1` |

> **Nota:** Existe una segunda VPC (`vpc-0309412c1df761e6f`, `8.0.0.0/16`, "prnterraform-vpc") de un proyecto diferente no relacionado con esta lección.

### 2.2 Subredes

| Nombre | Subnet ID | CIDR | AZ | IP Pública automática |
|--------|-----------|------|-----|---------------------|
| `subnet_leccions7-public-A` | `subnet-097ad153dcdf066c8` | `10.0.2.0/25` | `us-east-1a` | No (se asigna vía Launch Template) |
| `subnet_leccions7-public-B` | `subnet-0c4829bad8a8d259c` | `10.0.2.128/25` | `us-east-1b` | No (se asigna vía Launch Template) |

**Observación:** Ambas subredes tienen `MapPublicIpOnLaunch=false`, pero el Launch Template fuerza `AssociatePublicIpAddress=true` a nivel de interfaz de red. Esto significa que las IPs públicas se asignan correctamente a las instancias EC2 a pesar de la configuración de subred.

### 2.3 Internet Gateway

| Campo | Valor |
|-------|-------|
| **IGW ID** | `igw-0e51cfc7de9d650e3` |
| **Nombre** | `itw-leccionS7-Ismael` |
| **VPC adjunta** | `vpc-0770ed59c03e29f70` |
| **Estado** | `attached` |

### 2.4 Tablas de Rutas

#### Tabla de rutas principal (pública) - `route-table-leccionS7-Ismael`

| Campo | Valor |
|-------|-------|
| **Route Table ID** | `rtb-0ad3dc797f34277bd` |
| **VPC** | `vpc-0770ed59c03e29f70` |

| Destino | Target | Estado |
|---------|--------|--------|
| `10.0.2.0/24` | `local` | active |
| `0.0.0.0/0` | `igw-0e51cfc7de9d650e3` (Internet Gateway) | active |

**Subredes asociadas:**
- `subnet-097ad153dcdf066c8` (public-A)
- `subnet-0c4829bad8a8d259c` (public-B)

#### Tabla de rutas principal (default) - sin nombre

| Campo | Valor |
|-------|-------|
| **Route Table ID** | `rtb-0d02ce0a7aace43e5` |
| **VPC** | `vpc-0770ed59c03e29f70` |

| Destino | Target | Estado |
|---------|--------|--------|
| `10.0.2.0/24` | `local` | active |

> Esta tabla es la principal por defecto. No tiene subredes asociadas explícitamente. Las subredes de la lección están explícitamente asociadas a la tabla con ruta al IGW.

---

## 3. GRUPO DE SEGURIDAD

| Campo | Valor |
|-------|-------|
| **Security Group ID** | `sg-040793afabcbc019f` |
| **Nombre** | `Security-group-leccionS7-Ismael` |
| **Descripción** | `grupo de seguridad para instancias de autoescala` |
| **VPC** | `vpc-0770ed59c03e29f70` |

### Reglas de Entrada (Inbound)

| Tipo | Protocolo | Puerto | Origen |
|------|-----------|--------|--------|
| HTTP | TCP | 80 | `0.0.0.0/0` (Internet) |
| SSH | TCP | 22 | `0.0.0.0/0` (Internet) |

### Reglas de Salida (Outbound)

| Tipo | Protocolo | Puerto | Destino |
|------|-----------|--------|---------|
| Todo el tráfico | -1 (All) | Todos | `0.0.0.0/0` (Internet) |

---

## 4. LAUNCH TEMPLATE

| Campo | Valor |
|-------|-------|
| **Launch Template ID** | `lt-078ce1865ed69c2ba` |
| **Nombre** | `template-balancer-leccionS7-Ismael` |
| **Versión** | `1` (Default) |
| **AMI ID** | `ami-0f8a61b66d1accaee` |
| **Tipo de instancia** | `t2.micro` |
| **Key Pair** | `Clase` |
| **Security Group** | `sg-040793afabcbc019f` |
| **Subred (config inicial)** | `subnet-097ad153dcdf066c8` (public-A) |
| **IP Pública autoasignada** | `true` |

### User Data (script de arranque)

```bash
#!/bin/bash
apt update -y
apt install nginx stress -y
systemctl enable nginx
systemctl start nginx

PRIVATE_IP=$(hostname -I | awk '{print $1}')

echo "
<h1>Servidor EC2 con Auto Scaling</h1>
<h2>IP privada: $PRIVATE_IP</h2>
" > /var/www/html/index.html
```

**Análisis del script:**
1. Actualiza paquetes del sistema
2. Instala **Nginx** (servidor web) y **stress** (herramienta de carga de CPU)
3. Habilita e inicia Nginx
4. Detecta la IP privada de la instancia
5. Crea una página HTML personalizada que muestra la IP privada del servidor

---

## 5. TARGET GROUP

| Campo | Valor |
|-------|-------|
| **Nombre** | `gd-leccionS7-Ismael` |
| **ARN** | `arn:aws:elasticloadbalancing:us-east-1:503561454267:targetgroup/gd-leccionS7-Ismael/e69089e6c73eba96` |
| **Protocolo** | `HTTP` |
| **Puerto** | `80` |
| **Tipo de target** | `instance` |
| **VPC** | `vpc-0770ed59c03e29f70` |
| **Health Check Protocol** | `HTTP` |
| **Health Check Path** | `/` |

### Estado de salud de los targets

| Instance ID | Puerto | Estado de Salud | IP Privada | Zona |
|-------------|--------|-----------------|------------|------|
| `i-0464baeb65c06edd0` | 80 | **healthy** | `10.0.2.12` | `us-east-1a` |
| `i-082dede82eedc713a` | 80 | **healthy** | `10.0.2.249` | `us-east-1b` |

> **Evidencia:** 2/2 targets en estado **Healthy**. El balanceador está distribuyendo tráfico correctamente.

---

## 6. APPLICATION LOAD BALANCER

| Campo | Valor |
|-------|-------|
| **Nombre** | `alb-leccionS7-Ismael` |
| **ARN** | `arn:aws:elasticloadbalancing:us-east-1:503561454267:loadbalancer/app/alb-leccionS7-Ismael/4cfeba7f84b14917` |
| **Tipo** | `application` |
| **Esquema** | `internet-facing` |
| **DNS Name** | `alb-leccionS7-Ismael-1122480519.us-east-1.elb.amazonaws.com` |
| **Estado** | `active` |
| **VPC** | `vpc-0770ed59c03e29f70` |

### Zones de disponibilidad del ALB

| Zona | Subnet |
|------|--------|
| `us-east-1a` | `subnet-097ad153dcdf066c8` (public-A) |
| `us-east-1b` | `subnet-0c4829bad8a8d259c` (public-B) |

### Listener

| Protocolo | Puerto | Acción |
|-----------|--------|--------|
| `HTTP` | `80` | Forward to `gd-leccionS7-Ismael` (Target Group) |

**Security Group del ALB:** `sg-040793afabcbc019f`

---

## 7. AUTO SCALING GROUP

| Campo | Valor |
|-------|-------|
| **Nombre** | `gautos-leccionS7-Ismael` |
| **Launch Template** | `template-balancer-leccionS7-Ismael` (lt-078ce1865ed69c2ba) |
| **Capacidad deseada** | `2` |
| **Capacidad mínima** | `2` |
| **Capacidad máxima** | `4` |
| **Default Cooldown** | `300` segundos |
| **Health Check Type** | `EC2` |
| **Health Check Grace Period** | `300` segundos |
| **Zonas de disponibilidad** | `us-east-1a`, `us-east-1b` |
| **Subredes** | `subnet-097ad153dcdf066c8`, `subnet-0c4829bad8a8d259c` |
| **Target Group** | `gd-leccionS7-Ismael` |

### Instancias gestionadas por el ASG

| Instance ID | Estado | Salud | Zona | IP Privada |
|-------------|--------|-------|------|------------|
| `i-0464baeb65c06edd0` | `InService` | `Healthy` | `us-east-1a` | `10.0.2.12` |
| `i-082dede82eedc713a` | `InService` | `Healthy` | `us-east-1b` | `10.0.2.249` |

> **Observación sobre MaxSize:** El valor configurado es **4** en lugar de **5** como solicitaba el enunciado. Esto debe corregirse para cumplir plenamente con el requerimiento.

---

## 8. POLÍTICA DE ESCALAMIENTO AUTOMÁTICO

| Campo | Valor |
|-------|-------|
| **Nombre de la política** | `cpusage` |
| **Tipo de política** | `TargetTrackingScaling` |
| **ASG asociado** | `gautos-leccionS7-Ismael` |

### Alarmas CloudWatch asociadas

#### Alarma High (Scale Out)

| Campo | Valor |
|-------|-------|
| **Nombre** | `TargetTracking-gautos-leccionS7-Ismael-AlarmHigh-f3e0784a-c531-474c-b547-7f80da324c91` |
| **Métrica** | `CPUUtilization` |
| **Namespace** | `AWS/EC2` |
| **Estadística** | `Average` |
| **Operador** | `GreaterThanThreshold` |
| **Umbral** | **50%** |
| **Período** | `60` segundos |
| **Períodos de evaluación** | `3` |
| **Dimensión** | `AutoScalingGroupName = gautos-leccionS7-Ismael` |

**Interpretación:** Si el promedio de CPU del ASG supera el 50% durante 3 períodos consecutivos de 60 segundos (3 minutos), se dispara el scale-out para agregar nuevas instancias.

#### Alarma Low (Scale In)

| Campo | Valor |
|-------|-------|
| **Nombre** | `TargetTracking-gautos-leccionS7-Ismael-AlarmLow-317ce411-741f-4a17-af39-c3a95eef455b` |
| **Métrica** | `CPUUtilization` |
| **Namespace** | `AWS/EC2` |
| **Estadística** | `Average` |
| **Operador** | `LessThanThreshold` |
| **Umbral** | `35%` |
| **Período** | `60` segundos |
| **Períodos de evaluación** | `15` |
| **Dimensión** | `AutoScalingGroupName = gautos-leccionS7-Ismael` |

**Interpretación:** Si el promedio de CPU del ASG baja del 35% durante 15 períodos consecutivos (15 minutos), se dispara el scale-in para remover instancias.

---

## 9. EVIDENCIA DE FUNCIONAMIENTO

### 9.1 Prueba del Application Load Balancer

Se realizaron múltiples peticiones HTTP al DNS del ALB para verificar el balanceo de carga:

```
http://alb-leccionS7-Ismael-1122480519.us-east-1.elb.amazonaws.com/
```

**Resultado de 3 solicitudes consecutivas:**

| Solicitud | IP Privada del servidor que respondió |
|-----------|---------------------------------------|
| 1 | `10.0.2.249` (i-082dede82eedc713a, AZ us-east-1b) |
| 2 | `10.0.2.12` (i-0464baeb65c06edd0, AZ us-east-1a) |
| 3 | `10.0.2.249` (i-082dede82eedc713a, AZ us-east-1b) |

> **Evidencia:** El Application Load Balancer distribuye correctamente el tráfico entre las instancias EC2 disponibles en diferentes zonas de disponibilidad, mostrando la IP privada de cada servidor que responde.

### 9.2 Página HTML personalizada (respuesta de los servidores)

**Respuesta típica de cada instancia:**
```html
<h1>Servidor EC2 con Auto Scaling</h1>
<h2>IP privada: 10.0.2.12</h2>
```
```html
<h1>Servidor EC2 con Auto Scaling</h1>
<h2>IP privada: 10.0.2.249</h2>
```

Cada instancia muestra correctamente su IP privada única en la página HTML, generada automáticamente desde el User Data del Launch Template.

### 9.3 Herramienta stress disponible

El Launch Template instala la herramienta `stress` en cada instancia. Para probar el Auto Scaling por CPU, se debe ejecutar dentro de una instancia:

```bash
stress --cpu 4 --timeout 600s
```

Esto sobrecargará la CPU, disparando la alarma cuando el promedio supere el 50% y causando que el ASG cree nuevas instancias automáticamente.

---

## 10. INVENTARIO COMPLETO DE RECURSOS

### Leyenda de prefijos
- `leccionS7-Ismael` = Recursos de la lección
- `prnterraform-` = Recursos de otro proyecto (no relacionados)

### Todos los recursos de la lección

| Recurso | ID | Nombre | Detalle |
|---------|-----|--------|---------|
| VPC | `vpc-0770ed59c03e29f70` | `vpc_leccions7-ismael` | `10.0.2.0/24` |
| Internet Gateway | `igw-0e51cfc7de9d650e3` | `itw-leccionS7-Ismael` | Adjunto a VPC |
| Subnet pública A | `subnet-097ad153dcdf066c8` | `subnet_leccions7-public-A` | `10.0.2.0/25`, `us-east-1a` |
| Subnet pública B | `subnet-0c4829bad8a8d259c` | `subnet_leccions7-public-B` | `10.0.2.128/25`, `us-east-1b` |
| Route Table | `rtb-0ad3dc797f34277bd` | `route-table-leccionS7-Ismael` | Ruta 0.0.0.0/0 → IGW |
| Security Group | `sg-040793afabcbc019f` | `Security-group-leccionS7-Ismael` | HTTP:80 + SSH:22 |
| Launch Template | `lt-078ce1865ed69c2ba` | `template-balancer-leccionS7-Ismael` | t2.micro, Nginx + stress |
| Target Group | `gd-leccionS7-Ismael` | `gd-leccionS7-Ismael` | HTTP:80, instance |
| ALB | `alb-leccionS7-Ismael` | `alb-leccionS7-Ismael` | internet-facing |
| ASG | `gautos-leccionS7-Ismael` | `gautos-leccionS7-Ismael` | Min:2 / Max:4 / Desired:2 |
| Scaling Policy | `cpusage` | `cpusage` | TargetTracking, CPU > 50% |
| EC2 | `i-0464baeb65c06edd0` | (ASG) | `10.0.2.12`, us-east-1a |
| EC2 | `i-082dede82eedc713a` | (ASG) | `10.0.2.249`, us-east-1b |

---

## 11. OBSERVACIONES Y HALLAZGOS

### Cumplimiento de requisitos

| Requisito | Estado | Detalle |
|-----------|--------|---------|
| VPC personalizada | Cumple | `vpc_leccions7-ismael`, `10.0.2.0/24` |
| Subredes públicas | Cumple | 2 subredes en AZs diferentes |
| Internet Gateway | Cumple | IGW adjunto, ruta configurada |
| Tablas de rutas | Cumple | Ruta 0.0.0.0/0 → IGW |
| Grupos de seguridad | Cumple | SG con HTTP:80 y SSH:22 |
| Launch Template | Cumple | AMI Ubuntu, User Data con Nginx + stress + HTML |
| Página HTML personalizada | Cumple | Muestra IP privada del servidor |
| Target Group | Cumple | HTTP:80, instancias healthy |
| ALB | Cumple | internet-facing, HTTP:80 |
| ASG - min=2 | Cumple | Mínimo 2 instancias |
| ASG - initial desired=2 | Cumple | Capacidad deseada 2 |
| ASG - max=5 | **Parcial** | Configurado en 4, no en 5 |
| Política CPU > 50% | Cumple | TargetTracking, umbral 50% |
| Herramienta stress | Cumple | Instalada en User Data |
| Balanceo de carga | Cumple | Responde desde diferentes IPs |

### Recomendación
1. Cambiar el `MaxSize` del ASG de `4` a `5` para cumplir con el requerimiento completo.
2. Considerar cambiar `MapPublicIpOnLaunch=true` en las subredes para que la configuración sea más explícita, aunque actualmente funciona correctamente por la configuración del Launch Template.

---

## 12. DIAGRAMA DE ARQUITECTURA COMPLETO (con IPs, IDs y rutas)

```
                         INTERNET
                            |
                            |
                   +--------v----------+
                   |  Internet Gateway  |
                   |  igw-0e51cfc7de   |
                   |  9d650e3          |
                   |  itw-leccionS7-   |
                   |  Ismael           |
                   +--------+----------+
                            |
                  Ruta 0.0.0.0/0 → IGW
                            |
            +---------------+---------------+
            |                               |
   +--------v----------+        +----------v--------+
   | Route Table        |        | Route Table        |
   | rtb-0ad3dc797f34   |        | rtb-0ad3dc797f34   |
   | 277bd              |        | 277bd              |
   | route-table-leccion|        | route-table-leccion|
   | S7-Ismael          |        | S7-Ismael          |
   +--------+----------+        +----------+--------+
            |                               |
  +---------v---------+         +----------v-----------+
  | Subnet public-A    |         | Subnet public-B      |
  | subnet-097ad153dc  |         | subnet-0c4829bad8a   |
  | df066c8            |         | 8d259c               |
  | 10.0.2.0/25        |         | 10.0.2.128/25        |
  | us-east-1a         |         | us-east-1b           |
  +---------+----------+         +----------+-----------+
            |                                |
    +-------v-------+                +-------v-------+
    | ALB Node AZ-a  |                | ALB Node AZ-b |
    +-------+-------+                +-------+-------+
            |                                |
            +-----------+-------------------+
                        |
                        v
          +-----------------------------+
          |  ALB Listener HTTP:80       |
          |  Forward to Target Group     |
          +-----------------------------+
                        |
                        v
          +-----------------------------+
          |  TARGET GROUP               |
          |  gd-leccionS7-Ismael        |
          |  HTTP /                     |
          +-----------------------------+
                |               |
    +-----------v---+   +-------v-----------+
    | Target 1       |   | Target 2          |
    | i-0464baeb65c0 |   | i-082dede82eedc7  |
    | 6edd0          |   | 13a               |
    | 10.0.2.12      |   | 10.0.2.249        |
    | (healthy)      |   | (healthy)         |
    +----------------+   +-------------------+
         |                        |
         v                        v
  +----------------------------+
  |     AUTO SCALING GROUP      |
  |     gautos-leccionS7-Ismael |
  |     Min:2 Max:4 Desired:2   |
  |     Launch Template:         |
  |     template-balancer-       |
  |     leccionS7-Ismael         |
  +----------------------------+
         |
         v
  +----------------------------+
  |  CloudWatch Alarms          |
  |  High: CPU > 50% (3x60s)   |
  |  Low: CPU < 35% (15x60s)   |
  |  → TargetTracking           |
  +----------------------------+
```

---

*Informe generado automáticamente mediante AWS CLI el 19 de junio de 2026.*
*Cuenta: 503561454267 | Región: us-east-1*
