import logging
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .services.pdf_service import PDFService

logger = logging.getLogger(__name__)

class PDFGenerationMixin:
    """
    Mixin para agregar el endpoint 'generar_pdf' a cualquier ViewSet.
    Utiliza el PDFService centralizado.
    """
    
    @action(detail=True, methods=["get"], url_path="generar_pdf")
    def generar_pdf(self, request, pk=None):
        try:
            evaluacion = self.get_object()
            return PDFService.generate(evaluacion, request)
        except Exception as e:
            # ✅ LOGGING CRÍTICO: Esto imprimirá el error real en tu consola
            logger.exception(f"Error generando PDF para evaluación {pk}")
            
            return Response(
                {'error': 'No se pudo generar el PDF', 'details': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )