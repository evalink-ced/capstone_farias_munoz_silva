from django.core.management.base import BaseCommand
from usuarios.tasks.calcular_tiempo_en_empresa import actualizar_tiempos, actualizar_grupo_usuarios
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = "Actualiza el tiempo en empresa y cambia de grupo a los usuarios si corresponde"

    def handle(self, *args, **kwargs):
        logger.info("📅 Ejecutando actualización diaria de tiempos en empresa y grupos...")
        actualizar_tiempos()
        actualizar_grupo_usuarios()
        logger.info("✅ Proceso de actualización diario finalizado.")
        logger.info("Los tiempos en empresa y grupos de usuarios han sido actualizados correctamente.")