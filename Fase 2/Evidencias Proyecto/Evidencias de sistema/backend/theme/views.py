from rest_framework import viewsets
from .models import Theme
from .serializers import ThemeSerializer
from rest_framework.permissions import IsAuthenticated


class ThemeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]  # Descomentar si se requiere autenticación
    
    queryset = Theme.objects.all()
    serializer_class = ThemeSerializer

    filterset_fields = ['name', 'modo_oscuro']