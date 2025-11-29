from rest_framework import viewsets, permissions
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from usuarios.serializers.user_serializers import UserEvaSerializer

User = get_user_model()

class SubordinadosViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserEvaSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Obtener subordinados del usuario actual
        return User.objects.filter(
            jefe=self.request.user,
            is_active=True
        ).select_related('cargo', 'empresa')