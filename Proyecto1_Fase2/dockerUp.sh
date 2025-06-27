#!/usr/bin/env bash
set -e
echo "🐳 Construyendo y levantando contenedores…"
docker-compose down        # detiene si hubiera algo previo
docker-compose up -d --build

echo "✅ Stack arriba. Contenedores activos:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
