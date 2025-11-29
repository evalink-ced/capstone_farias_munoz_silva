from django.core.management.base import BaseCommand
from evaluacion.models import RespuestaIndicador, Indicador

class Command(BaseCommand):
    help = 'Limpia respuestas que referencian indicadores inexistentes'
    
    def handle(self, *args, **options):
        # Obtener IDs de indicadores válidos
        indicadores_validos = set(Indicador.objects.values_list('id', flat=True))
        
        # Encontrar respuestas huérfanas
        respuestas_huerfanas = RespuestaIndicador.objects.exclude(
            indicador__in=indicadores_validos
        )
        
        count = respuestas_huerfanas.count()
        if count > 0:
            respuestas_huerfanas.delete()
            self.stdout.write(
                self.style.SUCCESS(f'Eliminadas {count} respuestas huérfanas')
            )
        else:
            self.stdout.write('No se encontraron respuestas huérfanas')