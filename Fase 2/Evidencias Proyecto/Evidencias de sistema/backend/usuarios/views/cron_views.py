from django.http import JsonResponse, HttpResponseForbidden
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.core.management import call_command
from django.conf import settings
from django.utils import timezone
from django.core.cache import cache
from datetime import datetime
from zoneinfo import ZoneInfo
from threading import Thread
import logging
import time

logger = logging.getLogger(__name__)

def es_habil_chile(dt_utc: datetime) -> bool:
    """Verifica si es día hábil en Chile (Lunes a Viernes)"""
    dt_cl = dt_utc.astimezone(ZoneInfo("America/Santiago"))
    return dt_cl.weekday() < 5  # L-V

def _run_with_lock(job: str, ttl: int = 300):
    """Ejecuta el job con lock para evitar ejecuciones concurrentes"""
    lock_key = f"cron-lock:{job}"
    if not cache.add(lock_key, "1", timeout=ttl):
        logger.info("Cron %s: locked/skip", job)
        return False
    
    t0 = time.time()
    try:
        logger.info("Cron %s: start", job)
        call_command('solicitudes_pendientes')
        logger.info("Cron %s: done in %.2fs", job, time.time() - t0)
        return True
    except Exception as e:
        logger.exception("Cron %s: failed", job)
        return False
    finally:
        cache.delete(lock_key)
