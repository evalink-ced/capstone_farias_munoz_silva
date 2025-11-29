import logging
from django.template.loader import render_to_string
from django.conf import settings
from django.contrib.auth import get_user_model
from usuarios.utils.gmail_api import send_html_async
from asgiref.sync import sync_to_async
import asyncio
from typing import List

User = get_user_model()
logger = logging.getLogger(__name__)

def get_base_url():
    """Obtiene la URL base del frontend"""
    return getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')

def enviar_notificacion_autoevaluacion_asignada(persona, evaluacion_asignada):
    """Envía notificación por email cuando se asigna una autoevaluación"""
    try:
        if not persona.email:
            logger.warning(f"Usuario {persona.username} no tiene email configurado")
            return False
            
        context = {
            'nombre_completo': persona.get_full_name() or persona.username,
            'tipo_evaluacion': evaluacion_asignada.tipo_evaluacion.n_tipo_evaluacion,
            'fecha_evaluacion': evaluacion_asignada.fecha_evaluacion,
            'url_autoevaluacion': f"{get_base_url()}/autoevaluacion/inicio",
        }
        
        html_content = render_to_string('correos/autoevaluacion_asignada.html', context)
        
        send_html_async(
            to=[persona.email],
            subject=f'Nueva Autoevaluación Asignada - {evaluacion_asignada.tipo_evaluacion.n_tipo_evaluacion}',
            html=html_content,
            from_addr=settings.GMAIL_FROM
        )
        
        logger.info(f"Notificación de autoevaluación enviada a {persona.email}")
        return True
        
    except Exception as e:
        logger.error(f"Error enviando notificación de autoevaluación a {persona.email}: {str(e)}")
        return False

def enviar_notificacion_evaluacion_asignada_jefe(jefe, evaluaciones_asignadas):
    """Envía notificación por email cuando se asignan evaluaciones a un jefe"""
    try:
        if not jefe.email:
            logger.warning(f"Jefe {jefe.username} no tiene email configurado")
            return False
            
        # Agrupar evaluaciones por tipo
        evaluaciones_por_tipo = {}
        total_evaluaciones = 0
        
        for eval_asignada in evaluaciones_asignadas:
            tipo_nombre = eval_asignada.tipo_evaluacion.n_tipo_evaluacion
            if tipo_nombre not in evaluaciones_por_tipo:
                evaluaciones_por_tipo[tipo_nombre] = []
            evaluaciones_por_tipo[tipo_nombre].append(eval_asignada)
            total_evaluaciones += 1
            
        context = {
            'nombre_completo': jefe.get_full_name() or jefe.username,
            'evaluaciones_por_tipo': evaluaciones_por_tipo,
            'total_evaluaciones': total_evaluaciones,
            'url_evaluacion_jefe': f"{get_base_url()}/evaluacion-jefatura",
        }
        
        html_content = render_to_string('correos/evaluacion_asignada_jefe.html', context)
        
        send_html_async(
            to=[jefe.email],
            subject=f'Nuevas Evaluaciones Asignadas - {total_evaluaciones} evaluaciones',
            html=html_content,
            from_addr=settings.GMAIL_FROM
        )
        
        logger.info(f"Notificación de evaluaciones asignadas enviada a {jefe.email}")
        return True
        
    except Exception as e:
        logger.error(f"Error enviando notificación de evaluaciones a {jefe.email}: {str(e)}")
        return False

def enviar_notificaciones_masivas_autoevaluacion(evaluacion_asignada):
    """Envía notificaciones masivas a todos los trabajadores asignados"""
    personas_notificadas = 0
    personas_fallidas = 0
    
    for persona in evaluacion_asignada.personas_asignadas.all():
        if enviar_notificacion_autoevaluacion_asignada(persona, evaluacion_asignada):
            personas_notificadas += 1
        else:
            personas_fallidas += 1
    
    logger.info(f"Notificaciones de autoevaluación: {personas_notificadas} enviadas, {personas_fallidas} fallidas")
    return personas_notificadas, personas_fallidas

def enviar_notificaciones_masivas_evaluacion_jefe(jefe_evaluacion_asignada):
    """Envía notificaciones masivas a los jefes sobre evaluaciones asignadas"""
    # Agrupar por evaluador (jefe)
    evaluaciones_por_jefe = {}
    
    for detalle in jefe_evaluacion_asignada.detalles.all():
        jefe = detalle.evaluador
        if jefe not in evaluaciones_por_jefe:
            evaluaciones_por_jefe[jefe] = []
        evaluaciones_por_jefe[jefe].append(detalle)
    
    jefes_notificados = 0
    jefes_fallidos = 0
    
    for jefe, evaluaciones in evaluaciones_por_jefe.items():
        if enviar_notificacion_evaluacion_asignada_jefe(jefe, evaluaciones):
            jefes_notificados += 1
        else:
            jefes_fallidos += 1
    
    logger.info(f"Notificaciones a jefes: {jefes_notificados} enviadas, {jefes_fallidos} fallidas")
    return jefes_notificados, jefes_fallidos