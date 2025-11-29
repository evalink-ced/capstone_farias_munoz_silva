from django.core.mail import send_mail
from django.utils import timezone
from formulario.models import Formulario
from django.conf import settings

def notificar_formularios_pendientes_mas_de_2_dias(encargado_email):
    subject = 'Solicitud pendiente por más de 2 días'
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [encargado_email, "veronica.diaz@cslb.cl", "aranzazu.gatica@cslb.cl"]

    formularios = Formulario.objects.filter(estado="pendiente")
    for formulario in formularios:
        if (timezone.now() - formulario.created_at).days > 2:
            message = f"La solicitud de {formulario.user.email} está pendiente por más de 2 días."
            send_mail(subject, message, email_from, recipient_list)
