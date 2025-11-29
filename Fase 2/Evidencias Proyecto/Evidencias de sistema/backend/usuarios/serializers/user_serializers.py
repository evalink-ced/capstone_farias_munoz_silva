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
    group = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            "id", "first_name", "last_name", "email", "rut",
            "genero", "cargo", "empresa", "jefe", "ciclo",
            "foto", "foto_thumbnail", "group",
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
    is_staff = serializers.BooleanField(read_only=True)

    # Calculados (propiedades del modelo)
    tiempo = serializers.SerializerMethodField()
    tiempo_en = serializers.SerializerMethodField()
    edad = serializers.SerializerMethodField()


    empresa_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    cargo_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    ciclo_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    genero_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    jefe_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    group_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            # básicos
            "id", "username", "first_name", "last_name", "email", "rut",
            "is_active", "is_superuser", "is_staff", "date_joined", "fecha_termino_contrato", "birthday",
            # relaciones simples/nombres
            "genero", "cargo", "ciclo", "empresa", "jefe", "group",
            # imágenes
            "foto", "foto_thumbnail",
            # calculados
            "tiempo", "tiempo_en", "edad",
            # ids de escritura
            "empresa_id", "cargo_id", "ciclo_id", "genero_id", "jefe_id", "group_id",

        ]
        read_only_fields = [
            "id", "jefe", "is_superuser", "is_staff", "fecha_termino_contrato",
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

    def update(self, instance, validated_data):
        empresa_id = validated_data.pop("empresa_id", None)
        cargo_id = validated_data.pop("cargo_id", None)
        ciclo_id = validated_data.pop("ciclo_id", None)
        genero_id = validated_data.pop("genero_id", None)
        jefe_id = validated_data.pop("jefe_id", None)
        group_id = validated_data.pop("group_id", None)

        for field in [
            "username", "first_name", "last_name", "email", "rut",
            "birthday", "date_joined", "is_active",
        ]:
            if field in validated_data:
                setattr(instance, field, validated_data[field])

        if "foto" in validated_data:
            instance.foto = validated_data.get("foto")

        if empresa_id is not None:
            instance.empresa_id = empresa_id
        if cargo_id is not None:
            instance.cargo_id = cargo_id
        if ciclo_id is not None:
            instance.ciclo_id = ciclo_id
        if genero_id is not None:
            instance.genero_id = genero_id
        if jefe_id is not None:
            instance.jefe_id = jefe_id
        if group_id is not None:
            instance.group_id = group_id

        instance.save()
        return instance

    def create(self, validated_data):
        empresa_id = validated_data.pop("empresa_id", None)
        cargo_id = validated_data.pop("cargo_id", None)
        ciclo_id = validated_data.pop("ciclo_id", None)
        genero_id = validated_data.pop("genero_id", None)
        jefe_id = validated_data.pop("jefe_id", None)
        group_id = validated_data.pop("group_id", None)

        user = User(**validated_data)

        if empresa_id is not None:
            user.empresa_id = empresa_id
        if cargo_id is not None:
            user.cargo_id = cargo_id
        if ciclo_id is not None:
            user.ciclo_id = ciclo_id
        if genero_id is not None:
            user.genero_id = genero_id
        if jefe_id is not None:
            user.jefe_id = jefe_id
        if group_id is not None:
            user.group_id = group_id

        user.save()
        return user

    def validate(self, attrs):
        qs = User.objects.all()
        instance = getattr(self, 'instance', None)
        if instance is not None:
            qs = qs.exclude(pk=instance.pk)

        username = attrs.get('username')
        if username and qs.filter(username=username).exists():
            raise serializers.ValidationError({"username": "Ya existe un usuario con este nombre"})

        rut = attrs.get('rut')
        if rut:
            try:
                from usuarios.utils.validators import validate_rut as _vr
                clean_rut = _vr(rut)
            except Exception as e:
                raise serializers.ValidationError({"rut": str(e)})
            if qs.filter(rut=clean_rut).exists():
                raise serializers.ValidationError({"rut": "Ya existe un usuario con este RUT"})

        return attrs
