import logging
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from evaluacion.models import Autoevaluacion
from evaluacion.serializers import AutoevaluacionSerializer
from evaluacion.mixins import PDFGenerationMixin 

logger = logging.getLogger(__name__)

# ✅ Definimos la utilidad localmente para evitar errores de importación
def parse_bool(val, default=None):
    if val is None:
        return default
    v = str(val).lower()
    if v in ("true", "1", "t", "yes", "y"):  return True
    if v in ("false", "0", "f", "no", "n"):  return False
    return default

class AutoevaluacionViewSet(PDFGenerationMixin, viewsets.ModelViewSet):
    """
    ViewSet para que los usuarios gestionen sus propias autoevaluaciones.
    Incluye generación de PDF via Mixin.
    """
    serializer_class = AutoevaluacionSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'put', 'patch', 'post']

    def get_queryset(self):
        qs = Autoevaluacion.objects.filter(persona=self.request.user).order_by('-fecha_inicio')
        
        # Filtro booleano robusto usando la función definida arriba
        completado = parse_bool(self.request.query_params.get('completado'))
        if completado is not None:
            qs = qs.filter(completado=completado)

        return qs

    def perform_create(self, serializer):
        serializer.save(persona=self.request.user)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = get_object_or_404(self.get_queryset(), pk=kwargs['pk'])

        try:
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            # Contexto para validaciones complejas en el serializer
            serializer.context['autoevaluacion'] = instance
            
            if not serializer.is_valid():
                logger.error(f"Validación fallida Autoevaluación {instance.id}: {serializer.errors}")
                return Response({
                    'error': 'Datos inválidos',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Guardado estándar
            self.perform_update(serializer)
            
            # Recálculos de negocio posteriores al guardado
            if hasattr(instance, 'calcular_logro'):
                instance.calcular_logro()
            
            # Actualización explícita de campos de texto si vienen en el payload
            updated_fields = []
            if 'text_mejorar' in request.data:
                instance.text_mejorar = request.data['text_mejorar']
                updated_fields.append('text_mejorar')
            
            if 'text_destacar' in request.data:
                instance.text_destacar = request.data['text_destacar']
                updated_fields.append('text_destacar')
            
            if updated_fields:
                instance.save(update_fields=updated_fields)
            
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error crítico en Autoevaluación {instance.id}: {str(e)}", exc_info=True)
            return Response({
                'error': 'Error interno del servidor al procesar la autoevaluación',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)