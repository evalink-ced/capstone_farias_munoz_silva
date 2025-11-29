from django.db import models

class Cargo(models.Model):
    cargo = models.CharField(max_length=50)
    descripcion = models.CharField(max_length=150, blank=True, null=True)

    def __str__(self):
        return self.cargo



class Ciclo(models.Model):
    ciclo = models.CharField(max_length=30)

    def __str__(self):
        return self.ciclo


class Genero(models.Model):
    genero = models.CharField(max_length=30)

    def __str__(self):
        return self.genero