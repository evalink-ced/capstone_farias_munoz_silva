from datetime import date, datetime
from django.utils.dateparse import parse_date
from django.core.exceptions import ValidationError
from django.db.models import Q  # lo usas en asignaciones_activas
from django.utils import timezone
from zoneinfo import ZoneInfo

def _as_date(value):
    """Devuelve datetime.date o None desde date/datetime/str; lanza si no parsea."""
    if value is None:
        return None
    if isinstance(value, date) and not isinstance(value, datetime):
        return value
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, str):
        d = parse_date(value)  # soporta 'YYYY-MM-DD'
        if d:
            return d
        # si tienes otros formatos legados, agrégalos aquí
    raise ValidationError(f"Fecha inválida: {value!r}")

def formatear_fecha_chile(fecha_datetime, formato='%d/%m/%Y %H:%M'):
    """
    Convierte un datetime UTC a hora de Chile y lo formatea.
    Maneja automáticamente el horario de verano chileno (CLST/CLT).
    
    Args:
        fecha_datetime: datetime object (preferiblemente UTC)
        formato: string con formato de fecha
    
    Returns:
        string con la fecha formateada en hora de Chile
    """
    if fecha_datetime is None:
        return 'No registrada'
    
    # Si no tiene timezone info, asumimos que es UTC
    if fecha_datetime.tzinfo is None:
        fecha_datetime = timezone.make_aware(fecha_datetime, timezone.utc)
    
    # Convertir a zona horaria de Chile
    chile_tz = ZoneInfo('America/Santiago')
    fecha_chile = fecha_datetime.astimezone(chile_tz)
    
    return fecha_chile.strftime(formato)

def formatear_fecha_chile_corta(fecha_datetime):
    """
    Convierte un datetime UTC a hora de Chile con formato corto (solo fecha).
    
    Args:
        fecha_datetime: datetime object
    
    Returns:
        string con formato 'DD/MM/YYYY'
    """
    return formatear_fecha_chile(fecha_datetime, '%d/%m/%Y')

def obtener_fecha_actual_chile():
    """
    Obtiene la fecha y hora actual en zona horaria de Chile.
    
    Returns:
        datetime object en zona horaria de Chile
    """
    chile_tz = ZoneInfo('America/Santiago')
    return datetime.now(chile_tz)

def formatear_fecha_actual_chile(formato='%d/%m/%Y %H:%M'):
    """
    Obtiene la fecha y hora actual en Chile formateada.
    
    Args:
        formato: string con formato de fecha
    
    Returns:
        string con la fecha actual formateada en hora de Chile
    """
    return obtener_fecha_actual_chile().strftime(formato)

def debug_timezone_info():
    """
    Función de debug para verificar la información de timezone.
    """
    import logging
    logger = logging.getLogger(__name__)
    
    chile_tz = ZoneInfo('America/Santiago')
    ahora_utc = datetime.now(timezone.utc)
    ahora_chile = ahora_utc.astimezone(chile_tz)
    
    logger.info(f"UTC: {ahora_utc}")
    logger.info(f"Chile: {ahora_chile}")
    logger.info(f"Offset: {ahora_chile.utcoffset()}")
    logger.info(f"DST: {ahora_chile.dst()}")
    logger.info(f"Timezone name: {ahora_chile.tzname()}")
    
    return {
        'utc': ahora_utc,
        'chile': ahora_chile,
        'offset': ahora_chile.utcoffset(),
        'dst': ahora_chile.dst(),
        'tzname': ahora_chile.tzname()
    }