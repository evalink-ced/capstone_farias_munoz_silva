from usuarios.models import User
from rest_framework import serializers
from usuarios.serializers.empresa_serializers import EmpresaSerializer
class UserSerializers(serializers.ModelSerializer):
    empresa = EmpresaSerializer()
    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email', 'rut',
            'is_active', 'is_superuser', 'date_joined', 'birthday',
            'genero', 'cargo', 'ciclo', 'empresa', 'jefe', 'foto',
        ]
        some_field  = {'password':{'write_only':True}}
        
        
