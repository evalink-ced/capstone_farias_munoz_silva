from rest_framework import viewsets
from evaluacion.models import TipoEvaluacion, EvaluacionAsignada
from evaluacion.models.autoevaluacion import Autoevaluacion
from evaluacion.serializers import TipoEvaluacionSerializer, AutoEvaluacionAsignadaSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListAPIView
from django.contrib.auth import get_user_model
from evaluacion.serializers import UsuarioSerializer
from evaluacion.serializers.tipo_evaluacion_read import TipoEvaluacionParaAutoevaluacionSerializer
from django.db import IntegrityError
from evaluacion.utils.assignment_notifications import enviar_notificaciones_masivas_autoevaluacion

User = get_user_model()

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = User.objects.select_related('ciclo', 'empresa').filter(
        empresa__id__in=[1, 2, 3],
        is_active=True
    )
    serializer_class = UsuarioSerializer



class TipoEvaluacionViewSet(viewsets.ModelViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = TipoEvaluacion.objects.all()
    serializer_class = TipoEvaluacionSerializer


class EvaluacionAsignadaViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    queryset = EvaluacionAsignada.objects.all()
    serializer_class = AutoEvaluacionAsignadaSerializer
    
    def perform_create(self, serializer):
        evaluacion_asignada = serializer.save()
        tipo = evaluacion_asignada.tipo_evaluacion
        fecha = evaluacion_asignada.fecha_evaluacion

        print("✅ Evaluación asignada creada:", evaluacion_asignada)
        
        autoevaluaciones_creadas = []
        personas_ya_asignadas = []

        for persona in evaluacion_asignada.personas_asignadas.all():
            try:
                mes, anio = map(int, fecha.split("-"))
            except ValueError:
                print("⚠️ Error al interpretar la fecha:", fecha)
                continue

            try:
                nueva = Autoevaluacion.objects.create(
                    persona=persona,
                    fecha_evaluacion=fecha,
                    tipo_evaluacion=tipo,
                    completado=False,
                    estructura_json=TipoEvaluacionParaAutoevaluacionSerializer(tipo).data
                )
                autoevaluaciones_creadas.append(nueva)
                print(f"✅ Autoevaluación creada para {persona}: {nueva.id}")
                
            except IntegrityError:
                print(f"ℹ️ Ya existe autoevaluación para {persona} en {fecha}")
                personas_ya_asignadas.append(persona)
                continue
        
        # Enviar notificaciones solo a personas con nuevas autoevaluaciones
        if autoevaluaciones_creadas:
            try:
                enviadas, fallidas = enviar_notificaciones_masivas_autoevaluacion(evaluacion_asignada)
                print(f"📧 Notificaciones enviadas: {enviadas}, fallidas: {fallidas}")
            except Exception as e:
                print(f"⚠️ Error enviando notificaciones: {str(e)}")


