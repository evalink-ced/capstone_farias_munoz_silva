from datetime import datetime
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

from usuarios.models import User
from usuarios.tasks.utilidades_fechas import calcular_fecha_habiles
from usuarios.tasks.notificaciones import enviar_recordatorio_usuario


def enviar_recordatorio_beneficio_habiles(semestre, dias_para_expiracion=7):
    fecha_actual = datetime.now().date()

    if semestre == 'primer':
        meses_inicio, meses_fin = 1, 6
        fecha_limite = datetime(fecha_actual.year, 6, 30).date()
    elif semestre == 'segundo':
        meses_inicio, meses_fin = 7, 12
        fecha_limite = datetime(fecha_actual.year, 12, 31).date()
    else:
        raise ImproperlyConfigured("El parámetro semestre debe ser 'primer' o 'segundo'.")

    fecha_aviso = calcular_fecha_habiles(fecha_limite, dias_para_expiracion)

    if fecha_actual >= fecha_aviso:
        usuarios = User.objects.filter(
            birthday__month__gte=meses_inicio,
            birthday__month__lte=meses_fin
        )

        for usuario in usuarios:
            try:
                enviar_recordatorio_usuario(usuario, semestre, fecha_limite)
                print(f"Recordatorio enviado con éxito a: {usuario.email}")
            except Exception as e:
                print(f"Error al enviar el correo a {usuario.email}: {e}")
