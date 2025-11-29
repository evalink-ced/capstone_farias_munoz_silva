# colegio/settings/gcs_storage_config.py
import base64, json
from django.core.exceptions import ImproperlyConfigured
from decouple import config as env   # <<< usa decouple, no os.getenv

USE_GCS = env("USE_GCS", default="false").lower() in ("1", "true", "yes")

if not USE_GCS:
    STORAGES = {
        "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
        "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
    }
    MEDIA_URL = "/media/"
else:
    from google.oauth2 import service_account

    cred_b64 = env("GS_CREDENTIALS_BASE64", default="").strip()
    cred_file = env("GOOGLE_APPLICATION_CREDENTIALS", default="").strip()

    if cred_b64:
        try:
            info = json.loads(base64.b64decode(cred_b64).decode("utf-8"))
            GS_CREDENTIALS = service_account.Credentials.from_service_account_info(info)
        except Exception as e:
            raise ImproperlyConfigured(f"GS_CREDENTIALS_BASE64 inválido: {e}")
    elif cred_file:
        GS_CREDENTIALS = service_account.Credentials.from_service_account_file(cred_file)
    else:
        raise ImproperlyConfigured(
            "Faltan credenciales GCS. Define GS_CREDENTIALS_BASE64 o GOOGLE_APPLICATION_CREDENTIALS, "
            "o desactiva con USE_GCS=false."
        )

    GS_BUCKET_NAME = env("GS_BUCKET_NAME", default="media_ced")
    GS_PROJECT_ID = env("GS_PROJECT_ID", default="dias-administrativos")

    STORAGES = {
        "default": {"BACKEND": "storages.backends.gcloud.GoogleCloudStorage"},
        "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
    }
    DEFAULT_FILE_STORAGE = "storages.backends.gcloud.GoogleCloudStorage"

    GS_DEFAULT_ACL = None
    GS_FILE_OVERWRITE = False
    GS_MAX_MEMORY_SIZE = 5 * 1024 * 1024
    GS_EXPIRATION = 3600
    GS_BLOB_CHUNK_SIZE = 256 * 1024
    GS_QUERYSTRING_AUTH = True

    GS_CUSTOM_ENDPOINT = env("GS_CUSTOM_ENDPOINT", default="")
    if GS_CUSTOM_ENDPOINT:
        MEDIA_URL = f"{GS_CUSTOM_ENDPOINT}/{GS_BUCKET_NAME}/"
    else:
        MEDIA_URL = f"https://storage.googleapis.com/{GS_BUCKET_NAME}/"

    GS_LOCATION = env("GS_LOCATION", default="")
