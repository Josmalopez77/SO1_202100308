#!/usr/bin/env bash
set -e

KMOD_DIR="monitor/proc"   # cambia esto si tu carpeta tiene otro nombre
RAM_KO="ram_202100308.ko"
CPU_KO="cpu_202100308.ko"
PROCESOS_KO="procesos_202100308.ko"

echo "🛠️ Compilando módulos del kernel..."
cd "$KMOD_DIR"
make clean
make

echo "✅ Compilación completa:"
ls -lh *.ko

echo "🔄 Descargando módulos previos (si están cargados)..."
sudo rmmod ram_202100308 2>/dev/null || true
sudo rmmod cpu_202100308 2>/dev/null || true
sudo rmmod procesos_202100308 2>/dev/null || true

echo "📦 Insertando módulos al kernel..."
sudo insmod "$RAM_KO"
sudo insmod "$CPU_KO"
sudo insmod "$PROCESOS_KO"

echo "✅ Módulos cargados. Puedes verificar con:"
echo "  cat /proc/ram_202100308"
echo "  cat /proc/cpu_202100308"
echo "  cat /proc/procesos_202100308"

cd - >/dev/null
