from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..serializers.serializers import EmpresaSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from institucion.models import Empresa
    

class EmpresaAllView(APIView):
    authentication_classes = [JWTAuthentication]  # Usar JWT Authentication
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados pueden acceder

    def get(self, request):
        empresas = Empresa.objects.all().order_by('name')
        serializer = EmpresaSerializer(empresas, many=True)
        return Response(serializer.data)
        
