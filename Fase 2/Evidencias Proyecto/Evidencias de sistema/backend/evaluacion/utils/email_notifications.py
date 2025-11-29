from django.template.loader import render_to_string
from django.conf import settings
from usuarios.utils.gmail_api import send_html_async
from usuarios.utils.date_utils import formatear_fecha_chile
from django.urls import reverse
import logging

logger = logging.getLogger(__name__)

def get_base_url():
    """Obtiene la URL base del frontend"""
    return getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')

def enviar_notificacion_autoevaluacion_completada(autoevaluacion):
    """
    Envía notificación al jefe cuando se completa una autoevaluación
    """
    try:
        empleado = autoevaluacion.persona
        jefe = empleado.jefe
        
        if not jefe or not jefe.email:
            logger.warning(f"No se puede enviar correo: empleado {empleado.id} no tiene jefe asignado o jefe sin email")
            return False
        
        context = {
            'jefe_nombre': jefe.get_full_name(),
            'empleado_nombre': empleado.get_full_name(),
            'tipo_evaluacion': autoevaluacion.tipo_evaluacion.n_tipo_evaluacion,
            'fecha_evaluacion': autoevaluacion.fecha_evaluacion,
            'fecha_completado': formatear_fecha_chile(autoevaluacion.fecha_ultima_modificacion),
            'puntaje_obtenido': round(autoevaluacion.logro_obtenido, 1),
            'url_evaluacion': f"{get_base_url()}/evaluacion-jefatura",
            'empresa_nombre': getattr(empleado.empresa, 'nombre', 'Sistema de Evaluaciones')
        }
        
        html = render_to_string('correos/autoevaluacion_completada.html', context)
        
        send_html_async(
            to=[jefe.email],
            subject=f"Autoevaluación completada - {empleado.get_full_name()}",
            html=html,
            from_addr=settings.GMAIL_FROM
        )
        
        logger.info(f"Correo de autoevaluación completada enviado a {jefe.email} para empleado {empleado.id}")
        return True
        
    except Exception as e:
        logger.error(f"Error enviando correo de autoevaluación completada: {str(e)}")
        return False

def enviar_notificacion_evaluacion_completada(evaluacion_jefe):
    """
    Envía notificación al empleado cuando el jefe completa la evaluación
    """
    try:
        empleado = evaluacion_jefe.persona
        jefe = evaluacion_jefe.evaluador
        
        if not empleado or not empleado.email:
            logger.warning(f"No se puede enviar correo: evaluación {evaluacion_jefe.id} sin empleado o empleado sin email")
            return False
        
        context = {
            'empleado_nombre': empleado.get_full_name(),
            'jefe_nombre': jefe.get_full_name(),
            'tipo_evaluacion': evaluacion_jefe.tipo_evaluacion.n_tipo_evaluacion,
            'fecha_evaluacion': evaluacion_jefe.fecha_evaluacion,
            'fecha_completado': formatear_fecha_chile(evaluacion_jefe.fecha_ultima_modificacion),
            'puntaje_obtenido': round(evaluacion_jefe.logro_obtenido, 1),
            'url_evaluacion': f"{get_base_url()}/autoevaluacion/jefatura",
            'empresa_nombre': getattr(empleado.empresa, 'nombre', 'Sistema de Evaluaciones')
        }
        
        html = render_to_string('correos/evaluacion_completada.html', context)
        
        send_html_async(
            to=[empleado.email],
            subject=f"Evaluación completada - Período {evaluacion_jefe.fecha_evaluacion}",
            html=html,
            from_addr=settings.GMAIL_FROM
        )
        
        logger.info(f"Correo de evaluación completada enviado a {empleado.email} para evaluación {evaluacion_jefe.id}")
        return True
        
    except Exception as e:
        logger.error(f"Error enviando correo de evaluación completada: {str(e)}")
        return False

def enviar_notificacion_retroalimentacion_completada(evaluacion_jefe):
    """
    Envía notificación a ambas partes cuando se completa la retroalimentación
    """
    try:
        empleado = evaluacion_jefe.persona
        jefe = evaluacion_jefe.evaluador
        
        if not empleado or not empleado.email or not jefe or not jefe.email:
            logger.warning(f"No se puede enviar correo: evaluación {evaluacion_jefe.id} faltan emails")
            return False
        
        base_context = {
            'empleado_nombre': empleado.get_full_name(),
            'jefe_nombre': jefe.get_full_name(),
            'tipo_evaluacion': evaluacion_jefe.tipo_evaluacion.n_tipo_evaluacion,
            'fecha_evaluacion': evaluacion_jefe.fecha_evaluacion,
            'fecha_reunion': formatear_fecha_chile(evaluacion_jefe.fecha_reunion) if evaluacion_jefe.fecha_reunion else 'No registrada',
            'empresa_nombre': getattr(empleado.empresa, 'nombre', 'Sistema de Evaluaciones')
        }
        
        html = render_to_string('correos/retroalimentacion_completada.html', base_context)
        
        # Enviar al empleado
        context_empleado = {**base_context, 'destinatario_nombre': empleado.get_full_name(), 'url_evaluacion': f"{get_base_url()}/autoevaluacion/jefatura"}
        html_empleado = render_to_string('correos/retroalimentacion_completada.html', context_empleado)
        
        send_html_async(
            to=[empleado.email],
            subject=f"Retroalimentación completada - Lista para firma",
            html=html_empleado,
            from_addr=settings.GMAIL_FROM
        )
        
        # Enviar al jefe
        context_jefe = {**base_context, 'destinatario_nombre': jefe.get_full_name(), 'url_evaluacion': f"{get_base_url()}/evaluacion-jefatura"}
        html_jefe = render_to_string('correos/retroalimentacion_completada.html', context_jefe)
        
        send_html_async(
            to=[jefe.email],
            subject=f"Retroalimentación completada - {empleado.get_full_name()}",
            html=html_jefe,
            from_addr=settings.GMAIL_FROM
        )
        
        logger.info(f"Correos de retroalimentación completada enviados para evaluación {evaluacion_jefe.id}")
        return True
        
    except Exception as e:
        logger.error(f"Error enviando correos de retroalimentación completada: {str(e)}")
        return False

