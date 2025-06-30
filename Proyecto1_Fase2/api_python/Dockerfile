# Imagen base con Python
FROM python:3.10-slim

# Establecer directorio de trabajo
WORKDIR /app

# Copiar los archivos del proyecto
COPY . .

# Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Puerto expuesto (ajusta si usas otro)
EXPOSE 3001

# Comando para ejecutar la API
CMD ["python", "api.py"]
