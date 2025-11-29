# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Empresa
from institucion.serializers.serializers import EmpresaSerializer

class EmpresaUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if hasattr(user, "empresa") and user.empresa:
            serializer = EmpresaSerializer(user.empresa)
            return Response(serializer.data)
        return Response({"error": "El usuario no tiene empresa asignada"}, status=404)
