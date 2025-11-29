from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Max

class TipoEvaluacion(models.Model):
    n_tipo_evaluacion = models.CharField(max_length=255, unique=True)
    auto = models.BooleanField(default=False)
    ponderada = models.BooleanField(default=False)
    class Meta:
        verbose_name = "TipoEvaluacion"
        verbose_name_plural = "Tipo Evaluaciones"
    def __str__(self):
        return self.n_tipo_evaluacion

class AreaEvaluacion(models.Model):
    tipo_evaluacion = models.ForeignKey(TipoEvaluacion, on_delete=models.CASCADE, related_name='areas')
    n_area = models.CharField(max_length=255)
    ponderacion = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Ponderación como porcentaje (0-100)"
    )

    def __str__(self):
        return f"{self.tipo_evaluacion} - {self.n_area}"

class Competencia(models.Model):
    area = models.ForeignKey(AreaEvaluacion, on_delete=models.CASCADE, related_name='competencias')
    name = models.CharField(max_length=255)


    def __str__(self):
        return f"{self.area} - {self.name}"

class Indicador(models.Model):
    competencias = models.ForeignKey(Competencia, on_delete=models.CASCADE, related_name='indicadores')
    numero = models.IntegerField()
    indicador = models.TextField()
    definicion = models.TextField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['competencias','numero'], name='uniq_indicador_numero_por_competencia')
        ]
        ordering = ['numero']

    def aggregate_max_puntaje(self):
            val = self.nvlindicadores.aggregate(max_p=Max('puntaje'))['max_p']
            return val or 0

class NivelLogro(models.Model):
    nombre = models.CharField(max_length=255)
    indicador = models.ForeignKey(Indicador, on_delete=models.CASCADE, related_name='nvlindicadores')
    nvl = models.CharField(max_length=255)
    descripcion = models.TextField()
    puntaje = models.IntegerField()
    

    def __str__(self):
        return f"{self.indicador} - {self.nvl} ({self.puntaje} pts)"