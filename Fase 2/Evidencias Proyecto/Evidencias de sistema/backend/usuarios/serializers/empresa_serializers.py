from rest_framework import serializers
from institucion.models import Empresa

class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = ['id','empresa', 'name', 'logo','theme']
