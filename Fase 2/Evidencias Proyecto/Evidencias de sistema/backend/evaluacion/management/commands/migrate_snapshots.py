from django.core.management.base import BaseCommand
from evaluacion.models import Autoevaluacion
from django.utils import timezone

class Command(BaseCommand):
    help = 'Migra evaluaciones existentes para crear snapshots de estructura'

    def handle(self, *args, **options):
        evaluaciones_sin_snapshot = Autoevaluacion.objects.filter(
            estructura_json__isnull=True
        )
        
        count = 0
        for evaluacion in evaluaciones_sin_snapshot:
            try:
                evaluacion.crear_snapshot_estructura()
                evaluacion.save(update_fields=['estructura_json', 'version_plantilla'])
                count += 1
                self.stdout.write(f"✅ Migrada evaluación ID {evaluacion.id}")
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"❌ Error en evaluación ID {evaluacion.id}: {e}")
                )
        
        self.stdout.write(
            self.style.SUCCESS(f"✅ Migradas {count} evaluaciones exitosamente")
        )