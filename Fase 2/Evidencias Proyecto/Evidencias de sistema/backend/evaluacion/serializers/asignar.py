# serializers.py
from rest_framework import serializers
from evaluacion.models import EvaluacionAsignada, TipoEvaluacion,JefeEvaluacionAsignada,JefeEvaluacionAsignadaDetalle
from django.contrib.auth import get_user_model
from evaluacion.serializers.evaluacion import JefeEvaluacionSerializer
from usuarios.models import Ciclo
from institucion.models import Empresa
from django.db import transaction
User = get_user_model()

class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = ['id', 'empresa']
class CicloSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ciclo
        fields = ['id', 'ciclo']

class UsuarioSerializer(serializers.ModelSerializer):
    empresa = EmpresaSerializer()  # incluir objeto completo
    ciclo = CicloSerializer()  # incluir objeto completo
    cargo = serializers.CharField()
    

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name','cargo', 'ciclo','empresa','jefe']

class TipoEvaluacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoEvaluacion
        fields = ['id', 'n_tipo_evaluacion','auto','ponderada']




class AutoEvaluacionAsignadaSerializer(serializers.ModelSerializer):
    tipo_evaluacion_id = serializers.PrimaryKeyRelatedField(
        queryset=TipoEvaluacion.objects.all(),
        source='tipo_evaluacion',
        write_only=True
    )
    tipo_evaluacion = TipoEvaluacionSerializer(read_only=True)

    # NUEVO: tipo de JEFATURA pareado
    auto_tipo_evaluacion_id = serializers.PrimaryKeyRelatedField(
        queryset=TipoEvaluacion.objects.all(),
        source='auto_tipo_evaluacion',
        write_only=True,
        required=False, allow_null=True
    )

    personas_asignadas_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), many=True,
        source='personas_asignadas', write_only=True
    )
    personas_asignadas = UsuarioSerializer(many=True, read_only=True)

    class Meta:
        model = EvaluacionAsignada
        fields = [
            'id',
            'tipo_evaluacion_id', 'tipo_evaluacion',
            'auto_tipo_evaluacion_id',          # <-- NUEVO (write)
            'fecha_evaluacion',
            'personas_asignadas_ids', 'personas_asignadas'
        ]
    def validate(self, data):
        tipo_evaluacion = data.get('tipo_evaluacion')
        fecha_evaluacion = data.get('fecha_evaluacion')

        if self.instance:
            # Es una actualización, evitar conflicto con sí mismo
            existe = EvaluacionAsignada.objects.exclude(id=self.instance.id).filter(
                tipo_evaluacion=tipo_evaluacion,
                fecha_evaluacion=fecha_evaluacion
            ).exists()
        else:
            # Es creación
            existe = EvaluacionAsignada.objects.filter(
                tipo_evaluacion=tipo_evaluacion,
                fecha_evaluacion=fecha_evaluacion
            ).exists()

        if existe:
            raise serializers.ValidationError("Ya existe una evaluación asignada con el mismo tipo y fecha.")

        return data



class EvaluacionAsignadaSerializer(serializers.ModelSerializer):
    tipo_evaluacion_id = serializers.PrimaryKeyRelatedField(
        queryset=TipoEvaluacion.objects.all(),
        source="tipo_evaluacion",
        write_only=True
    )
    tipo_evaluacion = TipoEvaluacionSerializer(read_only=True)

    personas_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True,
        write_only=True,
    )

    # opcional, lo ignoramos para mantener compatibilidad temporal
    evaluador_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = JefeEvaluacionAsignada
        fields = [
            "id",
            "tipo_evaluacion_id", "tipo_evaluacion",
            "fecha_evaluacion",
            "personas_ids",
            "evaluador_id",   # se acepta pero NO se persiste
        ]

    def _resolver_jefe(self, persona: User):
        # Ajusta al nombre real del campo en tu User
        return getattr(persona, "jefe", None) or getattr(persona, "jefe_directo", None)

    def validate(self, attrs):
        personas = attrs.get("personas_ids", [])
        sin_jefe = [p.id for p in personas if not self._resolver_jefe(p)]
        if sin_jefe:
            raise serializers.ValidationError({
                "personas_ids": f"Usuarios sin jefe asignado: {', '.join(map(str, sin_jefe))}"
            })
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        # Nunca guardar evaluador en el encabezado
        validated_data.pop("evaluador_id", None)
        validated_data.pop("evaluador", None)

        personas = validated_data.pop("personas_ids", [])
        asignacion = JefeEvaluacionAsignada.objects.create(**validated_data)

        detalles = []
        for persona in personas:
            jefe = self._resolver_jefe(persona)
            detalles.append(JefeEvaluacionAsignadaDetalle(
                asignacion=asignacion,
                persona=persona,
                evaluador=jefe,
            ))
        JefeEvaluacionAsignadaDetalle.objects.bulk_create(detalles)
        return asignacion


# ---------- MOSTRAR ----------
class MostrarEvaluacionAsignadaDetalleSerializer(serializers.ModelSerializer):
    persona = UsuarioSerializer(read_only=True)
    evaluador = UsuarioSerializer(read_only=True)

    class Meta:
        model = JefeEvaluacionAsignadaDetalle
        fields = ["id", "persona", "evaluador"]

class MostrarEvaluacionAsignadaSerializer(serializers.ModelSerializer):
    tipo_evaluacion = TipoEvaluacionSerializer(read_only=True)
    detalles = MostrarEvaluacionAsignadaDetalleSerializer(many=True, read_only=True)
    class Meta:
        model = JefeEvaluacionAsignada
        fields = ["id", "tipo_evaluacion", "fecha_evaluacion", "fecha_creacion", "detalles"]


