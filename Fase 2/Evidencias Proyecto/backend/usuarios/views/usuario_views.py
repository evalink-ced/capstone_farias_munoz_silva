from allauth.account.views import SignupView
from usuarios.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets


class UsuarioActualAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        has_empresa = hasattr(user, "empresa")

        grupo_info = None
        if user.group:
            grupo_info = {
                "id": user.group.id,
                "name": user.group.name
            }

        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_superuser": user.is_superuser,
            "group": grupo_info,
            "empresa": {
                "id": user.empresa.id,
                "name": user.empresa.name,
            } if has_empresa else None,
            'jefe':user.jefe if hasattr(user, 'jefe') else None,
        })


