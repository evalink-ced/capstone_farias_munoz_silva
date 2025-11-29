from rest_framework import serializers
from acceso.models import TemplateAccess, AccessPermission

class TemplateAccessSerializer(serializers.ModelSerializer):
    class Meta:
        model = TemplateAccess
        fields = ['id', 'name']


class AccessPermissionSerializer(serializers.ModelSerializer):
    templates = TemplateAccessSerializer(many=True, read_only=True)
    empresa = serializers.SerializerMethodField()

    class Meta:
        model = AccessPermission
        fields = ['id', 'group', 'is_staff', 'empresa', 'templates']

    def get_empresa(self, obj):
        return [
            {
                "id": e.id,
                "name": getattr(e, 'name', None) or getattr(e, 'empresa', None)
            }
            for e in obj.empresa.all()
        ]
