#!/usr/bin/env bash
set -e

KMOD_DIR="monitor/proc"   # ajusta si tu carpeta se llama distinto
RAM_KO="ram_202100308.ko"   # cambia al nombre exacto de tu .ko
CPU_KO="cpu_202100308.ko"

echo "🧹  Deteniendo stack Docker…"
docker-compose down    # elimina contenedores y volúmenes nombrados

echo "🧹  Limpiando imágenes huérfanas (opcional)…"
docker image prune -f

echo "🗑️  Descargando módulos del kernel (si están cargados)…"
sudo rmmod "$RAM_KO" 2>/dev/null || true
sudo rmmod "$CPU_KO" 2>/dev/null || true

echo "🧹  Eliminando artefactos de compilación…"
cd "$KMOD_DIR"
make clean
cd - >/dev/null

echo "✅ Limpieza completa."
