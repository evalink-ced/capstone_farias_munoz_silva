from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q, F
from django.utils import timezone
from usuarios.utils.validators import validate_rut
from theme.models import Theme


class Empresa(models.Model):
    class TipoEmpresa(models.TextChoices):
        SA = "SA", "Sociedad Anónima"
        LTDA = "LTDA", "Sociedad de Responsabilidad Limitada"
        SPA = "SPA", "Sociedad por Acciones"
        EIRL = "EIRL", "Empresa Individual de Responsabilidad Limitada"
        FUNDACION = "FUNDACION", "Fundación"
        COOPERATIVA = "COOP", "Cooperativa"
        OTRO = "OTRO", "Otro"

    class Categoria(models.TextChoices):
        FUNDACION_PUDAHUEL = "FUND_PUDAHUEL", "Fundación Pudahuel"
        FUNDACION_CERRO_NAVIA = "FUND_CERRO", "Fundación Cerro Navia"
        GAE = "GAE", "GAE"
        SP  = "SP", "SP"
        OTRO = "OTRO", "Otro"

    rut = models.CharField(max_length=12, validators=[validate_rut], blank=True, default="rut")
    empresa = models.CharField(max_length=40, unique=True)
    name = models.CharField(max_length=40, default="nombre", blank=True)
    direccion = models.CharField(max_length=50, blank=True)
    logo = models.ImageField(upload_to="empresa_logos/", blank=True, null=True)
    fondo = models.ImageField(upload_to="fondo/", blank=True, null=True)
    theme = models.ForeignKey(Theme, on_delete=models.SET_NULL, null=True, blank=True, default=1)

    tipo_empresa = models.CharField(max_length=12, choices=TipoEmpresa.choices, default=TipoEmpresa.SPA)
    categoria_operativa = models.CharField(max_length=20, choices=Categoria.choices, default=Categoria.OTRO)


    def __str__(self):
        return self.empresa


class Sede(models.Model):
    nombre = models.CharField(max_length=60, unique=True)  # "Pudahuel", "Cerro Navia"
    slug = models.SlugField(max_length=60, unique=True)
    direccion = models.CharField(max_length=120, blank=True)

    def __str__(self):
        return self.nombre


class EmpresaPersonaConfig(models.Model):
    persona = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="empresas_config")
    empresa = models.ForeignKey("Empresa", on_delete=models.CASCADE, related_name="personas_config")
    # Solo se considera en SP: habilita 2 sedes activas
    permite_multisede = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["persona", "empresa"], name="uniq_persona_empresa_cfg"),
        ]

    def __str__(self):
        return f"{self.persona} @ {self.empresa} (multi={self.permite_multisede})"


class Asignacion(models.Model):
    persona = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="asignaciones")
    empresa = models.ForeignKey("Empresa", on_delete=models.PROTECT, related_name="asignaciones")
    sede    = models.ForeignKey("Sede", on_delete=models.PROTECT, related_name="asignaciones")

    # ← se autocompleta desde persona.date_joined
    fecha_inicio = models.DateField(editable=False)   # no lo pides en formularios
    fecha_fin    = models.DateField(null=True, blank=True)

    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=Q(fecha_fin__isnull=True) | Q(fecha_fin__gte=F("fecha_inicio")),
                name="asig_fechas_validas",
            ),
        ]
        indexes = [models.Index(fields=["persona", "empresa", "sede", "fecha_inicio"])]

    def save(self, *args, **kwargs):
        # Si viene vacía, la tomamos del contrato (date_joined)
        if not self.fecha_inicio:
            dj = self.persona.date_joined
            # en tu User, date_joined ya es DateField, así que listo:
            self.fecha_inicio = dj
        super().save(*args, **kwargs)

    @property
    def activa(self) -> bool:
        hoy = timezone.localdate()
        return self.fecha_inicio <= hoy and (self.fecha_fin is None or self.fecha_fin >= hoy)

    def clean(self):
        # 1) Sede permitida por la empresa
        if not self.empresa.sedes_permitidas.filter(pk=self.sede_id).exists():
            raise ValidationError("La sede seleccionada no está permitida para esta empresa.")

        hoy = timezone.localdate()
        fi = self.fecha_inicio or self.persona.date_joined   # ← usar date_joined si aún no se setea

        # 2) Conteo de activas hoy para persona+empresa
        activas = (Asignacion.objects
                   .filter(persona=self.persona, empresa=self.empresa, fecha_inicio__lte=hoy)
                   .filter(Q(fecha_fin__isnull=True) | Q(fecha_fin__gte=hoy)))
        if self.pk:
            activas = activas.exclude(pk=self.pk)

        seria_activa = (fi <= hoy and (self.fecha_fin is None or self.fecha_fin >= hoy))
        total_activas = activas.count() + (1 if seria_activa else 0)

        # 3) Límite general por empresa (+ excepción SP por persona)
        limite = self.empresa.max_sedes_activas_por_persona
        if self.empresa.categoria_operativa == Empresa.Categoria.SP and self.empresa.permite_concurrencia:
            from .models import EmpresaPersonaConfig
            if EmpresaPersonaConfig.objects.filter(
                persona=self.persona, empresa=self.empresa, permite_multisede=True
            ).exists():
                limite = max(limite, 2)

        if total_activas > limite:
            raise ValidationError(f"Supera el máximo de sedes activas permitidas ({limite}) para esta empresa.")

        # 4) Evitar solapes en la misma sede
        solapes = (Asignacion.objects
            .filter(persona=self.persona, empresa=self.empresa, sede=self.sede)
            .exclude(pk=self.pk)
            .filter(Q(fecha_fin__isnull=True, fecha_inicio__lte=self.fecha_fin or hoy) |
                    Q(fecha_fin__gte=fi)))
        if solapes.exists():
            raise ValidationError("Ya existe otra asignación que se solapa en la misma sede.")

        # 5) Respetar término de contrato (si existe)
        fin_ctto = self.persona.fecha_termino_contrato  # None si indefinido
        if fin_ctto:
            if fi > fin_ctto:
                raise ValidationError("La asignación no puede iniciar después del término de contrato del usuario.")
            if self.fecha_fin and self.fecha_fin > fin_ctto:
                raise ValidationError("La asignación no puede finalizar después del término de contrato del usuario.")
