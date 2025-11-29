from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

def enviar_recordatorio_usuario(usuario, semestre, fecha_limite):
    html_message = render_to_string(
        'correos/expira_cum.html',
        {'usuario': usuario, 'semestre': semestre, 'fecha_limite': fecha_limite}
    )
    plain_message = strip_tags(html_message)

    message = EmailMultiAlternatives(
        subject=f"Recordatorio: Tu beneficio de cumpleaños está por expirar ({semestre.capitalize()} semestre)",
        body=plain_message,
        from_email=f"Beneficios <{settings.EMAIL_HOST_USER}>",
        to=[usuario.email],
    )
    message.attach_alternative(html_message, "text/html")
    message.send()
