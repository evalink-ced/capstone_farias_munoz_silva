from django.db import models

class Theme(models.Model):
    name = models.CharField(max_length=40)
    primary_color = models.CharField(max_length=7, help_text="Color primario en formato HEX (ej: #2563eb)")
    secondary_color = models.CharField(max_length=7, help_text="Color secundario en formato HEX")
    third_color = models.CharField(max_length=7, blank=True, null=True, help_text="Color terciario en formato HEX")
    background_from = models.CharField(max_length=7, help_text="Color inicial del degradado")
    background_to = models.CharField(max_length=7, help_text="Color final del degradado")
    background_from_dark = models.CharField(max_length=7, blank=True, null=True, help_text="Color inicial modo oscuro")
    background_to_dark = models.CharField(max_length=7, blank=True, null=True, help_text="Color final modo oscuro")
    accent_color = models.CharField(max_length=7, blank=True, null=True, help_text="Color de acento")
    modo_oscuro = models.BooleanField(default=False)

    def __str__(self):
        return self.name
    class Meta:
        verbose_name = "Tema"
        verbose_name_plural = "Temas"
        ordering = ['name']