def enviar_notificacion_evaluacion_finalizada(evaluacion_jefe):
    """
    Envía notificación a ambas partes cuando el empleado firma la evaluación
    """
    try:
        empleado = evaluacion_jefe.persona
        jefe = evaluacion_jefe.evaluador
        
        if not empleado or not empleado.email or not jefe or not jefe.email:
            logger.warning(f"No se puede enviar correo: evaluación {evaluacion_jefe.id} faltan emails")
            return False
        
        base_context = {
            'empleado_nombre': empleado.get_full_name(),
            'jefe_nombre': jefe.get_full_name(),
            'tipo_evaluacion': evaluacion_jefe.tipo_evaluacion.n_tipo_evaluacion,
            'fecha_evaluacion': evaluacion_jefe.fecha_evaluacion,
            'fecha_firma': formatear_fecha_chile(evaluacion_jefe.fecha_firma) if evaluacion_jefe.fecha_firma else 'No registrada',
            'puntaje_obtenido': round(evaluacion_jefe.logro_obtenido, 1),
            'empresa_nombre': getattr(empleado.empresa, 'nombre', 'Sistema de Evaluaciones')
        }
        
        # Enviar al empleado
        context_empleado = {**base_context, 'destinatario_nombre': empleado.get_full_name(), 'url_evaluacion': f"{get_base_url()}/autoevaluacion/jefatura"}
        html_empleado = render_to_string('correos/evaluacion_finalizada.html', context_empleado)
        
        send_html_async(
            to=[empleado.email],
            subject=f"Evaluación finalizada - Período {evaluacion_jefe.fecha_evaluacion}",
            html=html_empleado,
            from_addr=settings.GMAIL_FROM
        )
        
        # Enviar al jefe
        context_jefe = {**base_context, 'destinatario_nombre': jefe.get_full_name(), 'url_evaluacion': f"{get_base_url()}/evaluacion-jefatura"}
        html_jefe = render_to_string('correos/evaluacion_finalizada.html', context_jefe)
        
        send_html_async(
            to=[jefe.email],
            subject=f"Evaluación finalizada - {empleado.get_full_name()}",
            html=html_jefe,
            from_addr=settings.GMAIL_FROM
        )
        
        logger.info(f"Correos de evaluación finalizada enviados para evaluación {evaluacion_jefe.id}")
        return True
        
    except Exception as e:
        logger.error(f"Error enviando correos de evaluación finalizada: {str(e)}")
        return False

def enviar_notificacion_evaluacion_denegada(evaluacion_jefe):
    """
    Envía notificación a ambas partes cuando el empleado firma la evaluación con observaciones
    """
    try:
        empleado = evaluacion_jefe.persona
        jefe = evaluacion_jefe.evaluador
        
        if not empleado or not empleado.email or not jefe or not jefe.email:
            logger.warning(f"No se puede enviar correo: evaluación {evaluacion_jefe.id} faltan emails")
            return False
        
        base_context = {
            'empleado_nombre': empleado.get_full_name(),
            'jefe_nombre': jefe.get_full_name(),
            'tipo_evaluacion': evaluacion_jefe.tipo_evaluacion.n_tipo_evaluacion,
            'fecha_evaluacion': evaluacion_jefe.fecha_evaluacion,
            'fecha_denegacion': formatear_fecha_chile(evaluacion_jefe.fecha_firma) if evaluacion_jefe.fecha_firma else 'No registrada',
            'motivo_denegacion': evaluacion_jefe.motivo_denegacion or 'No se proporcionaron observaciones específicas',
            'puntaje_obtenido': round(evaluacion_jefe.logro_obtenido, 1),
            'empresa_nombre': getattr(empleado.empresa, 'nombre', 'Sistema de Evaluaciones')
        }
        
        # Enviar al empleado (confirmación de su firma con observaciones)
        context_empleado = {**base_context, 'destinatario_nombre': empleado.get_full_name(), 'url_evaluacion': f"{get_base_url()}/autoevaluacion/jefatura"}
        html_empleado = render_to_string('correos/evaluacion_denegada.html', context_empleado)
        
        send_html_async(
            to=[empleado.email],
            subject=f"Evaluación firmada con observaciones - Período {evaluacion_jefe.fecha_evaluacion}",
            html=html_empleado,
            from_addr=settings.GMAIL_FROM
        )
        
        # Enviar al jefe (notificación de la firma con observaciones)
        context_jefe = {**base_context, 'destinatario_nombre': jefe.get_full_name(), 'url_evaluacion': f"{get_base_url()}/evaluacion-jefatura"}
        html_jefe = render_to_string('correos/evaluacion_denegada.html', context_jefe)
        
        send_html_async(
            to=[jefe.email],
            subject=f"Evaluación firmada con observaciones por {empleado.get_full_name()}",
            html=html_jefe,
            from_addr=settings.GMAIL_FROM
        )
        
        logger.info(f"Correos de evaluación firmada con observaciones enviados para evaluación {evaluacion_jefe.id}")
        return True
        
    except Exception as e:
        logger.error(f"Error enviando correos de evaluación firmada con observaciones: {str(e)}")
        return False