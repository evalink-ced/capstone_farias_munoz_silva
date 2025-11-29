#!/bin/bash
set -e

# Si Railway no define PORT, usamos 8000 por defecto
PORT="${PORT:-8000}"

echo "🚀 Iniciando aplicación en Railway..."

echo "📊 Ejecutando migraciones..."
python manage.py migrate --noinput

echo "📁 Recopilando archivos estáticos..."
python manage.py collectstatic --noinput

echo "🟢 Iniciando servidor en el puerto ${PORT}..."
exec gunicorn colegio.wsgi:application \
  --bind 0.0.0.0:${PORT} \
  --workers 2 \
  --timeout 120
