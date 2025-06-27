# Manual Técnico - Proyecto Fase 1: Monitor de Servicios Linux
## Jose Manuel Lopez Lemus - 202100308

## Introducción

Este proyecto tiene como objetivo implementar un sistema de monitoreo de recursos Linux utilizando módulos de kernel en C, un agente de monitoreo en Golang, una API en Node.js, un frontend en React, y contenedores gestionados con Docker. El sistema recopila métricas de CPU y RAM, las almacena en una base de datos MySQL, y las visualiza en un dashboard en tiempo real.

---

## Objetivos

- Comprender el funcionamiento del kernel de Linux mediante módulos en C.
- Utilizar Golang para la gestión de métricas del sistema.
- Implementar contenedores con Docker y automatizar tareas con scripts bash.
- Desarrollar una API en Node.js para la comunicación con la base de datos.
- Crear un frontend en React para la visualización de métricas en tiempo real.

---

## Arquitectura del Sistema

El sistema está compuesto por los siguientes componentes:

1. **Módulos de Kernel (C)**:

   - **Módulo de RAM**: Lee información de memoria desde `/proc/ram_202100308` utilizando `<sys/sysinfo.h>` y `<linux/mm.h>`. Genera datos en formato JSON con `total_ram`, `free_ram`, `used_ram`, y `ram_usage_percent`.
   - **Módulo de CPU**: Lee información de CPU desde `/proc/cpu_202100308` utilizando `<linux/sched.h>` y `<linux/sched/signal.h>`. Genera datos en formato JSON con `total_processes`, `running_processes`, `online_cpus`, y `cpu_usage_percent`.

2. **Agente de Monitoreo (Golang)**:

   - Programa containerizado que lee los archivos `/proc/ram_202100308` y `/proc/cpu_202100308`, parsea los datos JSON, y los envía a la API Node.js cada 5 segundos utilizando rutinas concurrentes.

3. **API (Node.js)**:

   - Expone endpoints para recibir datos de RAM y CPU (`POST /api/ram`, `POST /api/cpu`) y consultarlos (`GET /api/ram`, `GET /api/cpu`). Almacena las métricas en una base de datos MySQL.

4. **Base de Datos (MySQL)**:

   - Almacena métricas de RAM y CPU en tablas `ram` y `cpu` con persistencia mediante un volumen Docker.

5. **Frontend (React)**:

   - Muestra gráficas en tiempo real del uso de RAM y CPU, métricas actuales, y detalles de los recursos utilizando la librería Recharts.

6. **Automatización (Bash)**:

   - Scripts para:
     - Desplegar 10 contenedores para estresar CPU y RAM.
     - Instalar y configurar módulos del kernel.
     - Eliminar servicios.
     - Desplegar contenedores con Docker Compose.

7. **Docker y Docker Compose**:

   - Gestiona los contenedores de la aplicación (agente, API, base de datos, frontend). Las imágenes se alojan en DockerHub.

---

## Requisitos

- **Sistema Operativo**: Ubuntu 20.04 o 22.04.
- **Dependencias**:
  - Docker y Docker Compose.
  - Go (para el agente de monitoreo).
  - Node.js y npm (para la API y frontend).
  - MySQL (containerizado).
  - Compilador GCC (para módulos de kernel).
- **DockerHub**: Imágenes de contenedores publicadas.

---

## Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Josmalopez77/SO1_202100308
cd Proyecto1_Fase1
```

### 2. Configurar Módulos del Kernel

- Compilar e instalar los módulos de kernel:

```bash
cd kernel_modules
make
sudo insmod ram_202100308.ko
sudo insmod cpu_202100308.ko
```

- Verificar que los módulos estén cargados:

```bash
lsmod | grep 202100308
```

### 3. Configurar Variables de Entorno

- Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
DB_HOST=mysql
DB_USER=root
DB_PASSWORD=<contraseña>
DB_PORT=3306
DB_NAME=monitor
PORT=3000
```

