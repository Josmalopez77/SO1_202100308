# Manual Técnico - Proyecto Fase 2: Monitor de Servicios Linux
## Jose Manuel Lopez Lemus - 202100308

## Introducción

Este proyecto tiene como objetivo implementar un sistema de monitoreo de recursos Linux en tiempo real, basado en módulos del kernel, un agente en Golang, APIs RESTful y WebSocket, un frontend en React, y herramientas de contenedorización y orquestación. En esta fase se ha llevado el proyecto a un entorno en la nube, integrando servicios como Cloud SQL, Google Cloud Run y pruebas de carga con Locust.

---

## Objetivos

- Integrar almacenamiento en la nube con Cloud SQL (MySQL).
- Crear dos APIs para insertar datos de CPU, RAM y procesos.
- Implementar una API WebSocket para comunicación en tiempo real con el frontend.
- Desplegar el frontend en Google Cloud Run.
- Ejecutar pruebas de carga usando Locust.
- Aplicar traffic splitting y balanceo de carga con Ingress.
- Utilizar Docker y Kubernetes para desplegar los servicios.

---

## Arquitectura del Sistema

El sistema está compuesto por los siguientes componentes:

1. **Módulos del Kernel (C)**:
   - `ram_202100308.ko`: Lee información de memoria desde `/proc/ram_202100308`.
   - `cpu_202100308.ko`: Lee información de CPU desde `/proc/cpu_202100308`.
   - `procesos_202100308.ko`: Lee información de procesos desde `/proc/procesos_202100308`.

2. **Agente de Monitoreo (Golang)**:
   - Lee los archivos `/proc/ram_202100308`, `/proc/cpu_202100308`, y `/proc/procesos_202100308`.
   - Envía los datos cada 5 segundos a dos APIs distintas (Node.js y Python).

3. **APIs REST**:
   - **API Node.js**:
     - Endpoints: `POST /api/ram`, `POST /api/cpu`, `POST /api/procesos`, `GET /api/health`
     - Inserta datos en Cloud SQL.
   - **API Python (Flask)**:
     - Endpoints similares al de Node.js, usada en paralelo para comparación y pruebas de carga.

4. **API WebSocket (Node.js + Socket.IO)**:
   - Consulta datos desde Cloud SQL cada 5 segundos.
   - Envía los datos al frontend mediante sockets para visualización en tiempo real.

5. **Base de Datos (Cloud SQL - MySQL)**:
   - Tablas: `ram`, `cpu`, `procesos`.
   - Gestionada desde Google Cloud con conexiones seguras desde las APIs.

6. **Frontend (React en Cloud Run)**:
   - Recibe datos en tiempo real desde el WebSocket.
   - Muestra gráficas en tiempo real con Recharts.
   - Desplegado mediante Docker e imagen subida a Google Artifact Registry.

7. **Locust - Generador de Tráfico**:
   - Simula usuarios concurrentes enviando métricas falsas a las APIs.
   - Utiliza archivo JSON para leer datos predefinidos.
   - Se mide rendimiento bajo carga.

8. **Contenedores de Estrés**:
   - Imagen `polinux/stress` para simular carga de CPU y RAM.
   - Desplegados automáticamente con scripts Bash y Docker Compose.

9. **Kubernetes e Ingress**:
   - Las APIs están desplegadas como servicios en un clúster.
   - Se usa `nginx-ingress` para realizar traffic splitting entre API Python y Node.js.
   - Se definen reglas para enrutar el tráfico hacia las APIs con porcentaje de división.

---

## Flujo General del Sistema

1. Módulos del kernel generan datos JSON en `/proc`.
2. Agente en Go lee y envía estos datos a ambas APIs.
3. APIs insertan los datos en la base de datos en la nube.
4. WebSocket consulta datos actualizados y los emite.
5. Frontend recibe los datos y actualiza las gráficas.
6. Locust genera tráfico para simular condiciones de carga.

---

## Despliegue en la Nube

### Cloud SQL
- MySQL 8 en Google Cloud.
- Conexión mediante variables de entorno y secretos seguros.

### Frontend
- Desplegado en Cloud Run.
- Dockerfile personalizado con `serve -s build`.

### APIs (Python y Node.js)
- Desplegadas en instancias separadas en Kubernetes.
- Gestionadas mediante Ingress.
- Permiten pruebas A/B y splitting del tráfico.

### WebSocket API
- Servicio independiente.
- Consultas programadas cada 5 segundos.
- Push al frontend mediante canal WebSocket.

### Locust
- Se ejecuta desde contenedor local o VM.
- Usa archivo JSON con datos generados previamente.
- Pruebas ejecutadas contra ambas APIs para benchmarking.

---

## Scripts y Automatización

- `modulosKernel.sh`: Instala los módulos de RAM, CPU y procesos.
- `dockerUp.sh`: Levanta los contenedores locales.
- `contenedorEstres.sh`: Lanza los contenedores de carga.
- `limpiar.sh`: Elimina contenedores, redes y volúmenes.
- `locustfile.py`: Define comportamiento de usuarios en Locust.

---

## Repositorio y Estructura


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

## Resultados

- Datos insertados exitosamente en Cloud SQL por ambas APIs.
- WebSocket funcionando con actualización en tiempo real.
- Frontend desplegado y funcional desde Cloud Run.
- Locust ejecutando pruebas con carga de usuarios concurrentes.
- Módulos del kernel funcionando y generando datos.
- Traffic splitting funcionando entre ambas APIs.

---

## Conclusiones

La fase 2 del proyecto ha permitido llevar la arquitectura local a un entorno escalable y profesional en la nube. Se integraron mecanismos de monitoreo en tiempo real, orquestación de servicios, pruebas de carga, y despliegues modernos con Docker, Kubernetes y Google Cloud, consolidando así un sistema robusto de monitoreo de servicios Linux.

---

