# Guía de Configuración del Backend

Esta guía detalla los pasos necesarios para configurar y ejecutar el backend del proyecto en un entorno local.

## Prerrequisitos

*   Python 3.8 o superior
*   PostgreSQL (o acceso a una base de datos PostgreSQL, ya que la configuración de desarrollo espera una URL de base de datos)
*   Git

## Pasos de Instalación

Sigue estos pasos para preparar tu entorno de desarrollo.

### 1. Crear un Entorno Virtual

Es fundamental trabajar dentro de un entorno virtual para aislar las dependencias del proyecto.

**En Windows:**
```bash
python -m venv venv
.\venv\Scripts\activate
```

**En macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 2. Instalar Dependencias

Una vez activado el entorno virtual, instala las librerías requeridas listadas en `requirements.txt`:

```bash
pip install -r requirements.txt
```

### 3. Configuración de Variables de Entorno (.env)

Crea un archivo llamado `.env` en la raíz del proyecto (al mismo nivel que `manage.py`). Copia el siguiente contenido. 

**Nota:** Se han ocultado los valores sensibles. Debes completar con tus propias credenciales donde se indique. La `DJANGO_SECRET_KEY` se muestra como ejemplo para desarrollo local = "django-insecure-lx=@o04a%fiq07dre9ls^oqy5)-urfza2&it-4$zx6z$@o%ywa".

```env
# --- Configuración General ---
# Clave secreta para desarrollo local. NO usar esta clave en producción.
DJANGO_SECRET_KEY=django-insecure-dev-key-change-me-in-production-12345

# Activar modo debug para ver errores detallados
DEBUG=True

# URLs del entorno
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000

# --- Base de Datos ---
# Formato: postgres://usuario:password@host:puerto/nombre_db
DATABASE_PUBLIC_URL=postgres://postgres:postgres@localhost:5432/nombre_tu_bd
# DATABASE_URL=  # Usado en producción

# --- Autenticación Google (Login Social) ---
GOOGLE_CLIENT_ID=tu_google_client_id_aqui

# --- Envío de Correos (Gmail) ---
GMAIL_CLIENT_ID=tu_gmail_client_id_aqui
GMAIL_CLIENT_SECRET=tu_gmail_client_secret_aqui
GMAIL_REFRESH_TOKEN=tu_gmail_refresh_token_aqui
GMAIL_FROM="Día Administrativo <dias_administrativos@cslb.cl>"

# --- Google Cloud Storage (Archivos Media) ---
# Dejar en false para usar almacenamiento local en desarrollo
USE_GCS=false
GS_CREDENTIALS_BASE64=
GS_BUCKET_NAME=media_ced
GS_PROJECT_ID=dias-administrativos

# --- Otros ---
CRON_TOKEN=token_opcional_para_cron
```

### 4. Base de Datos y Ejecución

Asegúrate de que tu base de datos PostgreSQL esté corriendo y que la URL en `DATABASE_PUBLIC_URL` sea correcta.

1.  **Aplicar migraciones:**
    Esto creará las tablas necesarias en tu base de datos.
    ```bash
    python manage.py migrate
    ```

2.  **Crear un superusuario (opcional):**
    Para acceder al panel de administración (/admin).
    ```bash
    python manage.py createsuperuser
    ```

3.  **Correr el servidor:**
    ```bash
    python manage.py runserver
    ```

El servidor estará disponible en `http://localhost:8000/`.

### 5. Ejecución con Docker (Opcional)

Si prefieres usar Docker para levantar el proyecto, asegúrate de tener Docker y Docker Compose instalados.

1.  **Construir y levantar los contenedores:**
    ```bash
    docker-compose up --build
    ```
    Este comando construirá la imagen del backend y levantará los servicios definidos en `docker-compose.yml` (web y nginx).

    **Nota:** El archivo `docker-compose.yml` está configurado para usar `colegio.settings.prod` y espera ciertas variables de entorno adicionales o diferentes a las de desarrollo local (como `DATABASE_URL` en lugar de `DATABASE_PUBLIC_URL`). Asegúrate de revisar y ajustar las variables de entorno en el archivo `docker-compose.yml` o en tu archivo `.env` para que coincidan con la configuración deseada para Docker.

2.  **Acceder a la aplicación:**
    Una vez que los contenedores estén corriendo, la aplicación debería estar accesible en `http://localhost:8000` (directo al backend) o a través de Nginx si está configurado correctamente.

3.  **Detener los contenedores:**
    ```bash
    docker-compose down
    ```
