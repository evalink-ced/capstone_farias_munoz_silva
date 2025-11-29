from django.db import models
from django.conf import settings


class Historial(models.Model):
    OPERACIONES = [
        ('CREATE', 'Creación'),
        ('UPDATE', 'Actualización'),
        ('DELETE', 'Eliminación'),
    ]

    app_name = models.CharField(max_length=100,verbose_name="app")  # Nombre de la app
    modelo_name = models.CharField(max_length=100,verbose_name="Modulo")  # Nombre del modelo afectado
    operacion = models.CharField(max_length=10, choices=OPERACIONES)  # Tipo de operación
    objeto_id = models.CharField(max_length=100)  # ID del objeto afectado
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # Cambiado para usar el modelo personalizado
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    fecha = models.DateTimeField(auto_now_add=True)  # Fecha y hora de la operación
    descripcion = models.TextField(null=True, blank=True)  # Información adicional
    

    def __str__(self):
        return f"{self.modelo_name} ({self.operacion}) - {self.objeto_id}"
    
    class Meta:
            verbose_name = "Historial"  # Nombre en singular
            verbose_name_plural = "Historial"  # Nombre en plural
