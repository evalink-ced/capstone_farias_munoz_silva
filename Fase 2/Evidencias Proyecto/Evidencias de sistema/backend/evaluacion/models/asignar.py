# models.py
from django.db import models
from django.conf import settings
from evaluacion.models import TipoEvaluacion

class EvaluacionAsignada(models.Model):
    tipo_evaluacion = models.ForeignKey(TipoEvaluacion, on_delete=models.CASCADE, related_name="asignaciones")
    auto_tipo_evaluacion = models.ForeignKey(
        'evaluacion.TipoEvaluacion',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='asignaciones_auto_pareadas'
    )
    fecha_evaluacion = models.CharField(
    max_length=7,
    verbose_name="Mes y Año de Auto Evaluación",
    help_text="Formato: MM-AAAA (ejemplo: 06-2025)"
)
    personas_asignadas = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="auto_evaluaciones")

    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Auto Evaluación {self.tipo_evaluacion.n_tipo_evaluacion} - {self.fecha_evaluacion}"
    class Meta:
        verbose_name = "Asignación Auto Evaluación"
        verbose_name_plural = "Asignaciones Auto Evaluaciones"
        ordering = ["-fecha_creacion"]



# models.py
class JefeEvaluacionAsignada(models.Model):
    tipo_evaluacion = models.ForeignKey(TipoEvaluacion, on_delete=models.CASCADE)
    fecha_evaluacion = models.CharField(max_length=7)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Asignación Evaluación"
        verbose_name_plural = "Asignaciones Evaluaciones"
        ordering = ["-fecha_creacion"]


class JefeEvaluacionAsignadaDetalle(models.Model):
    asignacion = models.ForeignKey(
        'evaluacion.JefeEvaluacionAsignada',
        on_delete=models.CASCADE,
        related_name='detalles',
    )
    persona = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='jefe_eval_persona'
    )
    evaluador = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='jefe_eval_evaluador'
    )

    class Meta:
        # Un mismo colaborador no puede tener 2 registros en la misma asignación de jefatura
        constraints = [
            models.UniqueConstraint(
                fields=['asignacion', 'persona'],
                name='uniq_jefe_asignacion_persona'
            ),
            # opcional: impedir que alguien se evalúe a sí mismo
            models.CheckConstraint(
                check=~models.Q(persona=models.F('evaluador')),
                name='chk_persona_distinta_de_evaluador'
            ),
        ]
        indexes = [
            models.Index(fields=['asignacion', 'persona']),
            models.Index(fields=['evaluador']),
        ]
        ordering = ['asignacion_id', 'persona_id']

    def __str__(self):
        return f"Asig {self.asignacion_id} | persona={self.persona_id} → evaluador={self.evaluador_id}"

    # ---------- Helpers útiles para el ViewSet mixto ----------

    @property
    def periodo(self) -> str:
        """MM-AAAA"""
        return self.asignacion.fecha_evaluacion

    def find_auto_asignacion(self):
        """
        Busca la EvaluacionAsignada (auto) pareada para esta persona y periodo,
        según el tipo de jefatura definido en la asignación.
        """
        return (EvaluacionAsignada.objects
                .filter(
                    auto_tipo_evaluacion=self.asignacion.tipo_evaluacion,  # tipo de jefatura pareado
                    fecha_evaluacion=self.asignacion.fecha_evaluacion,
                    personas_asignadas=self.persona
                )
                .select_related('tipo_evaluacion')
                .first())