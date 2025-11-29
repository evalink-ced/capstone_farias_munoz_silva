CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://backendcomunidad-production.up.railway.app",
    "https://www.comunidadeducativadigital.cl",
    "https://comunidadeducativadigital.cl",
    "https://www.eva-link.com",
    "https://eva-link.com",
]
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://backendcomunidad-production.up.railway.app",
    "https://www.comunidadeducativadigital.cl",
    "https://comunidadeducativadigital.cl",
    "https://www.eva-link.com",
    "https://eva-link.com",
]

CORS_ALLOW_CREDENTIALS = True


CORS_ALLOW_HEADERS = ["content-type", "authorization"]
CORS_ALLOW_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]