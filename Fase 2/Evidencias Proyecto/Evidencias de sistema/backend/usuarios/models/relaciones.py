from django.db import models
from django.contrib.auth.models import Group
from usuarios.models.estructura import Cargo, Ciclo, Genero
from institucion.models import Empresa
from django.utils.translation import gettext_lazy as _

class RelacionesMixin(models.Model):
    group = models.ForeignKey(
        Group, related_name='user_group', verbose_name="grupo", on_delete=models.CASCADE, blank=True, null=True
    )

    jefe = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subordinados',
        verbose_name=_('jefe'))
    cargo = models.ForeignKey(
        Cargo, on_delete=models.SET_NULL, null=True, blank=True)
    ciclo = models.ForeignKey(
        Ciclo, on_delete=models.SET_NULL, null=True, blank=True)
    empresa = models.ForeignKey(
        Empresa, on_delete=models.SET_NULL, null=True, blank=True)
    foto = models.ImageField(upload_to='foto/', blank=True, null=True)
    genero = models.ForeignKey(Genero, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        abstract = True
