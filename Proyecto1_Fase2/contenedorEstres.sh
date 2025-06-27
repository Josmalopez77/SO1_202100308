# #!/usr/bin/env bash
# set -e

# echo "⚙️  Iniciando stress test (10 s)…"
# docker run -ti --rm polinux/stress \
#   stress --cpu 1 --io 1 --vm 1 --vm-bytes 128M --timeout 10s --verbose
# echo "✅ Stress test finalizado."

#!/usr/bin/env bash
set -e

echo "⚙️ Iniciando stress test de CPU y RAM (10 s)…"
docker run -ti --rm polinux/stress \
  stress --cpu 4 --vm 4 --vm-bytes 1G --timeout 10s --verbose
echo "✅ Stress test de CPU y RAM finalizado."