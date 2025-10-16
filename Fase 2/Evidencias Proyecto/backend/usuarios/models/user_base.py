"""
Modelo User principal refactorizado
"""
from django.contrib.auth.models import AbstractUser, Group
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from imagekit.models import ImageSpecField
from imagekit.processors import ResizeToFill
from institucion.models import Asignacion
from usuarios.models.estructura import Cargo, Codigo, Ciclo, Genero
from usuarios.utils.date_utils import _as_date
from usuarios.utils.validators import validate_rut
from .user_choices import (
    TipoContrato, 
    DEFAULT_PASSWORD, 
    DEFAULT_DIAS_RESTANTES, 
    DEFAULT_DIAS_CUMPLEANIOS,
    DEFAULT_GROUP_NAME,
    FOTO_UPLOAD_PATH,
    THUMBNAIL_SIZE,
    THUMBNAIL_QUALITY
)
from .user_mixins import ContractMixin, AssignmentMixin


class User(AbstractUser, ContractMixin, AssignmentMixin):
    """
    Modelo de Usuario extendido con funcionalidades específicas del sistema
    """
    
    # Relaciones básicas
    group = models.ForeignKey(
        Group, 
        related_name='user_group', 
        verbose_name="grupo", 
        on_delete=models.CASCADE, 
        blank=True, 
        null=True
    )
    
    # Campos de autenticación
    password = models.CharField(
        max_length=100, 
        verbose_name=_('contraseña'), 
        default=DEFAULT_PASSWORD, 
        editable=False
    )
    
    # Información personal
    rut = models.CharField(
        max_length=12, 
        unique=False,
        validators=[validate_rut], 
        null=True,
        verbose_name="RUT"
    )
    username = models.CharField(
        max_length=150, 
        unique=True, 
        verbose_name='usuario'
    )
    first_name = models.CharField(
        max_length=30, 
        verbose_name=_('nombre')
    )
    last_name = models.CharField(
        max_length=30, 
        verbose_name=_('Apellido')
    )
    email = models.EmailField(
        blank=True,
        null=True, 
        verbose_name=_('correo')
    )
    birthday = models.DateField(
        _('cumpleaños'), 
        blank=True, 
        null=True
    )
    foto = models.ImageField(
        upload_to=FOTO_UPLOAD_PATH, 
        blank=True, 
        null=True,
        verbose_name="Fotografía"
    )
    foto_thumbnail = ImageSpecField(
        source='foto',
        processors=[ResizeToFill(*THUMBNAIL_SIZE)],
        format='JPEG',
        options={'quality': THUMBNAIL_QUALITY}
    )
    genero = models.ForeignKey(
        Genero, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name="Género"
    )
    
    # Jerarquía organizacional
    jefe = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='subordinados',
        verbose_name=_('jefe')
    )
    
    # Información laboral
    date_joined = models.DateField(
        ('Fecha Ingreso'), 
        default=timezone.localdate
    )
    cargo = models.ForeignKey(
        Cargo, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name="Cargo"
    )
    ciclo = models.ForeignKey(
        Ciclo, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name="Ciclo"
    )
    codigo = models.ForeignKey(
        Codigo, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name="Código"
    )
    tipo_contrato = models.CharField(
        max_length=6, 
        choices=TipoContrato.choices, 
        default=TipoContrato.INDEFINIDO,
        verbose_name="Tipo de contrato"
    )
    fecha_termino_contrato = models.DateField(
        null=True, 
        blank=True,
        verbose_name="Fecha término contrato"
    )

    # Campo deprecado - mantener para compatibilidad
    empresa = models.ForeignKey(
        'institucion.Empresa', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        help_text="DEPRECADO: Usar asignaciones_trabajo en su lugar",
        verbose_name="Empresa (Deprecado)"
    )
    
    # Configuración de permisos
    is_superuser = models.BooleanField(
        default=False, 
        verbose_name=_('super usuario')
    )

    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"
        ordering = ['first_name', 'last_name']
        indexes = [
            models.Index(fields=['rut']),
            models.Index(fields=['email']),
            models.Index(fields=['date_joined']),
            models.Index(fields=['tipo_contrato']),
            models.Index(fields=['is_active']),
        ]

    def clean(self):
        """Validaciones del modelo"""
        super().clean()
        
        if self.tipo_contrato == TipoContrato.INDEFINIDO:
            self.fecha_termino_contrato = None
        else:
            if not self.fecha_termino_contrato:
                raise ValidationError({
                    "fecha_termino_contrato": "Requerida para este tipo de contrato."
                })
            inicio = _as_date(self.date_joined)
            fin = _as_date(self.fecha_termino_contrato)
            if fin < inicio:
                raise ValidationError({
                    "fecha_termino_contrato": "Debe ser ≥ a la fecha de inicio (date_joined)."
                })

    def save(self, *args, **kwargs):
        """Lógica personalizada de guardado"""
        # Normalizar RUT
        if self.rut:
            self.rut = validate_rut(self.rut)

        # Gestión de transición activo -> inactivo
        self._handle_active_transition()
        
        # Gestión de contratos
        self._handle_contract_logic()
        
        # Obtener valor anterior para detectar cambios
        prev_fin = self._get_previous_contract_end()
        
        super().save(*args, **kwargs)
        
        # Actualizar asignaciones según cambio de contrato
        self._update_assignments_on_contract_change(prev_fin)
        
        # Asignar grupo por defecto
        self._assign_default_group()

    def _handle_active_transition(self):
        """Maneja la transición de activo a inactivo"""
        if self.pk is not None:
            prev = User.objects.filter(pk=self.pk).values(
                "is_active", "fecha_termino_contrato"
            ).first()
            if (prev and prev["is_active"] and not self.is_active 
                and not prev["fecha_termino_contrato"]):
                self.fecha_termino_contrato = (
                    _as_date(self.fecha_termino_contrato) or timezone.localdate()
                )

    def _handle_contract_logic(self):
        """Maneja la lógica de contratos"""
        if self.tipo_contrato == TipoContrato.INDEFINIDO:
            self.fecha_termino_contrato = None
        else:
            self.fecha_termino_contrato = _as_date(self.fecha_termino_contrato)

    def _get_previous_contract_end(self):
        """Obtiene la fecha de término anterior del contrato"""
        prev_fin = None
        if self.pk:
            prev = User.objects.filter(pk=self.pk).values(
                "tipo_contrato", "fecha_termino_contrato"
            ).first()
            if prev:
                prev_fin = (prev["fecha_termino_contrato"] 
                           if prev["tipo_contrato"] != TipoContrato.INDEFINIDO 
                           else None)
        return prev_fin

    def _update_assignments_on_contract_change(self, prev_fin):
        """Actualiza asignaciones según cambio de contrato"""
        new_fin = _as_date(self.fecha_termino_contrato)
        if new_fin != prev_fin:
            if new_fin:
                Asignacion.objects.filter(persona=self)\
                    .filter(models.Q(fecha_fin__isnull=True) | 
                           models.Q(fecha_fin__gt=new_fin))\
                    .update(fecha_fin=new_fin)
            else:
                if prev_fin:
                    Asignacion.objects.filter(
                        persona=self, fecha_fin=prev_fin
                    ).update(fecha_fin=None)

    def _assign_default_group(self):
        """Asigna grupo por defecto si no tiene ninguno"""
        if not self.groups.exists():
            try:
                default_group = Group.objects.get(name=DEFAULT_GROUP_NAME)
                self.groups.add(default_group)
            except Group.DoesNotExist:
                pass

    def __str__(self):
        return f"{self.first_name} {self.last_name}"