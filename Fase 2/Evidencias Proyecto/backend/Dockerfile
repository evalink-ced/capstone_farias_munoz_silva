# Usar Python 3.11 sobre Debian Bookworm
FROM python:3.11-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Dependencias del sistema:
# - Psycopg2: libpq-dev (o usa 'psycopg[binary]' y te lo ahorras)
# - WeasyPrint: Cairo/Pango/GDK-PixBuf + fuentes
# - Compilación: build-essential, pkg-config
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    pkg-config \
    libpq-dev \
    curl \
    libcairo2 \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf-2.0-0 \
    libffi-dev \
    fonts-dejavu \
    tzdata \
 && rm -rf /var/lib/apt/lists/*

# Si de verdad necesitas headers (muy raro con wheels actuales), agrega:
#   libcairo2-dev libpango1.0-dev libgdk-pixbuf-2.0-dev
# pero prueba primero sólo con las runtime libs de arriba.

# Requisitos Python
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# Código
COPY . .

# Permisos script
RUN chmod +x start.sh

# Directorios necesarios
RUN mkdir -p /app/staticfiles

EXPOSE $PORT
CMD ["./start.sh"]
