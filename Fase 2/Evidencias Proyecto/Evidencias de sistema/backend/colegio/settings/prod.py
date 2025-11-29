# colegio/settings/prod.py

from .base import *
import os
from decouple import config
import dj_database_url
from .gcs_storage_config import *
# DEBUG explícito
DEBUG = config('DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = [
    "eva-link.com",
    "www.eva-link.com",
    "back.eva-link.com",
    "comunidadeducativadigital.cl",
    "www.comunidadeducativadigital.cl",
    "back.comunidadeducativadigital.cl",
    "backendcomunidad-production.up.railway.app",
    "localhost",
]

# Media files ahora se manejan con Google Cloud Storage
# Ver configuración en gcs_storage_config.py


SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

SESSION_COOKIE_SAMESITE = "None"
CSRF_COOKIE_SAMESITE = "None"
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# CSRF Origins - MUY PERMISIVO para debugging
CSRF_TRUSTED_ORIGINS = [
    "https://*.railway.app",
    "https://*.up.railway.app",
    "https://*.railway.app",
    "https://*.up.railway.app",   
    "https://backendcomunidad-production.up.railway.app",
    "https://comunidadeducativadigital.cl",
    "https://back.comunidadeducativadigital.cl",
    "https://www.comunidadeducativadigital.cl",
    "https://back.eva-link.com",
    "https://www.eva-link.com",
    "https://eva-link.com",
    "https://localhost",  # <-- añadido para uso desde WebView/Capacitor
]


# Configuración usando DATABASE_URL de Railway con decouple
DATABASES = {
    'default': dj_database_url.parse(
        config('DATABASE_URL'),
        conn_max_age=600,
        ssl_require=True
    )
}

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',  # Esto envía logs al stdout
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',  # o DEBUG si quieres más detalles
    },
}


CORS_ALLOWED_ORIGINS = [
    "https://*.railway.app",
    "https://*.up.railway.app",
    "https://*.railway.app",
    "https://*.up.railway.app",   
    "https://backendcomunidad-production.up.railway.app",
    "https://comunidadeducativadigital.cl",
    "https://back.comunidadeducativadigital.cl",
    "https://www.comunidadeducativadigital.cl",
    "https://back.eva-link.com",
    "https://www.eva-link.com",
    "https://eva-link.com",
    "https://localhost",  # <-- añadido
]
# Permitir orígenes de apps híbridas (Capacitor/Ionic)
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^capacitor://localhost$",
    r"^ionic://localhost$",
    r"^http://localhost(:\d+)?$",
    r"^https://localhost(:\d+)?$",
]

CORS_ALLOW_CREDENTIALS = True


CORS_ALLOW_HEADERS = [
    "content-type",
    "authorization",
    "x-requested-with",
]
ADMINS = [('diasadmin', 'dias_administrativos@cslb.cl')]
CORS_ALLOW_METHODS = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
]

GMAIL_CLIENT_ID = config("GMAIL_CLIENT_ID")
GMAIL_CLIENT_SECRET = config("GMAIL_CLIENT_SECRET")
GMAIL_REFRESH_TOKEN = config("GMAIL_REFRESH_TOKEN")

# remitente visible (misma cuenta que autorizaste)
GMAIL_FROM = config("GMAIL_FROM", default="Día Administrativo <dias_administrativos@cslb.cl>")

EMAIL_TIMEOUT = 15  # opcional, ya no usamos SMTP pero mantenlo