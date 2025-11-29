from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q, F
from django.utils import timezone
from usuarios.utils.validators import validate_rut
from theme.models import Theme


class TipoOrganizacion(models.Model):
    """Define los tipos de organizaciones (Fundaciones, Empresas de Servicio, etc.)"""
    nombre = models.CharField(max_length=50, unique=True)  # "Fundación", "Empresa de Servicio"
    descripcion = models.TextField(blank=True)
    
    # Configuración específica para empresas de servicio
    es_prestador_servicio = models.BooleanField(default=False)  # True para GAE, SP
    permite_multisede = models.BooleanField(default=False)  # True para SP, False para GAE
    max_sedes_por_trabajador = models.PositiveSmallIntegerField(default=1)  # Para GAE=1, SP=múltiples
    
    activo = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Tipo de Organización"
        verbose_name_plural = "Tipos de Organización"
    
    def __str__(self):
        return self.nombre


class Organizacion(models.Model):
    """Unifica fundaciones y empresas de servicio en un solo modelo"""
    class TipoEmpresa(models.TextChoices):
        SA = "SA", "Sociedad Anónima"
        LTDA = "LTDA", "Sociedad de Responsabilidad Limitada"
        SPA = "SPA", "Sociedad por Acciones"
        EIRL = "EIRL", "Empresa Individual de Responsabilidad Limitada"
        FUNDACION = "FUNDACION", "Fundación"
        OTRO = "OTRO", "Otro"
    
    rut = models.CharField(max_length=12, validators=[validate_rut], unique=True)
    nombre = models.CharField(max_length=100, unique=True)
    nombre_corto = models.CharField(max_length=20, unique=True)
    direccion = models.CharField(max_length=200, blank=True)
    tipo_organizacion = models.ForeignKey(TipoOrganizacion, on_delete=models.PROTECT)
    tipo_empresa = models.CharField(max_length=12, choices=TipoEmpresa.choices, default=TipoEmpresa.FUNDACION)
    
    # Campos visuales removidos - ahora están en SedeOrganizacion
    
    # Metadatos
    activa = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Organización"
        verbose_name_plural = "Organizaciones"
    
    def __str__(self):
        return self.nombre_corto
    
    @property
    def es_prestador_servicio(self):
        """Indica si esta organización presta servicios a otras"""
        return self.tipo_organizacion.es_prestador_servicio
    
    @property
    def permite_multisede(self):
        """Indica si puede trabajar en múltiples sedes"""
        return self.tipo_organizacion.permite_multisede


class SedeOrganizacion(models.Model):
    """Sedes específicas de cada organización (colegios)"""
    organizacion = models.ForeignKey(Organizacion, on_delete=models.CASCADE, related_name="sedes")
    nombre = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100)
    direccion = models.CharField(max_length=200, blank=True)
    
    # Configuración visual (movida desde Organizacion)
    logo = models.ImageField(upload_to="sede_logos/", blank=True, null=True)
    fondo = models.ImageField(upload_to="sede_fondos/", blank=True, null=True)
    theme = models.ForeignKey(Theme, on_delete=models.SET_NULL, null=True, blank=True)

    activa = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Sede de Organización"
        verbose_name_plural = "Sedes de Organización"
        unique_together = [("organizacion", "nombre"), ("organizacion", "slug")]
    
    def __str__(self):
        return f"{self.organizacion.nombre_corto} - {self.nombre}"


class RelacionServicio(models.Model):
    """Define qué empresa de servicio puede trabajar en qué fundación"""
    empresa_servicio = models.ForeignKey(
        Organizacion, 
        on_delete=models.CASCADE, 
        related_name="servicios_prestados",
        limit_choices_to={'tipo_organizacion__es_prestador_servicio': True}
    )
    organizacion_cliente = models.ForeignKey(
        Organizacion, 
        on_delete=models.CASCADE, 
        related_name="servicios_recibidos",
        limit_choices_to={'tipo_organizacion__es_prestador_servicio': False}
    )
    
    # Configuración del servicio
    sedes_permitidas = models.ManyToManyField(SedeOrganizacion, related_name="relaciones_servicio")
    
    # Vigencia
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(null=True, blank=True)
    activo = models.BooleanField(default=True)
    
    # Metadatos
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Relación de Servicio"
        verbose_name_plural = "Relaciones de Servicio"
        unique_together = [("empresa_servicio", "organizacion_cliente")]
        constraints = [
            models.CheckConstraint(
                check=Q(fecha_fin__isnull=True) | Q(fecha_fin__gte=F("fecha_inicio")),
                name="relacion_fechas_validas",
            ),
        ]

    def __str__(self):
        return f"{self.empresa_servicio.nombre_corto} → {self.organizacion_cliente.nombre_corto}"
    
    @property
    def vigente(self) -> bool:
        """Verifica si la relación está vigente"""
        if not self.activo:
            return False
        hoy = timezone.now().date()
        if hoy < self.fecha_inicio:
            return False
        if self.fecha_fin and hoy > self.fecha_fin:
            return False
        return True
    
    def clean(self):
        """Validaciones personalizadas"""
        super().clean()
        
        # Validar que empresa_servicio sea realmente prestador de servicio
        if self.empresa_servicio and not self.empresa_servicio.es_prestador_servicio:
            raise ValidationError({
                'empresa_servicio': 'La organización seleccionada no es prestadora de servicios'
            })
        
        # Validar que organizacion_cliente NO sea prestador de servicio
        if self.organizacion_cliente and self.organizacion_cliente.es_prestador_servicio:
            raise ValidationError({
                'organizacion_cliente': 'La organización cliente no puede ser prestadora de servicios'
            })


