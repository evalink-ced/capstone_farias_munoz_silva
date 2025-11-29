from django.core.management.base import BaseCommand
from django.utils import timezone
from django.conf import settings
from formulario.models import Formulario, Festivo
from usuarios.utils.email_utils import enviar_email, get_base_url
import numpy as np
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Envía correos por formularios pendientes de más de 2 días hábiles usando Gmail API'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Ejecuta el comando sin enviar correos (solo muestra lo que haría)',
        )
        parser.add_argument(
            '--dias-limite',
            type=int,
            default=2,
            help='Número de días hábiles límite antes de enviar recordatorio (default: 2)',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        dias_limite = options['dias_limite']
        
        logger.info(f"Iniciando tarea programada de recordatorios (dry_run: {dry_run})...")
        
        hoy = timezone.now().date()

        # Verificar si es fin de semana
        if hoy.weekday() in [5, 6]:
            logger.info("Hoy es fin de semana. No se enviarán correos.")
            return

        # Verificar si es día festivo
        if Festivo.objects.filter(fecha=hoy).exists():
            logger.info("Hoy es un día festivo registrado. No se enviarán correos.")
            return

        # Obtener formularios pendientes
        formularios_pendientes = Formulario.objects.filter(estado="pendiente").select_related(
            'user', 'user__jefe', 'user__empresa'
        )
        
        logger.info(f"Se encontraron {formularios_pendientes.count()} formularios pendientes.")

        correos_enviados = 0
        errores = 0

        for formulario in formularios_pendientes:
            try:
                fecha_creacion = formulario.created_at.date()
                dias_transcurridos = np.busday_count(fecha_creacion, hoy)

                if dias_transcurridos > dias_limite:
                    logger.info(f"Procesando formulario ID {formulario.id} - {dias_transcurridos} días transcurridos")
                    
                    if dry_run:
                        self.stdout.write(
                            f"[DRY RUN] Se enviaría recordatorio para formulario ID {formulario.id} "
                            f"({formulario.user.get_full_name()}) - {dias_transcurridos} días"
                        )
                    else:
                        # Enviar recordatorio al jefe
                        self.enviar_recordatorio_jefe(formulario, dias_transcurridos)
                        
                        # Enviar notificación a RRHH
                        self.enviar_notificacion_rrhh(formulario, dias_transcurridos)
                        
                        correos_enviados += 1
                        
            except Exception as e:
                logger.error(f"Error procesando formulario ID {formulario.id}: {str(e)}")
                errores += 1

        if not dry_run:
            logger.info(f"Proceso completado. Correos enviados: {correos_enviados}, Errores: {errores}")
        else:
            logger.info(f"[DRY RUN] Proceso completado. Se habrían enviado {correos_enviados} recordatorios.")

    def enviar_recordatorio_jefe(self, formulario, dias_transcurridos):
        """Envía recordatorio al jefe usando el template HTML moderno"""
        user = formulario.user
        jefe = getattr(user, "jefe", None)
        
        if not jefe or not getattr(jefe, "email", None):
            logger.warning(f"El usuario {user.get_full_name()} no tiene un jefe asignado o falta el correo del jefe.")
            return

        # Determinar empresa para personalización
        empresa_nombre = getattr(user.empresa, 'nombre', 'N/A') if hasattr(user, 'empresa') else 'N/A'
        
        context = {
            'solicitante_nombre': user.get_full_name(),
            'encargado_nombre': jefe.get_full_name(),
            'fecha_solicitud': formulario.created_at.strftime('%d/%m/%Y'),
            'dias_transcurridos': dias_transcurridos,
            'empresa_nombre': empresa_nombre,
            'url': f"{get_base_url()}/formulario-pendientes",
        }

        try:
            enviar_email(
                subject=f'🚨 Recordatorio: Solicitud pendiente por {dias_transcurridos} días',
                template_name='correos/recordatorio_pendiente.html',
                context=context,
                recipient=jefe.email,
                cc=None
            )
            logger.info(f"Recordatorio enviado a {jefe.email} para formulario ID {formulario.id}")
            
        except Exception as e:
            logger.error(f"Error enviando recordatorio a {jefe.email}: {str(e)}")
            raise

    def enviar_notificacion_rrhh(self, formulario, dias_transcurridos):
        """Envía notificación a RRHH sobre el recordatorio enviado"""
        user = formulario.user
        jefe = getattr(user, "jefe", None)
        
        if not jefe:
            return

        # Lista de correos de RRHH (puedes moverlo a settings si prefieres)
        correos_rrhh = [
            'veronica.diaz@cslb.cl', 
            'aranzazu.gatica@cslb.cl',

        ]
        
        # Determinar empresa para personalización
        empresa_nombre = getattr(user.empresa, 'nombre', 'N/A') if hasattr(user, 'empresa') else 'N/A'
        
        context = {
            'solicitante_nombre': user.get_full_name(),
            'encargado_nombre': jefe.get_full_name(),
            'fecha_solicitud': formulario.created_at.strftime('%d/%m/%Y'),
            'dias_transcurridos': dias_transcurridos,
            'empresa_nombre': empresa_nombre,
        }

        try:
            # ✅ CORRECCIÓN: Enviar UN SOLO correo con todos los destinatarios de RRHH
            enviar_email(
                subject=f'📊 Notificación RRHH: Recordatorio enviado - {user.get_full_name()}',
                template_name='correos/notificacion_rrhh_pendiente.html',
                context=context,
                recipient=correos_rrhh[0],  # Primer destinatario como principal
                cc=correos_rrhh[1:]  # Resto como CC
            )
            
            logger.info(f"Notificación RRHH enviada para formulario ID {formulario.id} a {len(correos_rrhh)} destinatarios")
            
        except Exception as e:
            logger.error(f"Error enviando notificación a RRHH: {str(e)}")
            # No re-lanzamos la excepción aquí para que no afecte el envío del recordatorio principal


