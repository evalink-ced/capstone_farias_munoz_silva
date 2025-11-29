"""
Choices y constantes para el modelo User
"""
from django.db import models


class TipoContrato(models.TextChoices):
    """Tipos de contrato disponibles para usuarios"""
    INDEFINIDO = "INDEF", "Indefinido"
    PLAZO_FIJO = "PLAZO", "Plazo fijo"


# Constantes del modelo User
DEFAULT_PASSWORD = "1320"
DEFAULT_DIAS_RESTANTES = 2
DEFAULT_DIAS_CUMPLEANIOS = 1
DEFAULT_GROUP_NAME = 'Básico'

# Configuración de imagen
FOTO_UPLOAD_PATH = 'foto/'
THUMBNAIL_SIZE = (100, 100)
THUMBNAIL_QUALITY = 100