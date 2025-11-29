from rest_framework import serializers
from django.db import transaction
from evaluacion.models import RespuestaIndicador, Autoevaluacion
from evaluacion.serializers.tipo_evaluacion_read import TipoEvaluacionParaAutoevaluacionSerializer
from usuarios.serializers.user_serializers import UserEvaSerializer

class RespuestaIndicadorSerializer(serializers.ModelSerializer):
    indicador = serializers.IntegerField()
    
    class Meta:
        model = RespuestaIndicador
        fields = ['indicador', 'puntaje']
    
    def validate_indicador(self, value):
        """Validar contra la estructura guardada, NO contra la plantilla actual"""
        # Obtener la autoevaluación desde el contexto
        autoevaluacion = self.context.get('autoevaluacion')
        if not autoevaluacion:
            # Fallback: validar contra plantilla actual (solo para nuevas evaluaciones)
            from evaluacion.models import Indicador
            if not Indicador.objects.filter(id=value).exists():
                raise serializers.ValidationError(f"Indicador con ID {value} no existe")
            return value
        
        # Validar contra snapshot inmutable
        indicadores_validos = autoevaluacion.get_indicadores_validos()
        if value not in indicadores_validos:
            raise serializers.ValidationError(
                f"Indicador {value} no es válido para esta evaluación (versión: {autoevaluacion.version_plantilla})"
            )
        return value

class AutoevaluacionSerializer(serializers.ModelSerializer):
    tipo_evaluacion = TipoEvaluacionParaAutoevaluacionSerializer(read_only=True)
    respuestas = RespuestaIndicadorSerializer(many=True)
    persona = UserEvaSerializer(read_only=True)
    # ✅ AGREGAR: Campos calculados para usar en frontend
    puntaje_total_obtenido = serializers.SerializerMethodField()
    puntaje_total_maximo = serializers.SerializerMethodField()
    porcentaje_total = serializers.SerializerMethodField()

    class Meta:
        model = Autoevaluacion
        fields = [
            'id', 'persona', 'tipo_evaluacion', 'fecha_evaluacion',
            'fecha_inicio', 'fecha_ultima_modificacion', 'completado',
            'ponderada', 'text_destacar', 'text_mejorar', 'logro_obtenido',
            'respuestas', 'estructura_json', 'puntaje_total_obtenido', 
            'puntaje_total_maximo', 'porcentaje_total'
        ]
        read_only_fields = [
            'fecha_inicio', 'fecha_evaluacion', 'fecha_ultima_modificacion', 
            'persona', 'estructura_json'
        ]

    def get_puntaje_total_obtenido(self, obj):
        """Calcular puntaje total obtenido desde las respuestas"""
        return sum(respuesta.puntaje for respuesta in obj.respuestas.all())
    
    def get_puntaje_total_maximo(self, obj):
        """Calcular puntaje total máximo desde la estructura JSON"""
        if not obj.estructura_json:
            return 0
        
        total_maximo = 0
        for area_data in obj.estructura_json.get('areas', []):
            for comp_data in area_data.get('competencias', []):
                for ind_data in comp_data.get('indicadores', []):
                    niveles = ind_data.get('nvlindicadores', [])
                    if niveles:
                        total_maximo += max(n['puntaje'] for n in niveles)
        return total_maximo
    
    def get_porcentaje_total(self, obj):
        return float(obj.logro_obtenido) if obj.logro_obtenido is not None else 0.0
        
    @transaction.atomic
    def create(self, validated_data):
        respuestas_data = validated_data.pop('respuestas', [])
        autoeval = Autoevaluacion.objects.create(**validated_data)
        
        # Guardar snapshot de la estructura
        autoeval.save_estructura_snapshot()
        
        # Crear respuestas usando bulk_create para eficiencia
        if respuestas_data:
            respuestas_objects = [
                RespuestaIndicador(
                    autoevaluacion=autoeval,
                    indicador=resp['indicador'],
                    puntaje=resp['puntaje']
                )
                for resp in respuestas_data
            ]
            RespuestaIndicador.objects.bulk_create(respuestas_objects, ignore_conflicts=True)
        
        # Calcular logro inicial
        autoeval.calcular_logro()
        return autoeval

    @transaction.atomic
    def update(self, instance, validated_data):
        respuestas_data = validated_data.pop('respuestas', None)

        # Actualizar campos de la instancia
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Manejar respuestas de forma eficiente (upsert pattern)
        if respuestas_data is not None:
            existentes = {r.indicador: r for r in instance.respuestas.all()}
            enviados_ids, to_create, to_update = set(), [], []

            for resp in respuestas_data:
                ind_id = resp['indicador']
                enviados_ids.add(ind_id)
                puntaje = resp['puntaje']

                respuesta_existente = existentes.get(ind_id)
                if respuesta_existente:
                    if respuesta_existente.puntaje != puntaje:
                        respuesta_existente.puntaje = puntaje
                        to_update.append(respuesta_existente)
                else:
                    to_create.append(RespuestaIndicador(
                        autoevaluacion=instance,
                        indicador=ind_id,
                        puntaje=puntaje
                    ))

            # Operaciones bulk para eficiencia
            if to_create:
                RespuestaIndicador.objects.bulk_create(to_create, ignore_conflicts=True)
            if to_update:
                RespuestaIndicador.objects.bulk_update(to_update, ['puntaje'])

            # Eliminar respuestas no enviadas
            if existentes:
                instance.respuestas.exclude(indicador__in=enviados_ids).delete()

        # Recalcular logro obtenido
        instance.calcular_logro()
        return instance

    def get_serializer_context(self):
        """Pasar la instancia al contexto para validación"""
        context = super().get_serializer_context()
        if hasattr(self, 'instance') and self.instance:
            context['autoevaluacion'] = self.instance
        return context
