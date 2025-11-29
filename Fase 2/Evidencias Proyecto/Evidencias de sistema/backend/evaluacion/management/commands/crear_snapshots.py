from django.core.management.base import BaseCommand
from evaluacion.models import Autoevaluacion

class Command(BaseCommand):
    help = 'Crea snapshots para evaluaciones existentes sin estructura_json'
    
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
                self.stdout.write(f"✅ Snapshot creado para evaluación {evaluacion.id}")
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"❌ Error en evaluación {evaluacion.id}: {e}")
                )
        
        self.stdout.write(
            self.style.SUCCESS(f"🎉 Snapshots creados para {count} evaluaciones")
        )