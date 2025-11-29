
from evaluacion.models.plantilla import AreaEvaluacion, Competencia, Indicador, NivelLogro, TipoEvaluacion
from rest_framework import serializers

class NivelLogroReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = NivelLogro
        fields = ['puntaje', 'nombre', 'descripcion']

class IndicadorReadSerializer(serializers.ModelSerializer):
    nvlindicadores = NivelLogroReadSerializer(many=True)

    class Meta:
        model = Indicador
        fields = ['id', 'numero', 'indicador','definicion', 'nvlindicadores']

class CompetenciaReadSerializer(serializers.ModelSerializer):
    indicadores = IndicadorReadSerializer(many=True)

    class Meta:
        model = Competencia
        fields = ['id', 'name', 'indicadores']

class AreaEvaluacionReadSerializer(serializers.ModelSerializer):
    competencias = CompetenciaReadSerializer(many=True)

    class Meta:
        model = AreaEvaluacion
        fields = ['id', 'n_area', 'competencias', 'ponderacion']

class TipoEvaluacionParaAutoevaluacionSerializer(serializers.ModelSerializer):
    areas = AreaEvaluacionReadSerializer(many=True)

    class Meta:
        model = TipoEvaluacion
        fields = ['id', 'n_tipo_evaluacion', 'areas']
