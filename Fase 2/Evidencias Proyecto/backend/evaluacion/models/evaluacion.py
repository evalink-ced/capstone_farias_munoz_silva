from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from django.utils import timezone  # ✅ AGREGAR IMPORT

class EvaluacionJefe(models.Model):
    # Estados posibles para el campo estado_firma
    ESTADO_FIRMA_CHOICES = [
        ('pendiente', 'Pendiente de Firma'),
        ('firmado', 'Firmado'),
        ('firmado_obs', 'Firmado con Observaciones'),
    ]
    
    persona = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='evaluaciones_como_evaluado',
        null=True, blank=True
    )
    evaluador = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='evaluaciones_que_he_realizado'
    )
    tipo_evaluacion = models.ForeignKey('evaluacion.TipoEvaluacion', on_delete=models.CASCADE)
    fecha_evaluacion = models.CharField(max_length=7)  # MM-AAAA
    fecha_inicio = models.DateTimeField(auto_now_add=True)
    fecha_ultima_modificacion = models.DateTimeField(auto_now=True)
    
    # ✅ NUEVO FLUJO DE ESTADOS
    completado = models.BooleanField(default=False)  # Evaluación completada por el evaluador
    fecha_reunion = models.DateTimeField(null=True, blank=True)  # Fecha de la reunión
    retroalimentacion_completada = models.BooleanField(default=False)  # Retroalimentación finalizada
    cerrado_para_firma = models.BooleanField(default=False)  # Listo para que el evaluado firme
    
    # ✅ CAMBIO: Reemplazar firmado boolean por estado_firma
    estado_firma = models.CharField(
        max_length=20, 
        choices=ESTADO_FIRMA_CHOICES, 
        default='pendiente',
        help_text="Estado de la firma: pendiente, firmado o firmado_obs"
    )
    fecha_firma = models.DateTimeField(null=True, blank=True)  # Fecha de firma o denegación
    motivo_denegacion = models.TextField(
        blank=True, 
        null=True,
        help_text="Motivo por el cual se denegó la evaluación"
    )
    
    text_destacar = models.TextField(blank=True, null=True)
    text_mejorar = models.TextField(blank=True, null=True)
    retroalimentacion = models.TextField(blank=True, null=True)  # Comentarios de la reunión
    
    logro_obtenido = models.DecimalField(default=0, max_digits=5, decimal_places=2)
    estructura_json = models.JSONField(null=True, blank=True)
    version_plantilla = models.CharField(max_length=50, null=True, blank=True)
    ponderada = models.BooleanField(default=False)
    asignacion = models.ForeignKey('evaluacion.EvaluacionAsignada', null=True, blank=True, on_delete=models.PROTECT, related_name='evaluaciones_jefatura')

    # ✅ PROPIEDADES DE COMPATIBILIDAD
    @property
    def firmado(self):
        """Propiedad de compatibilidad para mantener el código existente"""
        return self.estado_firma == 'firmado'

    @property
    def firmado_obs(self):
        """Nueva propiedad para verificar si fue firmado_obs"""
        return self.estado_firma == 'firmado_obs'

    class Meta:
        ordering = ['-fecha_inicio']
        constraints = [
            models.UniqueConstraint(fields=['persona','tipo_evaluacion','fecha_evaluacion','evaluador'], name='uniq_jefe_persona_tipo_fecha_eval')
        ]

    def save(self, *args, **kwargs):
        # ✅ DETECTAR CAMBIOS DE ESTADO PARA NOTIFICACIONES
        old_instance = None
        is_completing = False
        is_closing_for_signature = False
        is_signing = False
        is_denying = False
        
        if self.pk:
            old_instance = EvaluacionJefe.objects.get(pk=self.pk)
            is_completing = not old_instance.completado and self.completado
            is_closing_for_signature = not old_instance.cerrado_para_firma and self.cerrado_para_firma
            is_signing = old_instance.estado_firma != 'firmado' and self.estado_firma == 'firmado'
            is_denying = old_instance.estado_firma != 'firmado_obs' and self.estado_firma == 'firmado_obs'
        
        # ✅ CREAR SNAPSHOT AL CREAR LA EVALUACIÓN
        if not self.pk and not self.estructura_json:
            self.crear_snapshot_estructura()
        
        # ✅ VALIDAR FLUJO DE ESTADOS
        if self.estado_firma in ['firmado', 'firmado_obs'] and not self.cerrado_para_firma:
            raise ValueError("No se puede firmar o denegar sin estar cerrado para firma")
        if self.cerrado_para_firma and not self.retroalimentacion_completada:
            raise ValueError("No se puede cerrar para firma sin completar retroalimentación")
        if self.retroalimentacion_completada and not self.completado:
            raise ValueError("No se puede realizar retroalimentación sin completar evaluación")
            
        # ✅ VALIDAR MOTIVO DE DENEGACIÓN (MEJORADO)
        if self.estado_firma == 'firmado_obs':
            motivo_limpio = (self.motivo_denegacion or '').strip()
            if not motivo_limpio:
                raise ValueError("Se requiere un motivo para denegar la evaluación")
            if len(motivo_limpio) < 50:
                raise ValueError(f"El motivo de denegación debe tener al menos 50 caracteres (actual: {len(motivo_limpio)})")
            # Actualizar el campo con el motivo limpio
            self.motivo_denegacion = motivo_limpio
            
        # ✅ ESTABLECER FECHAS AUTOMÁTICAMENTE
        if self.retroalimentacion_completada and not self.fecha_reunion:
            self.fecha_reunion = timezone.now()
        if self.estado_firma in ['firmado', 'firmado_obs'] and not self.fecha_firma:
            self.fecha_firma = timezone.now()
            
        super().save(*args, **kwargs)
        
        # ✅ ENVIAR NOTIFICACIONES SEGÚN EL CAMBIO DE ESTADO (SOLO FUNCIONES EXISTENTES)
        if is_completing:
            from evaluacion.utils.email_notifications import enviar_notificacion_evaluacion_completada
            enviar_notificacion_evaluacion_completada(self)
        

        if is_signing:
            from evaluacion.utils.email_notifications import enviar_notificacion_evaluacion_finalizada
            enviar_notificacion_evaluacion_finalizada(self)
        
        if is_denying:
            from evaluacion.utils.email_notifications import enviar_notificacion_evaluacion_denegada
            enviar_notificacion_evaluacion_denegada(self)
    
    def get_estado_actual(self):
        """Retorna el estado actual de la evaluación"""
        if self.estado_firma == 'firmado':
            return "finalizada"
        elif self.estado_firma == 'firmado_obs':
            return "firmado con observación"
        elif self.cerrado_para_firma:
            return "pendiente_firma"
        elif self.retroalimentacion_completada:
            return "retroalimentacion_completada"
        elif self.completado:
            return "completada"
        else:
            return "en_progreso"

    def puede_completar_retroalimentacion(self):
        """Verifica si puede completar retroalimentación"""
        return self.completado and not self.retroalimentacion_completada
    
    def puede_cerrar_para_firma(self):
        """Verifica si puede cerrar para firma"""
        return self.retroalimentacion_completada and not self.cerrado_para_firma
    
    def puede_firmar(self):
        """Verifica si puede ser firmada"""
        return self.cerrado_para_firma and self.estado_firma == 'pendiente'
    
    def puede_denegar(self):
        """Verifica si puede ser denegada"""
        return self.cerrado_para_firma and self.estado_firma == 'pendiente'

    def crear_snapshot_estructura(self):
        """Crea snapshot inmutable de la estructura actual"""
        from evaluacion.serializers.tipo_evaluacion_read import TipoEvaluacionParaAutoevaluacionSerializer
        self.estructura_json = TipoEvaluacionParaAutoevaluacionSerializer(self.tipo_evaluacion).data
        self.version_plantilla = f"{self.tipo_evaluacion.id}_{timezone.now().strftime('%Y%m%d_%H%M%S')}"
    
    def get_indicadores_validos(self):
        """Obtiene indicadores válidos desde el snapshot, no desde la plantilla actual"""
        if not self.estructura_json:
            return set()
        
        indicadores = set()
        for area in self.estructura_json.get('areas', []):
            for comp in area.get('competencias', []):
                for ind in comp.get('indicadores', []):
                    indicadores.add(ind['id'])
        return indicadores

    def calcular_logro(self):
        """Calcula logro usando la estructura guardada en snapshot"""
        if not self.estructura_json:
            # Fallback al método original si no hay snapshot
            return self._calcular_logro_original()
            
        respuestas = self.respuestas.all()
        total = Decimal(0)
        total_ponderacion = Decimal(0)

        # ✅ USAR ESTRUCTURA DEL SNAPSHOT
        for area_data in self.estructura_json.get('areas', []):
            ponderacion = Decimal(area_data.get('ponderacion', 0))
            area_total = 0
            area_max = 0

            for comp_data in area_data.get('competencias', []):
                for ind_data in comp_data.get('indicadores', []):
                    # Calcular puntaje máximo desde el snapshot
                    niveles = ind_data.get('nvlindicadores', [])
                    if niveles:
                        area_max += max([n.get('puntaje', 0) for n in niveles])
                    
                    # Buscar respuesta para este indicador
                    r = respuestas.filter(indicador=ind_data['id']).first()
                    if r:
                        area_total += r.puntaje

            if area_max > 0:
                porcentaje_area = (Decimal(area_total) / Decimal(area_max)) * ponderacion
                total += porcentaje_area
                total_ponderacion += ponderacion

        self.logro_obtenido = round(total, 2)
        self.save(update_fields=['logro_obtenido'])
    
    def _calcular_logro_original(self):
        """Método original de cálculo como fallback"""
        respuestas = self.respuestas.all()
        total = Decimal(0)
        total_ponderacion = Decimal(0)

        for area in self.tipo_evaluacion.areas.all():
            ponderacion = Decimal(area.ponderacion or 0)
            area_total = 0
            area_max = 0

            for comp in area.competencias.all():
                for ind in comp.indicadores.all():
                    area_max += max([n.puntaje for n in ind.nvlindicadores.all()])
                    r = respuestas.filter(indicador=ind.id).first()

                    if r:
                        area_total += r.puntaje

            if area_max > 0:
                porcentaje_area = (Decimal(area_total) / Decimal(area_max)) * ponderacion
                total += porcentaje_area
                total_ponderacion += ponderacion

        self.logro_obtenido = round(total, 2)
        self.save(update_fields=['logro_obtenido'])

    def __str__(self):
        return f"{self.persona.get_full_name()} - {self.tipo_evaluacion.n_tipo_evaluacion}"
        
class RespuestaIndicadorJefe(models.Model):
    evaluacion = models.ForeignKey(EvaluacionJefe, on_delete=models.CASCADE, related_name='respuestas')
    indicador = models.IntegerField()  # ya no FK
    puntaje = models.PositiveSmallIntegerField()

    def __str__(self):
        return f"Indicador ID {self.indicador} - Puntaje {self.puntaje}"
