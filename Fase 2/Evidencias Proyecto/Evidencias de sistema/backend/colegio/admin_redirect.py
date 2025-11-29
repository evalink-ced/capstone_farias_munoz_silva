from django.http import HttpResponseRedirect
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def redirect_to_frontend_login(request):
    """Redirige al frontend incluso en caso de errores del servidor"""
    try:
        return HttpResponseRedirect(settings.LOGIN_URL)
    except Exception as e:
        logger.error(f"Error en redirect_to_frontend_login: {e}")
        # En caso de cualquier error, redirigir a una URL de frontend por defecto
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        return HttpResponseRedirect(f"{frontend_url}/login")

def handle_server_error(request, exception=None):
    """Maneja errores 500 y otros errores del servidor redirigiendo al frontend"""
    try:
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        error_type = type(exception).__name__ if exception else 'Unknown'
        logger.error(f"Error {error_type} detectado, redirigiendo a {frontend_url}")
        return HttpResponseRedirect(f"{frontend_url}/error")
    except Exception as e:
        logger.critical(f"Error crítico en handle_server_error: {e}")
        # Fallback absoluto
        return HttpResponseRedirect('http://localhost:3000/error')

def handle_400_error(request, exception=None):
    """Maneja errores 400 (Bad Request)"""
    return handle_server_error(request, exception)

def handle_403_error(request, exception=None):
    """Maneja errores 403 (Forbidden)"""
    return handle_server_error(request, exception)

def handle_404_error(request, exception=None):
    """Maneja errores 404 (Not Found)"""
    return handle_server_error(request, exception)
