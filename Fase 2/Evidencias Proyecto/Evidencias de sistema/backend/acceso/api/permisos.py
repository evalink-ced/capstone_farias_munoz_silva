from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import Q

from acceso.models import AccessPermission
from acceso.serializers import AccessPermissionSerializer


class UserPermissionsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if not hasattr(user, 'group') or not user.group or not user.empresa:
            return Response({
                "grupo": [],
                "empresa": None,
                "permisos": [],
                "is_staff": False
            })

        permiso = user.group
        permiso_empresas = permiso.empresa.all()
        permitido = (not permiso_empresas.exists()) or permiso_empresas.filter(pk=user.empresa_id).exists()
        template_names = permiso.templates.values_list('name', flat=True) if permitido else []

        grupo_payload = [{
            "id": permiso.id,
            "group": permiso.group,
            "is_staff": bool(getattr(permiso, 'is_staff', False)),
            "empresa": [
                {"id": e.id, "name": getattr(e, 'name', None) or getattr(e, 'empresa', None)}
                for e in permiso_empresas
            ],
        }]

        return Response({
            "grupo": grupo_payload,
            "empresa": user.empresa.name,
            "permisos": sorted(template_names),
            "is_staff": bool(getattr(user.group, 'is_staff', False))
        })


class AccessPermissionsListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = AccessPermission.objects.all().order_by('group')
        ser = AccessPermissionSerializer(qs, many=True)
        return Response(ser.data)
