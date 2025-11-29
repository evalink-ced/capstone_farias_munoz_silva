from django.core.management.base import BaseCommand
from evaluacion.models import EvaluacionJefe
from django.utils import timezone

class Command(BaseCommand):
    help = 'Migra evaluaciones de jefe existentes para crear snapshots de estructura'

    def handle(self, *args, **options):
        evaluaciones_sin_snapshot = EvaluacionJefe.objects.filter(
            estructura_json__isnull=True
        )
        
        count = 0
        for evaluacion in evaluaciones_sin_snapshot:
            try:
                evaluacion.crear_snapshot_estructura()
                evaluacion.save(update_fields=['estructura_json', 'version_plantilla'])
                count += 1
                self.stdout.write(f"✅ Migrada evaluación jefe ID {evaluacion.id}")
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"❌ Error en evaluación jefe ID {evaluacion.id}: {e}")
                )
        
        self.stdout.write(
            self.style.SUCCESS(f"✅ Migradas {count} evaluaciones de jefe exitosamente")
        )