### 4. Desplegar Contenedores

- Usar Docker Compose para iniciar los servicios:

```bash
docker-compose up -d
```

- Servicios desplegados:
  - `mysql`: Base de datos.
  - `api`: API Node.js.
  - `frontend`: Aplicación React.
  - `agent`: Agente de monitoreo en Golang.

### 5. Acceder a la Aplicación

- Frontend: `http://localhost:3001`
- API: `http://localhost:3000/api/health`
- Base de datos: Conectar usando `mysql -h localhost -u root -p`

### 6. Scripts de Automatización

- **Crear los archivos del Kernel**:

```bash
bash ./modulosKernel.sh
```

- **Levantar Todo con Compose**:

```bash
bash ./dockerUp.sh
```

- **Desplegar contenedores de estrés**:

```bash
bash ./contenedorEstres.sh
```

- **Eliminar servicios**:

```bash
bash ./limpiar.sh
```



---

## Estructura del Proyecto

```
Proyecto1_Fase1/
├── kernel_modules/
│   ├── ram_202100308.c
│   ├── cpu_202100308.c
│   └── Makefile
├── agent/
│   ├── main.go
│   └── Dockerfile
├── api/
│   ├── server.js
│   ├── database.js
│   ├── Dockerfile
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   └── App.css
│   ├── Dockerfile
│   └── package.json
├── scripts/
│   ├── stress_test.sh
│   ├── cleanup.sh
│   └── install_modules.sh
├── docker-compose.yml
└── README.md
```

---

## Detalles de Implementación

### Módulos de Kernel

- **RAM**: Utiliza `sysinfo` para obtener métricas de memoria y las expone en `/proc/ram_202100308`.
- **CPU**: Utiliza estructuras de `sched` para contar procesos y núcleos, expone datos en `/proc/cpu_202100308`.

### Agente de Monitoreo

- Lee archivos `/proc` cada 5 segundos.
- Parseo de JSON con la librería `encoding/json`.
- Envío de datos a la API usando `net/http`.

### API

- Endpoints:
  - `POST /api/ram`: Inserta datos de RAM.
  - `POST /api/cpu`: Inserta datos de CPU.
  - `GET /api/ram`: Obtiene las últimas 10 entradas de RAM.
  - `GET /api/cpu`: Obtiene las últimas 10 entradas de CPU.
  - `GET /api/health`: Verifica el estado de la API.
- Conexión a MySQL con `mysql2/promise`.

### Frontend

- Librerías: React, Recharts, Lucide-React.
- Muestra:
  - Gráficas en tiempo real (RAM y CPU).
  - Métricas actuales (uso de RAM/CPU, total RAM, procesos).
  - Detalles de recursos (RAM total/libre/usada, núcleos, procesos).

### Base de Datos

- Tablas:
  - `ram`: `id`, `total_ram`, `free_ram`, `used_ram`, `ram_usage_percent`, `timestamp`.
  - `cpu`: `id`, `total_processes`, `running_processes`, `online_cpus`, `cpu_usage_percent`, `timestamp`.
- Persistencia mediante volumen Docker.

---

## Pruebas

1. **Módulos de Kernel**:

   - Verificar archivos `/proc/ram_202100308` y `/proc/cpu_202100308`:

   ```bash
   cat /proc/ram_202100308
   cat /proc/cpu_202100308
   ```

2. **Agente de Monitoreo**:

   - Comprobar logs del contenedor:

   ```bash
   docker logs agent
   ```

3. **API**:

   - Probar endpoints con `curl`:

   ```bash
   curl http://localhost:3000/api/health
   curl http://localhost:3000/api/ram
   ```

4. **Frontend**:

   - Acceder a `http://localhost:3001` y verificar que las gráficas se actualicen cada 5 segundos.

5. **Base de Datos**:

   - Conectar a MySQL y verificar datos:

   ```sql
   SELECT * FROM ram LIMIT 10;
   SELECT * FROM cpu LIMIT 10;
   ```

---

