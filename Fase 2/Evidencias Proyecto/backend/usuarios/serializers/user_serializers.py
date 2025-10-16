from datetime import date
from rest_framework import serializers
from usuarios.models import User
from usuarios.serializers.empresa_serializers import EmpresaSerializer


class UserEvaSerializer(serializers.ModelSerializer):
    empresa = EmpresaSerializer(read_only=True)
    genero = serializers.StringRelatedField(read_only=True)
    ciclo = serializers.StringRelatedField(read_only=True)
    cargo = serializers.StringRelatedField(read_only=True)
    foto = serializers.ImageField(use_url=True, read_only=True, allow_null=True)
    foto_thumbnail = serializers.SerializerMethodField()
    jefe = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            "id", "first_name", "last_name", "email", "rut",
            "genero", "cargo", "empresa", "jefe", "ciclo",
            "foto", "foto_thumbnail",
        ]
        read_only_fields = ["jefe"]

    def get_foto_thumbnail(self, obj):
        f = getattr(obj, "foto_thumbnail", None)
        if not f:
            return None
        try:
            url = f.url
        except Exception:
            return None
        return url if url and url != "/media/" else None


class UserSerializer(serializers.ModelSerializer):
    # Directos
    foto = serializers.ImageField(use_url=True, allow_null=True, required=False)
    foto_thumbnail = serializers.SerializerMethodField()
    genero = serializers.StringRelatedField(read_only=True)
    cargo = serializers.StringRelatedField(read_only=True)
    ciclo = serializers.StringRelatedField(read_only=True)
    empresa = EmpresaSerializer(read_only=True)
    jefe = serializers.StringRelatedField(read_only=True)
    is_superuser = serializers.BooleanField(read_only=True)

    # Calculados (propiedades del modelo)
    tiempo = serializers.SerializerMethodField()
    tiempo_en = serializers.SerializerMethodField()
    edad = serializers.SerializerMethodField()


    class Meta:
        model = User
        fields = [
            # básicos
            "id", "username", "first_name", "last_name", "email", "rut",
            "is_active", "is_superuser", "date_joined", "fecha_termino_contrato", "birthday",
            # relaciones simples/nombres
            "genero", "cargo", "ciclo", "empresa", "jefe",
            # imágenes
            "foto", "foto_thumbnail",
            # calculados
            "tiempo", "tiempo_en", "edad",

        ]
        read_only_fields = [
            "jefe", "is_superuser", "fecha_termino_contrato",
            "tiempo", "tiempo_en", "edad",
        ]

    # --- calculados ---
    def get_tiempo(self, obj):
        return obj.tiempo  # propiedad del modelo

    def get_tiempo_en(self, obj):
        return obj.tiempo_en  # propiedad del modelo

    def get_edad(self, obj):
        if obj.birthday:
            today = date.today()
            age = today.year - obj.birthday.year
            if (today.month, today.day) < (obj.birthday.month, obj.birthday.day):
                age -= 1
            return age
        return None

    # --- utilidades ---
    def get_foto_thumbnail(self, obj):
        f = getattr(obj, "foto_thumbnail", None)
        if not f:
            return None
        try:
            url = f.url
        except Exception:
            return None
        return url if url and url != "/media/" else None
