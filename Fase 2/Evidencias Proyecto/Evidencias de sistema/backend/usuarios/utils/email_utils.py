from django.template.loader import render_to_string
from django.utils.html import strip_tags  # opcional si quieres el plain
from django.conf import settings
from django.contrib import messages
from usuarios.utils.gmail_api import send_html_async
from usuarios.utils.date_utils import formatear_fecha_chile

HTML_CONTENT_TYPE = "text/html"
def get_base_url():
    """Obtiene la URL base del frontend"""
    return getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')


def enviar_email(subject, template_name, context, recipient, cc=None):
    html = render_to_string(template_name, context or {})
    send_html_async(
        to=[recipient],
        subject=subject,
        html=html,
        cc=cc or [],
        reply_to=None,                                  # opcional
        from_addr=settings.GMAIL_FROM,                  # ej: "Día Administrativo <dias_administrativos@cslb.cl>"
    )

def enviar_correo_solicitud_pendiente_rrhh(request):
    observacion = (request.data.get("observacion") or "").strip()
    encargado = request.data.get("encargado")
    username = request.data.get("email")
    html = render_to_string(
        "correos/solicitud_pendiente_RRHH.html",
        {"observacion": observacion, "username": username},
    )
    try:
        send_html_async(
            to=[encargado],
            subject="2 Solicitudes mismo día",
            html=html,
            cc=["veronica.diaz@colegioenriquealvear.cl"],
            from_addr=settings.GMAIL_FROM,
        )
        messages.success(request, f"Solicitud enviada con éxito a {encargado}")
    except Exception as e:
        messages.error(request, f"Error al enviar el correo: {e}")

def enviar_correo_solicitud_pendiente(request):
    observacion = (request.data.get("observacion") or "").strip()
    encargado = request.data.get("encargado")
    html = render_to_string("correos/solicitud_pendiente.html", {"observacion": observacion})

    try:
        send_html_async(
            to=[encargado],
            subject="Nueva solicitud recibida",
            html=html,
            cc=["veronica.diaz@colegioenriquealvear.cl", "aranzazu.gatica@colegioenriquealvear.cl"],
            from_addr=settings.GMAIL_FROM,
        )
        messages.success(request, f"Solicitud enviada con éxito a {encargado}")
    except Exception as e:
        messages.error(request, f"Error al enviar el correo: {e}")

def enviar_correo_solicitud(request):
    user = request.user
    jefe = getattr(user, "jefe", None)
    if not jefe or not getattr(jefe, "email", None):
        print("⚠️ El usuario no tiene un jefe asignado o falta el correo del jefe.")
        return

    template = "correos/solicitud_cslb.html" if getattr(user.empresa, "id", None) in [1, 3] else "correos/solicitud_cea.html"
    ctx = {
        "observacion": (request.data.get("observacion") or "").strip(),
        "usuario": user.get_full_name(),
        "jefe": jefe.get_full_name(),
        "fecha": request.data.get("fecha", ""),
        "hora_ingreso": request.data.get("hora_ingreso", ""),
        "hora_regreso": request.data.get("hora_regreso", ""),
        "url": f"{get_base_url()}/formulario-pendientes",
    }
    html = render_to_string(template, ctx)

    send_html_async(
        to=[jefe.email],
        subject="Nueva solicitud recibida",
        html=html,
        reply_to="dias_administrativos@cslb.cl",  # opcional
        from_addr=settings.GMAIL_FROM,
    )
    print(f"📬 Gmail API: encolado para {jefe.email}")
