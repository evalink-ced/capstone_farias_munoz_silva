from rest_framework import serializers
from usuarios.models import Ciclo, Cargo, Genero

class CicloSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ciclo
        fields = ['id', 'ciclo']

class CargoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cargo
        fields = ['id', 'cargo']

class GeneroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genero
        fields = ['id', 'genero']