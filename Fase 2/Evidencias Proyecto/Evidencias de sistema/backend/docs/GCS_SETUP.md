# Configuración de Google Cloud Storage para Django

Este proyecto está configurado para usar Google Cloud Storage (GCS) como backend de almacenamiento para archivos media.

## Variables de Entorno Requeridas

Agrega las siguientes variables a tu archivo `.env`:

```env
# Google Cloud Storage
GS_BUCKET_NAME=tu-nombre-de-bucket
GS_PROJECT_ID=tu-project-id
GOOGLE_APPLICATION_CREDENTIALS=/ruta/a/tu/service-account-key.json
# O alternativamente:
GS_CREDENTIALS_JSON='{"type": "service_account", "project_id": "...", ...}'
GS_CUSTOM_ENDPOINT=https://tu-dominio-personalizado.com  # Opcional
GS_LOCATION=media/  # Opcional: subcarpeta dentro del bucket
```

## Pasos para Configurar Google Cloud Storage

### 1. Crear un Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Anota el **Project ID**

### 2. Habilitar la API de Cloud Storage

1. En la consola de Google Cloud, ve a "APIs & Services" > "Library"
2. Busca "Cloud Storage API" y habilítala

### 3. Crear un Bucket de Storage

1. Ve a "Cloud Storage" > "Buckets"
2. Haz clic en "Create bucket"
3. Elige un nombre único para tu bucket
4. Selecciona la región más cercana a tus usuarios
5. Configura el control de acceso como "Fine-grained"

### 4. Crear una Cuenta de Servicio

1. Ve a "IAM & Admin" > "Service Accounts"
2. Haz clic en "Create Service Account"
3. Dale un nombre descriptivo (ej: "django-storage")
4. Asigna el rol "Storage Object Admin"
5. Crea y descarga la clave JSON

### 5. Configurar Permisos del Bucket

1. Ve a tu bucket en Cloud Storage
2. En la pestaña "Permissions", agrega tu cuenta de servicio
3. Asigna los roles:
   - Storage Object Admin
   - Storage Legacy Bucket Reader

### 6. Configurar CORS (si es necesario)

Si necesitas acceso desde el frontend, configura CORS:

```json
[
  {
    "origin": ["https://tu-dominio.com", "http://localhost:3000"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
```

## Configuración en Railway

En Railway, agrega las variables de entorno:

1. Ve a tu proyecto en Railway
2. Selecciona tu servicio
3. Ve a "Variables"
4. Agrega:
   - `GS_BUCKET_NAME`: nombre de tu bucket
   - `GS_PROJECT_ID`: ID de tu proyecto
   - `GS_CREDENTIALS_JSON`: contenido completo del archivo JSON de credenciales

## Verificación

Para verificar que la configuración funciona:

1. Sube un archivo a través de tu aplicación Django
2. Verifica que aparezca en tu bucket de Google Cloud Storage
3. Confirma que la URL del archivo sea accesible

## Solución de Problemas

### Error de Autenticación
- Verifica que las credenciales JSON sean válidas
- Asegúrate de que la cuenta de servicio tenga los permisos correctos

### Error 403 Forbidden
- Verifica los permisos del bucket
- Confirma que la cuenta de servicio tenga acceso al bucket

### Archivos no se muestran
- Verifica la configuración de CORS
- Confirma que `GS_DEFAULT_ACL` esté configurado correctamente

## Costos

Google Cloud Storage cobra por:
- Almacenamiento de datos
- Operaciones (subida, descarga, listado)
- Transferencia de datos

Revisa la [calculadora de precios](https://cloud.google.com/products/calculator) para estimar costos.

## Seguridad

- Nunca commits las credenciales JSON al repositorio
- Usa variables de entorno para todas las configuraciones sensibles
- Revisa regularmente los permisos de tu cuenta de servicio
- Considera usar IAM conditions para mayor seguridad