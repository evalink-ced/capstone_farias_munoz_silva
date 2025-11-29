import os

from colegio.settings.base import BASE_DIR

# Configuración de archivos estáticos (CSS, JS, etc.)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# NOTA: MEDIA_URL y MEDIA_ROOT se configuran en gcs_storage_config.py para usar Google Cloud Storage
# Solo definir configuración local de media para desarrollo si no hay GCS configurado
if not os.getenv('GS_CREDENTIALS_BASE64') and not os.getenv('GOOGLE_APPLICATION_CREDENTIALS'):
    MEDIA_URL = '/media/'
    MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
