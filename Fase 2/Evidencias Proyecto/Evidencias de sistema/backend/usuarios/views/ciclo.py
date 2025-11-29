from rest_framework import viewsets
from usuarios.models import Ciclo, Cargo, Genero
from usuarios.serializers import CicloSerializer, CargoSerializer, GeneroSerializer

class CicloViewSet(viewsets.ModelViewSet):
    queryset = Ciclo.objects.all()
    serializer_class = CicloSerializer

class CargoViewSet(viewsets.ModelViewSet):
    queryset = Cargo.objects.all()
    serializer_class = CargoSerializer

class GeneroViewSet(viewsets.ModelViewSet):
    queryset = Genero.objects.all()
    serializer_class = GeneroSerializer