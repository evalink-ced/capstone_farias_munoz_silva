from django.http import HttpResponseRedirect
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class ErrorRedirectMiddleware:
    """Middleware que captura cualquier error no manejado y redirige al frontend"""
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            response = self.get_response(request)
            return response
        except Exception as e:
            logger.error(f"Error no manejado capturado por middleware: {e}")
            return self.redirect_to_frontend()

    def process_exception(self, request, exception):
        """Procesa excepciones no manejadas"""
        logger.error(f"Excepción capturada por middleware: {exception}")
        return self.redirect_to_frontend()

    def redirect_to_frontend(self):
        """Redirige al frontend con manejo de errores robusto"""
        try:
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
            return HttpResponseRedirect(f"{frontend_url}/error")
        except Exception as e:
            logger.critical(f"Error crítico en redirect_to_frontend: {e}")
            # Fallback absoluto
            return HttpResponseRedirect('http://localhost:3000/error')