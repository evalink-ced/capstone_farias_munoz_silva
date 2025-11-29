from rest_framework import viewsets, permissions
from rest_framework.response import Response
from django.db.models import Q
from evaluacion.models import Autoevaluacion, JefeEvaluacionAsignadaDetalle
from evaluacion.serializers import AutoevaluacionSerializer


class AutoevaluacionSubordinadosViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para que los jefes puedan ver las autoevaluaciones de sus subordinados
    """
    serializer_class = AutoevaluacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Obtener las personas que el usuario actual evalúa (es jefe de)
        subordinados_ids = JefeEvaluacionAsignadaDetalle.objects.filter(
            evaluador=self.request.user
        ).values_list('persona_id', flat=True).distinct()

        # Filtrar autoevaluaciones de esos subordinados
        queryset = Autoevaluacion.objects.filter(
            persona_id__in=subordinados_ids
        ).select_related(
            'persona', 'tipo_evaluacion'
        ).prefetch_related(
            'respuestas'
        ).order_by('-fecha_inicio')

        # Filtros opcionales
        completado = self.request.query_params.get('completado')
        if completado is not None:
            if completado.lower() in ['true', '1']:
                queryset = queryset.filter(completado=True)
            elif completado.lower() in ['false', '0']:
                queryset = queryset.filter(completado=False)

        # Filtro por tipo de evaluación
        tipo_evaluacion = self.request.query_params.get('tipo_evaluacion')
        if tipo_evaluacion:
            queryset = queryset.filter(tipo_evaluacion_id=tipo_evaluacion)

        # Filtro por fecha de evaluación
        fecha_evaluacion = self.request.query_params.get('fecha_evaluacion')
        if fecha_evaluacion:
            queryset = queryset.filter(fecha_evaluacion=fecha_evaluacion)

        # Filtro por persona específica
        persona = self.request.query_params.get('persona')
        if persona:
            queryset = queryset.filter(persona_id=persona)

        return queryset

    def list(self, request, *args, **kwargs):
        """
        Lista las autoevaluaciones de subordinados con información adicional
        """
        queryset = self.get_queryset()
        
        # Agregar información de agrupación por tipo y período
        tipo_evaluacion = request.query_params.get('tipo_evaluacion')
        fecha_evaluacion = request.query_params.get('fecha_evaluacion')
        
        if tipo_evaluacion and fecha_evaluacion:
            # Si se especifica tipo y fecha, devolver lista simple
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        else:
            # Si no, devolver agrupado por tipo y período
            return self._get_grouped_response(queryset)

    def _get_grouped_response(self, queryset):
        """
        Agrupa las autoevaluaciones por tipo de evaluación y período
        """
        # Obtener combinaciones únicas de tipo_evaluacion y fecha_evaluacion
        grupos = {}
        
        for auto in queryset:
            key = f"{auto.tipo_evaluacion.id}|{auto.fecha_evaluacion}"
            if key not in grupos:
                grupos[key] = {
                    'tipo_evaluacion': {
                        'id': auto.tipo_evaluacion.id,
                        'n_tipo_evaluacion': auto.tipo_evaluacion.n_tipo_evaluacion
                    },
                    'fecha_evaluacion': auto.fecha_evaluacion,
                    'total_autoevaluaciones': 0,
                    'completadas': 0,
                    'pendientes': 0,
                    'autoevaluaciones': []
                }
            
            grupos[key]['total_autoevaluaciones'] += 1
            if auto.completado:
                grupos[key]['completadas'] += 1
            else:
                grupos[key]['pendientes'] += 1
            
            grupos[key]['autoevaluaciones'].append(
                self.get_serializer(auto).data
            )

        return Response(list(grupos.values()))