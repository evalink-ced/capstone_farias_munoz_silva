from .base import *
from decouple import config
import dj_database_url
from .gcs_storage_config import *
import os

DEBUG = True
ALLOWED_HOSTS = ['*']

# Override logging configuration for development debugging

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

SESSION_COOKIE_SAMESITE = "None"
CSRF_COOKIE_SAMESITE = "None"
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# CSRF Origins - MUY PERMISIVO para debugging
CSRF_TRUSTED_ORIGINS = [
    "https://www.gsr.cat",
    "https://gsr.cat",
    "https://www.comunidadeducativadigital.cl",
    "https://comunidadeducativadigital.cl",
    "http://localhost:5173",
    "https://localhost",
    "https://back.gsr.cat",
    "http://localhost:8000",
    
]


DATABASES = {
    'default': dj_database_url.parse(
        config('DATABASE_PUBLIC_URL'),
        conn_max_age=600,
        ssl_require=True
    )
}

# DATABASES = {
#    'default': {    
#        'ENGINE': 'django.db.backends.sqlite3',
#        'NAME': BASE_DIR / 'db2.sqlite3'
#    }
# }


LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'stream': sys.stdout,
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
    'loggers': {
        'beneficio.views.views': {
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': False,
        },
    },
}

# Override GCS storage settings for local development
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",   # si haces llamadas desde 5173 a 8000 con fetch, no hace falta, pero no molesta
    "https://www.gsr.cat",
    "https://gsr.cat",
    "https://back.gsr.cat",
    "https://localhost",
    "https://backendcomunidad-production.up.railway.app",
]
CORS_ALLOW_NULL_ORIGIN = True   # 🔑 para cuando el navegador envía Origin: null en recursos <img>

# Si quieres limitar a media (opcional)
# CORS_URLS_REGEX = r"^/media/.*$"

# Si usas cookies/credenciales cruzadas (fetch con credentials: 'include'):
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    "content-type",
    "authorization",
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
