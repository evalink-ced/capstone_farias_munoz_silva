# views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db import transaction

from evaluacion.models import JefeEvaluacionAsignada, JefeEvaluacionAsignadaDetalle, EvaluacionJefe
from evaluacion.serializers import EvaluacionAsignadaSerializer, MostrarEvaluacionAsignadaSerializer
from evaluacion.serializers.tipo_evaluacion_read import TipoEvaluacionParaAutoevaluacionSerializer
from evaluacion.utils.assignment_notifications import enviar_notificacion_evaluacion_asignada_jefe


class JefeEvaluacionAsignadaMostrarViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Asignaciones donde el usuario es EVALUADOR (jefe).
    """
    serializer_class = MostrarEvaluacionAsignadaSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return (
            JefeEvaluacionAsignada.objects
            .select_related("tipo_evaluacion")
            .prefetch_related("detalles", "detalles__persona", "detalles__evaluador")
            .filter(detalles__evaluador=user)                      # <— antes: .filter(evaluador=user) ❌
            .distinct()
        )


class JefeEvaluacionAsignadaMostrarAsignaciónViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Asignaciones visibles para cualquier autenticado (ajusta el filtro a tu necesidad).
    Ejemplos de filtros útiles:
      - Por persona: .filter(detalles__persona=request.user)
      - Por evaluador: .filter(detalles__evaluador=request.user)
    """
    serializer_class = MostrarEvaluacionAsignadaSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            JefeEvaluacionAsignada.objects
            .select_related("tipo_evaluacion")
            .prefetch_related("detalles", "detalles__persona", "detalles__evaluador")
            .all()
        )


class JefeEvaluacionAsignadaViewSet(viewsets.ModelViewSet):
    serializer_class = EvaluacionAsignadaSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    # ✅ agrega esto:
    queryset = (JefeEvaluacionAsignada.objects
                .select_related("tipo_evaluacion")
                .prefetch_related("detalles", "detalles__persona", "detalles__evaluador"))

    def get_queryset(self):
        return (
            JefeEvaluacionAsignada.objects
            .select_related("tipo_evaluacion")
            .prefetch_related("detalles", "detalles__persona", "detalles__evaluador")
            .all()
        )

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        asignacion = ser.save()   # crea encabezado + detalles

        # ⚠️ Ya NO existe asignacion.personas ni asignacion.evaluador
        #    Iteramos los DETALLES y creamos EvaluacionJefe por cada persona con su evaluador.
        tipo = asignacion.tipo_evaluacion
        fecha = asignacion.fecha_evaluacion

        # Cachea la estructura una sola vez (si es igual para todos)
        estructura = TipoEvaluacionParaAutoevaluacionSerializer(tipo).data

        nuevas = []
        for det in asignacion.detalles.select_related("persona", "evaluador").all():
            existe = EvaluacionJefe.objects.filter(
                persona=det.persona,
                evaluador=det.evaluador,
                tipo_evaluacion=tipo,
                fecha_evaluacion=fecha,
            ).exists()
            if not existe:
                nuevas.append(EvaluacionJefe(
                    persona=det.persona,
                    evaluador=det.evaluador,
                    tipo_evaluacion=tipo,
                    fecha_evaluacion=fecha,
                    completado=False,
                    estructura_json=estructura
                ))

        if nuevas:
            EvaluacionJefe.objects.bulk_create(nuevas)
        
        # 📧 Enviar notificaciones por email a los jefes
        # Agrupar las nuevas evaluaciones por jefe (evaluador)
        evaluaciones_por_jefe = {}
        for evaluacion_jefe in nuevas:
            jefe = evaluacion_jefe.evaluador
            if jefe not in evaluaciones_por_jefe:
                evaluaciones_por_jefe[jefe] = []
            evaluaciones_por_jefe[jefe].append(evaluacion_jefe)
        
        # Enviar notificación a cada jefe con sus evaluaciones asignadas
        for jefe, evaluaciones_asignadas in evaluaciones_por_jefe.items():
            enviar_notificacion_evaluacion_asignada_jefe(jefe, evaluaciones_asignadas)

        # Devolvemos la representación de la asignación creada
        headers = self.get_success_headers(ser.data)
        return Response(ser.data, status=status.HTTP_201_CREATED, headers=headers)
