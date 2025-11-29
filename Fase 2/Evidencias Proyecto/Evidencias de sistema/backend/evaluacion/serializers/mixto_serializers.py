# evaluacion/serializers/mixto_serializers.py
from rest_framework import serializers

class IndicadorMixtoSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    nombre = serializers.CharField()
    puntaje_auto = serializers.IntegerField(allow_null=True)
    puntaje_jefe = serializers.IntegerField(allow_null=True)
    delta = serializers.IntegerField(allow_null=True)

class CompetenciaMixtoSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    nombre = serializers.CharField()
    indicadores = IndicadorMixtoSerializer(many=True)

class AreaMixtoSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    nombre = serializers.CharField()
    competencias = CompetenciaMixtoSerializer(many=True)

class EvaluacionMixtaSerializer(serializers.Serializer):
    # meta principal
    tipo_evaluacion_id = serializers.IntegerField()
    tipo_evaluacion = serializers.CharField()
    persona_id = serializers.IntegerField(allow_null=True)
    persona_nombre = serializers.CharField(allow_null=True)          # <-- nuevo
    evaluador_id = serializers.IntegerField(allow_null=True)
    evaluador_nombre = serializers.CharField(allow_null=True)        # <-- nuevo
    fecha_evaluacion = serializers.CharField()

    # que evaluaciones se comparan
    evaluacion_auto_id = serializers.IntegerField(allow_null=True)   # <-- nuevo
    evaluacion_auto_nombre = serializers.CharField(allow_null=True)  # <-- nuevo (tipo auto)
    evaluacion_jefe_id = serializers.IntegerField(allow_null=True)   # <-- nuevo
    evaluacion_jefe_nombre = serializers.CharField(allow_null=True)  # <-- nuevo (tipo jefe)

    areas = AreaMixtoSerializer(many=True)
    resumen = serializers.DictField(child=serializers.FloatField(), required=False)
