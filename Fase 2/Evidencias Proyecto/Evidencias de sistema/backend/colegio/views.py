# -*- coding: utf-8 -*-
"""
Vistas para el proyecto colegio
Incluye health check endpoint para mantener el servicio activo en Railway
"""

from django.http import JsonResponse
from django.db import connection
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import logging

logger = logging.getLogger(__name__)


@csrf_exempt
@require_http_methods(["GET"])
def health_check(request):
    """
    Endpoint de health check que verifica la conectividad con la base de datos.
    
    Este endpoint está diseñado para:
    1. Verificar que el servicio Django esté funcionando
    2. Forzar una conexión a la base de datos (SELECT 1) para generar tráfico saliente
    3. Resetear el contador de inactividad en Railway para evitar que el servicio "duerma"
    
    Returns:
        JsonResponse: {
            "status": "ok",
            "db": true,
            "timestamp": "2024-01-01T12:00:00Z"
        }
    """
    try:
        # Ejecutar una consulta simple para verificar la conexión a la base de datos
        # Esto genera tráfico saliente y resetea el contador de inactividad en Railway
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            db_healthy = result is not None and result[0] == 1
        
        response_data = {
            "status": "ok",
            "db": db_healthy,
            "timestamp": request.META.get('HTTP_X_FORWARDED_FOR', 
                                       request.META.get('REMOTE_ADDR', 'unknown'))
        }
        
        logger.info(f"Health check successful - DB: {db_healthy}")
        return JsonResponse(response_data, status=200)
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        
        response_data = {
            "status": "error",
            "db": False,
            "error": str(e),
            "timestamp": request.META.get('HTTP_X_FORWARDED_FOR', 
                                       request.META.get('REMOTE_ADDR', 'unknown'))
        }
        
        # Retornar 503 Service Unavailable en caso de error
        return JsonResponse(response_data, status=503)