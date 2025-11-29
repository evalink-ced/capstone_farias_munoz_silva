from django.db import models
from django.contrib.auth.models import Group
from institucion.models import Empresa
from django.utils.translation import gettext_lazy as _
class TemplateAccess(models.Model):
    # Usar la ruta (href) como identificador único del permiso
    name = models.CharField(
        max_length=200,
        unique=True,
        help_text="Ruta protegida (ej: '/solicitar', '/directivo/usuarios')"
    )

    def __str__(self):
        return self.name
    class Meta:
       verbose_name = "plantilla de acceso"  # Nombre en singular
       verbose_name_plural = "plantillas de accesos"  # Nombre en plural

class AccessPermission(models.Model):
    group = models.CharField(max_length=200, null=True, blank=True)
    empresa = models.ManyToManyField(Empresa, blank=True)
    templates = models.ManyToManyField(TemplateAccess, related_name='permissions')
    # Configuración de permisos
    is_staff = models.BooleanField(
        default=False,
        verbose_name=_('Super usuario')
    )

    def __str__(self):
        return f"{self.group}"

    class Meta:
        verbose_name = "Permiso"  # Nombre en singular
        verbose_name_plural = "Permisos"  # Nombre en plural