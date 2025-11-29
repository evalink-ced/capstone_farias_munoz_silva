import logging
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.utils import timezone

from evaluacion.models import EvaluacionJefe
from evaluacion.serializers import JefeEvaluacionSerializer
from evaluacion.utils.email_notifications import enviar_notificacion_retroalimentacion_completada
from evaluacion.mixins import PDFGenerationMixin  # ✅ Importamos el Mixin

logger = logging.getLogger(__name__)

# Función auxiliar para filtros
def parse_bool(val, default=None):
    if val is None: return default
    v = str(val).lower()
    if v in ("true", "1", "t", "yes", "y"): return True
    if v in ("false", "0", "f", "no", "n"): return False
    return default

class EvaluacionViewSet(PDFGenerationMixin, viewsets.ModelViewSet):
    """
    Vista para el JEFE (Evaluador).
    Permite ver y editar las evaluaciones asignadas a él.
    """
    serializer_class = JefeEvaluacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filtra solo las evaluaciones donde el usuario es el EVALUADOR
        qs = (EvaluacionJefe.objects
              .filter(evaluador=self.request.user)
              .select_related("persona", "persona__cargo", "persona__empresa", "tipo_evaluacion")
              .prefetch_related("respuestas")
              .order_by("-fecha_inicio"))

        # Filtros
        completado = parse_bool(self.request.query_params.get("completado"))
        if completado is not None:
            qs = qs.filter(completado=completado)
        
        estado = self.request.query_params.get("estado")
        if estado:
            estado_map = {
                "en_progreso": {"completado": False},
                "completada": {"completado": True, "retroalimentacion_completada": False},
                "retroalimentacion_completada": {"retroalimentacion_completada": True, "cerrado_para_firma": False},
                "pendiente_firma": {"cerrado_para_firma": True, "estado_firma": 'pendiente'},
                "finalizada": {"estado_firma": 'firmado'},
                "denegada": {"estado_firma": 'firmado_obs'},
            }
            if estado in estado_map:
                qs = qs.filter(**estado_map[estado])
            
        return qs

    def perform_create(self, serializer):
        serializer.save(evaluador=self.request.user)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = get_object_or_404(self.get_queryset(), pk=kwargs["pk"])

        try:
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.context['evaluacion_jefe'] = instance
            
            if not serializer.is_valid():
                logger.error(f"Error validación evaluación {instance.id}: {serializer.errors}")
                return Response({'error': 'Datos inválidos', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

            serializer.save()
            instance.calcular_logro()
            
            # Actualizar textos explícitamente si vienen en el request
            updated_fields = []
            for field in ['text_mejorar', 'text_destacar', 'retroalimentacion']:
                if field in request.data:
                    setattr(instance, field, request.data[field])
                    updated_fields.append(field)
            
            if updated_fields:
                instance.save(update_fields=updated_fields)
                
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error inesperado en evaluación {instance.id}: {str(e)}")
            return Response({'error': 'Error interno', 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def completar_retroalimentacion(self, request, pk=None):
        evaluacion = self.get_object()
        
        if not evaluacion.puede_completar_retroalimentacion():
            return Response({'error': 'No permitido', 'estado': evaluacion.get_estado_actual()}, status=400)
        
        if 'retroalimentacion' in request.data:
            evaluacion.retroalimentacion = request.data['retroalimentacion']
        
        evaluacion.retroalimentacion_completada = True
        evaluacion.fecha_reunion = timezone.now()
        evaluacion.save(update_fields=['retroalimentacion_completada', 'retroalimentacion', 'fecha_reunion'])
        
        try:
            enviar_notificacion_retroalimentacion_completada(evaluacion)
        except Exception as e:
            logger.error(f"Error notificando retroalimentación {evaluacion.id}: {e}")
        
        return Response({'message': 'Retroalimentación completada'})

    @action(detail=True, methods=['post'])
    def cerrar_para_firma(self, request, pk=None):
        evaluacion = self.get_object()
        if not evaluacion.puede_cerrar_para_firma():
            return Response({'error': 'No permitido', 'estado': evaluacion.get_estado_actual()}, status=400)
        
        evaluacion.cerrado_para_firma = True
        evaluacion.save(update_fields=['cerrado_para_firma'])
        return Response({'message': 'Cerrada para firma'})


class MisEvaluacionesJefaturaViewSet(PDFGenerationMixin, viewsets.ModelViewSet):
    """
    Vista para el EMPLEADO (Evaluado).
    Permite ver sus evaluaciones, firmarlas o denegarlas.
    ✅ Incluye generar_pdf gracias al Mixin.
    """
    serializer_class = JefeEvaluacionSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'patch', 'post']

    def get_queryset(self):
        # Filtra las evaluaciones donde el usuario es el EVALUADO (persona)
        qs = (EvaluacionJefe.objects
              .filter(persona=self.request.user)
              .select_related("persona", "persona__cargo", "persona__empresa", "tipo_evaluacion")
              .prefetch_related("respuestas")
              .order_by("-fecha_inicio"))

        completado = parse_bool(self.request.query_params.get("completado"))
        if completado is not None:
            qs = qs.filter(completado=completado)

        estado = self.request.query_params.get("estado")
        if estado == "pendiente_firma":
            qs = qs.filter(cerrado_para_firma=True, estado_firma='pendiente')
        elif estado == "finalizada":
            qs = qs.filter(estado_firma='firmado')
        elif estado == "denegada":
            qs = qs.filter(estado_firma='firmado_obs')

        return qs

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        logger.info(f"Firma/Denegación evaluación {instance.id} por {request.user.id}")

        allowed_fields = {'estado_firma', 'motivo_denegacion'}
        data = {k: v for k, v in request.data.items() if k in allowed_fields}

        # Validaciones de negocio
        if data.get('estado_firma') == 'firmado' and not instance.puede_firmar():
            return Response({'error': 'No se puede firmar en este estado'}, status=400)
        
        if data.get('estado_firma') == 'firmado_obs':
            if not instance.puede_denegar():
                return Response({'error': 'No se puede denegar en este estado'}, status=400)
            if not data.get('motivo_denegacion', '').strip():
                return Response({'error': 'El motivo de denegación es obligatorio'}, status=400)

        serializer = self.get_serializer(instance, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['post'])
    def denegar(self, request, pk=None):
        """Endpoint explícito para denegar."""
        return self.partial_update(request, pk=pk)

    # Bloqueo de métodos no permitidos para el empleado
    def update(self, r, *a, **k): return Response(status=405)
    def create(self, r, *a, **k): return Response(status=405)
    def destroy(self, r, *a, **k): return Response(status=405)