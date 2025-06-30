# Etapa 1: Build de la app React
FROM node:20-alpine AS builder
WORKDIR /app

# Instala dependencias
COPY package*.json ./
RUN npm install

# Copia el resto de archivos y construye
COPY . .
RUN npm run build

# Etapa 2: Producción con "serve"
FROM node:20-alpine
WORKDIR /app

# Instala "serve" globalmente para servir el contenido estático
RUN npm install -g serve

# Copia la build desde la etapa anterior
COPY --from=builder /app/build ./build

# Usa el script start: serve -s build -l $PORT
EXPOSE 8080
ENV PORT 8080
CMD ["serve", "-s", "build", "-l", "8080"]
