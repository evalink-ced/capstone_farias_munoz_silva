from django.core.management.base import BaseCommand
from institucion.models import Empresa, Asignacion, EmpresaPersonaConfig
from institucion.models import AsignacionTrabajador, ContratoServicio
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Verifica que la migración de datos esté completa'

    def handle(self, *args, **options):
        # Verificar asignaciones antiguas vs nuevas
        asignaciones_antiguas = Asignacion.objects.filter(
            fecha_inicio__lte=timezone.localdate()
        ).filter(
            Q(fecha_fin__isnull=True) | Q(fecha_fin__gte=timezone.localdate())
        ).count()
        
        asignaciones_nuevas = AsignacionTrabajador.objects.filter(activa=True).count()
        
        self.stdout.write(f"Asignaciones antiguas activas: {asignaciones_antiguas}")
        self.stdout.write(f"Asignaciones nuevas activas: {asignaciones_nuevas}")
        
        # Verificar usuarios con empresa vs asignaciones nuevas
        usuarios_con_empresa = User.objects.filter(empresa__isnull=False).count()
        usuarios_con_asignaciones_nuevas = User.objects.filter(asignaciones_nuevas__activa=True).distinct().count()
        
        self.stdout.write(f"Usuarios con empresa (campo deprecado): {usuarios_con_empresa}")
        self.stdout.write(f"Usuarios con asignaciones nuevas: {usuarios_con_asignaciones_nuevas}")
        
        if asignaciones_antiguas == asignaciones_nuevas:
            self.stdout.write(self.style.SUCCESS("✓ Migración de asignaciones completa"))
        else:
            self.stdout.write(self.style.WARNING("⚠ Diferencia en número de asignaciones"))