class AsignacionTrabajador(models.Model):
    """Asignación simplificada de un trabajador a una organización y sede"""
    trabajador = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="asignaciones_nuevas")
    organizacion = models.ForeignKey(Organizacion, on_delete=models.CASCADE, related_name="asignaciones")
    sede = models.ForeignKey(SedeOrganizacion, on_delete=models.CASCADE, related_name="asignaciones")
    
    # Solo se llena si es asignación a través de empresa de servicio
    relacion_servicio = models.ForeignKey(RelacionServicio, on_delete=models.CASCADE, related_name="asignaciones", null=True, blank=True)
    
    # Configuración de la asignación
    porcentaje_tiempo = models.DecimalField(max_digits=5, decimal_places=2, default=100.00)  # 0.00 a 100.00
    es_permanente = models.BooleanField(default=True)  # False para asignaciones temporales
    
    # Vigencia
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(null=True, blank=True)
    activa = models.BooleanField(default=True)
    
    # Metadatos
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Asignación de Trabajador"
        verbose_name_plural = "Asignaciones de Trabajador"
        constraints = [
            models.CheckConstraint(
                check=Q(fecha_fin__isnull=True) | Q(fecha_fin__gte=F("fecha_inicio")),
                name="asignacion_fechas_validas",
            ),
            models.CheckConstraint(
                check=Q(porcentaje_tiempo__gte=0) & Q(porcentaje_tiempo__lte=100),
                name="asignacion_porcentaje_valido",
            ),
        ]
        indexes = [
            models.Index(fields=["trabajador", "fecha_inicio", "fecha_fin"]),
            models.Index(fields=["organizacion", "sede", "activa"]),
            models.Index(fields=["relacion_servicio", "sede", "activa"]),
        ]
    
    def __str__(self):
        tipo_asignacion = "Directo" if not self.relacion_servicio else self.relacion_servicio.empresa_servicio.nombre_corto
        return f"{self.trabajador.get_full_name()} → {self.sede} ({tipo_asignacion}) ({self.porcentaje_tiempo}%)"
    
    @property
    def vigente(self) -> bool:
        """Verifica si la asignación está vigente"""
        if not self.activa:
            return False
        hoy = timezone.now().date()
        if hoy < self.fecha_inicio:
            return False
        if self.fecha_fin and hoy > self.fecha_fin:
            return False
        return True
    
    @property
    def es_asignacion_directa(self):
        """Indica si es asignación directa (sin empresa de servicio)"""
        return self.relacion_servicio is None
    
    @property
    def organizacion_efectiva(self):
        """Retorna la organización donde realmente trabaja (siempre la sede)"""
        return self.sede.organizacion
    
    def clean(self):
        """Validaciones personalizadas"""
        super().clean()
        
        # Validar coherencia entre organización y sede
        if self.sede and self.organizacion:
            # Si es asignación directa, organización debe ser dueña de la sede
            if not self.relacion_servicio:
                if self.sede.organizacion != self.organizacion:
                    raise ValidationError({
                        'organizacion': f'Para asignación directa, debe seleccionar la organización dueña de la sede ({self.sede.organizacion})'
                    })
            else:
                # Si es por empresa de servicio, validar relación
                if self.organizacion != self.relacion_servicio.empresa_servicio:
                    raise ValidationError({
                        'organizacion': 'La organización debe coincidir con la empresa de servicio de la relación'
                    })
                
                if self.sede.organizacion != self.relacion_servicio.organizacion_cliente:
                    raise ValidationError({
                        'sede': 'La sede debe pertenecer a la organización cliente de la relación de servicio'
                    })
                
                # Validar que la sede esté permitida en la relación
                if self.sede not in self.relacion_servicio.sedes_permitidas.all():
                    raise ValidationError({
                        'sede': f'La sede {self.sede} no está permitida en la relación de servicio'
                    })
        
        # Validar relación de servicio vigente
        if self.relacion_servicio and not self.relacion_servicio.vigente:
            raise ValidationError({
                'relacion_servicio': 'No se puede asignar a una relación de servicio no vigente'
            })
        
        # Validar solapamiento de asignaciones para la misma sede
        if self.trabajador and self.sede:
            asignaciones_existentes = AsignacionTrabajador.objects.filter(
                trabajador=self.trabajador,
                sede=self.sede,
                activa=True
            ).exclude(pk=self.pk)
            
            for asignacion in asignaciones_existentes:
                if self._fechas_se_solapan(asignacion):
                    raise ValidationError({
                        'fecha_inicio': f'Ya existe una asignación activa para esta sede en el período especificado'
                    })
    
    def _fechas_se_solapan(self, otra_asignacion):
        """Verifica si las fechas se solapan con otra asignación"""
        # Si alguna no tiene fecha fin, se considera infinita
        mi_fin = self.fecha_fin or timezone.now().date() + timezone.timedelta(days=36500)  # ~100 años
        otra_fin = otra_asignacion.fecha_fin or timezone.now().date() + timezone.timedelta(days=36500)
        
        return not (mi_fin < otra_asignacion.fecha_inicio or self.fecha_inicio > otra_fin)