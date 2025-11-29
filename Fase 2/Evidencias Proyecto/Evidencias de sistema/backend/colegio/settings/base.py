from pathlib import Path
from datetime import timedelta
from decouple import config
import os
import sys
FRONTEND_URL = config('FRONTEND_URL')
BACKEND_URL = config('BACKEND_URL')
GOOGLE_CLIENT_ID = config('GOOGLE_CLIENT_ID')
# -------------------------------------------------------------------
# RUTA BASE DEL PROYECTO
# -------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent.parent




# -------------------------------------------------------------------
# CLAVE SECRETA (desde .env)
# -------------------------------------------------------------------
SECRET_KEY = config('DJANGO_SECRET_KEY')
CRON_TOKEN = os.getenv("CRON_TOKEN", "")
# -------------------------------------------------------------------
# APLICACIONES INSTALADAS
# -------------------------------------------------------------------
INSTALLED_APPS = [
    # Django
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Apps propias
    "usuarios",
    
    "institucion",
    
    "historial",
   
    "api",

    "evaluacion",
    "acceso",
    "theme",
    

    # Terceros
    "drf_spectacular",
    "drf_spectacular_sidecar",
    'django_ckeditor_5',
    "crispy_forms",
    "crispy_bootstrap5",
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'storages',
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.google",
    "import_export",
    'corsheaders',
]

# -------------------------------------------------------------------
# MIDDLEWARE
# -------------------------------------------------------------------
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
    "middleware.error_redirect_middleware.ErrorRedirectMiddleware",  # Middleware personalizado para errores
    
]
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# -------------------------------------------------------------------
# URL y WSGI
# -------------------------------------------------------------------
ROOT_URLCONF = 'colegio.urls'
WSGI_APPLICATION = "colegio.wsgi.application"

# -------------------------------------------------------------------
# TEMPLATES
# -------------------------------------------------------------------
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        'DIRS': [os.path.join(BASE_DIR, 'usuarios', 'templates')],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "django.template.context_processors.request",
            ],
        },
    },
]


REST_FRAMEWORK = {
    "EXCEPTION_HANDLER": "rest_framework.views.exception_handler",
    "DEFAULT_RENDERER_CLASSES": (
        "rest_framework.renderers.JSONRenderer",
    ),
    "DEFAULT_PARSER_CLASSES": (
        "rest_framework.parsers.JSONParser",
        "rest_framework.parsers.MultiPartParser",
        "rest_framework.parsers.FormParser",
    ),
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "UNICODE_JSON": True,
    "DEBUG": True,  # <---
}

# -------------------------------------------------------------------
# JWT - SIMPLE JWT
# -------------------------------------------------------------------
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=3),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
}

# -------------------------------------------------------------------
# CKEDITOR CONFIG
# -------------------------------------------------------------------
CKEDITOR_5_CONFIGS = {
    'default': {
        'toolbar': ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote'],
    },
}

CKEDITOR_CONFIGS = {
    'default': {
        'toolbar': 'Full',
        'width': 'auto',
        'height': 300,
    }
}

# -------------------------------------------------------------------
# VALORES GENERALES
# -------------------------------------------------------------------
X_FRAME_OPTIONS = 'ALLOWALL'
DEFAULT_AUTO_FIELD = 'django.db.models.AutoField'

# -------------------------------------------------------------------
# VALIDADORES DE CONTRASEÑA
# -------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# -------------------------------------------------------------------
# INTERNACIONALIZACIÓN
# -------------------------------------------------------------------
LANGUAGE_CODE = "es-cl"
TIME_ZONE = 'America/Santiago'
USE_I18N = True
USE_TZ = True
USE_L10N = True



LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'stream': sys.stdout,  # ⬅️ Asegura que vaya al stdout
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}

# -------------------------------------------------------------------
# CONFIGURACIONES EXTERNAS MODULARES
# -------------------------------------------------------------------
from .jazzmin_config import JAZZMIN_SETTINGS, JAZZMIN_UI_TWEAKS
from .social_auth_config import AUTHENTICATION_BACKENDS, SITE_ID, SOCIALACCOUNT_PROVIDERS, SOCIALACCOUNT_STORE_TOKENS
from .cron_config import CRON_CLASSES
from .login_redirect_config import (
    LOGIN_URL,
    LOGIN_REDIRECT_URL,
    LOGOUT_REDIRECT_URL,
    ACCOUNT_AUTHENTICATED_LOGIN_REDIRECTS,
    ACCOUNT_LOGOUT_REDIRECT_URL,
    ACCOUNT_LOGIN_REDIRECT_URL
)
from .cors_config import CORS_ALLOW_CREDENTIALS, CORS_ALLOW_HEADERS, CORS_ALLOW_METHODS,CORS_ALLOWED_ORIGINS
from .static_media_config import STATIC_URL, STATIC_ROOT, STATICFILES_STORAGE
# Import GCS config only if credentials are available
try:
    from .gcs_storage_config import *
except ValueError:
    # GCS credentials not found, will use local storage in dev
    pass
from .allauth_config import (
    ACCOUNT_AUTHENTICATED_LOGIN_REDIRECTS,
    ACCOUNT_LOGIN_METHODS,
    ACCOUNT_UNIQUE_EMAIL,
    ACCOUNT_EMAIL_VERIFICATION,
    ACCOUNT_LOGOUT_ON_GET,
    ACCOUNT_LOGIN_ON_GET,
    SOCIALACCOUNT_QUERY_EMAIL,
    SOCIALACCOUNT_AUTO_SIGNUP,
    ACCOUNT_SIGNUP_FIELDS,
    AUTH_USER_MODEL,
    SOCIALACCOUNT_ADAPTER,
    CSRF_COOKIE_SECURE,
    CSRF_COOKIE_SAMESITE,
    SESSION_COOKIE_SECURE,SESSION_COOKIE_SAMESITE,
)
from .crispy_config import CRISPY_ALLOWED_TEMPLATE_PACKS, CRISPY_TEMPLATE_PACK
