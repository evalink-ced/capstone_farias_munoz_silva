from rest_framework import serializers
from institucion.models import Empresa
from datetime import date




class EmpresaSerializer(serializers.ModelSerializer):
    logo = serializers.ImageField(use_url=True)
    empresa = serializers.StringRelatedField()
    name=serializers.StringRelatedField()
    fondo = serializers.ImageField(use_url=True)
    class Meta:
        model = Empresa
        fields = '__all__'

