from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from django.utils import timezone

class Autoevaluacion(models.Model):
    persona = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='autoevaluaciones',
        null=True, blank=True
    )
    tipo_evaluacion = models.ForeignKey('evaluacion.TipoEvaluacion', on_delete=models.CASCADE)
    fecha_evaluacion = models.CharField(max_length=7)  # MM-AAAA
    fecha_inicio = models.DateTimeField(auto_now_add=True)
    fecha_ultima_modificacion = models.DateTimeField(auto_now=True)
    completado = models.BooleanField(default=False)
    text_destacar = models.TextField(blank=True, null=True)
    text_mejorar = models.TextField(blank=True, null=True)
    logro_obtenido = models.DecimalField(default=0, max_digits=5, decimal_places=2)
    ponderada = models.BooleanField(default=False)
    estructura_json = models.JSONField(null=True, blank=True)
    version_plantilla = models.CharField(max_length=50, null=True, blank=True)
    
    def save(self, *args, **kwargs):
        # Detectar si se está completando la autoevaluación
        is_completing = False
        if self.pk:
            old_instance = Autoevaluacion.objects.get(pk=self.pk)
            is_completing = not old_instance.completado and self.completado
        
        # Crear snapshot inmutable al crear la evaluación
        if not self.pk and not self.estructura_json:
            self.crear_snapshot_estructura()
            
        super().save(*args, **kwargs)
        
        # Enviar notificación si se completó la autoevaluación
        if is_completing:
            from evaluacion.utils.email_notifications import enviar_notificacion_autoevaluacion_completada
            enviar_notificacion_autoevaluacion_completada(self)
    
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
    
    class Meta:
        ordering = ['-fecha_inicio']
        constraints = [
            models.UniqueConstraint(
                fields=['persona', 'tipo_evaluacion', 'fecha_evaluacion'], 
                name='uniq_auto_persona_tipo_fecha'
            )
        ]
    
    def save_estructura_snapshot(self):
        """Guarda snapshot de la estructura al crear/finalizar evaluación"""
        if not self.estructura_json and self.tipo_evaluacion:
            from evaluacion.serializers.tipo_evaluacion_read import TipoEvaluacionParaAutoevaluacionSerializer
            self.estructura_json = TipoEvaluacionParaAutoevaluacionSerializer(self.tipo_evaluacion).data
            self.save(update_fields=['estructura_json'])
    
    def calcular_logro(self):
        """Calcula logro usando SOLO la estructura guardada en JSON"""
        if not self.estructura_json:
            # Fallback para evaluaciones antiguas
            self.crear_snapshot_estructura()
            self.save(update_fields=['estructura_json', 'version_plantilla'])
        
        respuestas = self.respuestas.all()
        total = Decimal(0)
        total_ponderacion = Decimal(0)
        
        # Usar estructura del snapshot, NO de la plantilla actual
        for area_data in self.estructura_json.get('areas', []):
            ponderacion = Decimal(area_data.get('ponderacion', 0))
            area_total = 0
            area_max = 0
            
            for comp_data in area_data.get('competencias', []):
                for ind_data in comp_data.get('indicadores', []):
                    ind_id = ind_data['id']
                    
                    # Obtener puntaje máximo del snapshot
                    niveles = ind_data.get('nvlindicadores', [])
                    if niveles:
                        area_max += max([n['puntaje'] for n in niveles])
                    
                    # Buscar respuesta para este indicador
                    respuesta = respuestas.filter(indicador=ind_id).first()
                    if respuesta:
                        area_total += respuesta.puntaje
            
            if area_max > 0:
                porcentaje_area = (Decimal(area_total) / Decimal(area_max)) * ponderacion
                total += porcentaje_area
                total_ponderacion += ponderacion
        
        self.logro_obtenido = round(total, 2)
        self.save(update_fields=['logro_obtenido'])
    
    def __str__(self):
        return f"{self.persona.get_full_name() if self.persona else 'Sin persona'} - {self.tipo_evaluacion.n_tipo_evaluacion}"
            
class RespuestaIndicador(models.Model):
    autoevaluacion = models.ForeignKey(Autoevaluacion, on_delete=models.CASCADE, related_name='respuestas')
    indicador = models.IntegerField()  # ID del indicador, no FK para evitar CASCADE
    puntaje = models.PositiveSmallIntegerField()
    fecha_respuesta = models.DateTimeField(auto_now=True)
    metadata_json = models.JSONField(default=dict, blank=True)
    
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['autoevaluacion', 'indicador'], 
                name='uniq_autoeval_indicador'
            )
        ]
    
    def __str__(self):
        return f"Indicador ID {self.indicador} - Puntaje {self.puntaje}"
