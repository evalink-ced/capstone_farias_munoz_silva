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


    rut = models.CharField(max_length=12, validators=[validate_rut], blank=True, default="rut")
    empresa = models.CharField(max_length=40, unique=True)
    name = models.CharField(max_length=40, default="nombre", blank=True)
    direccion = models.CharField(max_length=50, blank=True)
    logo = models.ImageField(upload_to="empresa_logos/", blank=True, null=True)
    fondo = models.ImageField(upload_to="fondo/", blank=True, null=True)
    theme = models.ForeignKey(Theme, on_delete=models.SET_NULL, null=True, blank=True, default=1)

    tipo_empresa = models.CharField(max_length=12, choices=TipoEmpresa.choices, default=TipoEmpresa.SPA)


    def __str__(self):
        return self.empresa




