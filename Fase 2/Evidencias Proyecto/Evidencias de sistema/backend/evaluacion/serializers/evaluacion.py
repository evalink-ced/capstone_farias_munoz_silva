from rest_framework import serializers
from django.db import transaction
from evaluacion.models import EvaluacionJefe, RespuestaIndicadorJefe
from evaluacion.serializers.tipo_evaluacion_read import (
    TipoEvaluacionParaAutoevaluacionSerializer,
)
from usuarios.serializers.user_serializers import UserEvaSerializer


class JefeRespuestaIndicadorSerializer(serializers.ModelSerializer):
    indicador = serializers.IntegerField()

    class Meta:
        model = RespuestaIndicadorJefe
        fields = ["indicador", "puntaje"]
    
    def validate_indicador(self, value):
        """Validar contra la estructura guardada, NO contra la plantilla actual"""
        # Obtener la evaluación desde el contexto
        evaluacion_jefe = self.context.get('evaluacion_jefe')
        if not evaluacion_jefe:
            # Fallback: validar contra plantilla actual (solo para nuevas evaluaciones)
            from evaluacion.models import Indicador
            if not Indicador.objects.filter(id=value).exists():
                raise serializers.ValidationError(f"Indicador con ID {value} no existe")
            return value
        
        # Validar contra snapshot inmutable
        indicadores_validos = evaluacion_jefe.get_indicadores_validos()
        if value not in indicadores_validos:
            raise serializers.ValidationError(
                f"Indicador {value} no es válido para esta evaluación (versión: {evaluacion_jefe.version_plantilla})"
            )
        return value

class JefeEvaluacionSerializer(serializers.ModelSerializer):
    # ----- campos anidados/auxiliares -----
    tipo_evaluacion = TipoEvaluacionParaAutoevaluacionSerializer(read_only=True)
    persona = UserEvaSerializer(read_only=True)
    persona_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    respuestas = JefeRespuestaIndicadorSerializer(many=True)
    puntaje_total_obtenido = serializers.SerializerMethodField()
    puntaje_total_maximo = serializers.SerializerMethodField()
    porcentaje_total = serializers.SerializerMethodField()
    estado_actual = serializers.SerializerMethodField()
    
    # ✅ CAMPOS RELACIONADOS CON FIRMA/DENEGACIÓN
    firmado = serializers.ReadOnlyField()  # Property del modelo para compatibilidad
    firmado_obs = serializers.ReadOnlyField()  # Property del modelo
    
    class Meta:
        model = EvaluacionJefe
        fields = [
            "id",
            "persona", "persona_id",
            "tipo_evaluacion",
            "fecha_evaluacion",
            "fecha_inicio", "fecha_ultima_modificacion",
            # ✅ CAMPOS DE FLUJO ACTUALIZADOS
            "completado", "firmado", "firmado_obs", "fecha_reunion",
            "retroalimentacion_completada", 
            "cerrado_para_firma", "fecha_firma",
            # ✅ NUEVOS CAMPOS DE ESTADO DE FIRMA
            "estado_firma", "motivo_denegacion",
            "ponderada",
            "text_destacar", "text_mejorar", "logro_obtenido",
            "respuestas", "estructura_json", "version_plantilla",
            "puntaje_total_obtenido", "puntaje_total_maximo", "porcentaje_total",
            "retroalimentacion",
            "estado_actual",
        ]
        read_only_fields = [
            "id", "persona", "tipo_evaluacion",
            "fecha_evaluacion", "fecha_inicio",
            "fecha_ultima_modificacion", "estructura_json", "version_plantilla",
            "fecha_reunion", "fecha_firma",  # ✅ FECHAS AUTOMÁTICAS
            "estado_actual",  # ✅ CALCULADO
            "firmado", "firmado_obs",  # ✅ PROPERTIES DE SOLO LECTURA
        ]

    # ----- CREATE -----
    @transaction.atomic
    def create(self, validated_data):
        respuestas_data = validated_data.pop("respuestas", [])
        persona_id = validated_data.pop("persona_id", None)
        if persona_id is not None:
            validated_data["persona_id"] = persona_id

        evaluacion = EvaluacionJefe.objects.create(**validated_data)

        if respuestas_data:
            RespuestaIndicadorJefe.objects.bulk_create([
                RespuestaIndicadorJefe(
                    evaluacion=evaluacion,
                    indicador=resp["indicador"],
                    puntaje=resp["puntaje"],
                )
                for resp in respuestas_data
            ], ignore_conflicts=True)

        evaluacion.calcular_logro()
        return evaluacion

    # ----- UPDATE (upsert por indicador) -----
    @transaction.atomic
    def update(self, instance, validated_data):
        respuestas_data = validated_data.pop("respuestas", None)
        persona_id = validated_data.pop("persona_id", None)
        if persona_id is not None:
            instance.persona_id = persona_id

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if respuestas_data is not None:
            existentes = {r.indicador: r for r in instance.respuestas.all()}
            enviados_ids, to_create, to_update = set(), [], []

            for resp in respuestas_data:
                ind_id = resp["indicador"]
                enviados_ids.add(ind_id)
                puntaje = resp["puntaje"]

                r = existentes.get(ind_id)
                if r:
                    if r.puntaje != puntaje:
                        r.puntaje = puntaje
                        to_update.append(r)
                else:
                    to_create.append(RespuestaIndicadorJefe(
                        evaluacion=instance,
                        indicador=ind_id,
                        puntaje=puntaje,
                    ))

            if to_create:
                RespuestaIndicadorJefe.objects.bulk_create(to_create, ignore_conflicts=True)
            if to_update:
                RespuestaIndicadorJefe.objects.bulk_update(to_update, ["puntaje"])

            # elimina solo las no enviadas
            if existentes:
                instance.respuestas.exclude(indicador__in=enviados_ids).delete()

        instance.calcular_logro()
        return instance

    def get_puntaje_total_obtenido(self, obj):
        """Suma real de puntajes obtenidos"""
        return sum(r.puntaje for r in obj.respuestas.all())
    
    def get_puntaje_total_maximo(self, obj):
        """Suma de puntajes máximos posibles"""
        if not obj.estructura_json:
            return 0
        
        total_max = 0
        for area in obj.estructura_json.get('areas', []):
            for comp in area.get('competencias', []):
                for ind in comp.get('indicadores', []):
                    niveles = ind.get('nvlindicadores', [])
                    if niveles:
                        total_max += max(n.get('puntaje', 0) for n in niveles)
        return total_max
    
    def get_porcentaje_total(self, obj):
        """Porcentaje total ponderado usando logro_obtenido ya calculado"""
        return float(obj.logro_obtenido)
    
    def get_estado_actual(self, obj):
        """Estado actual de la evaluación"""
        return obj.get_estado_actual()
