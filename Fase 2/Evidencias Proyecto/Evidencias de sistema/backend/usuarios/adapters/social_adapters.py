# adapters.py
import logging
from django.conf import settings
from django.http import HttpResponseRedirect
from django.urls import reverse
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.core.exceptions import ImmediateHttpResponse
from django.contrib.auth import get_user_model

User = get_user_model()
logger = logging.getLogger(__name__)

class MySocialAccountAdapter(DefaultSocialAccountAdapter):
    ALLOWED_DOMAINS = ["cslb.cl", "colegioenriquealvear.cl"]

    def is_open_for_signup(self):
        return False  # No se permite crear cuentas nuevas por redes sociales

    def pre_social_login(self, request, sociallogin):
        logger.info("Inicio de pre_social_login")

        if sociallogin.is_existing:
            return

        if sociallogin.account.provider != "google":
            return

        email = sociallogin.account.extra_data.get('email')
        if not email or '@' not in email:
            logger.warning("Correo no válido o no presente")
            return

        try:
            user = User.objects.get(email=email)
            sociallogin.connect(request, user)
            logger.info("Conectado a usuario existente: %s", user.email)
        except User.DoesNotExist:
            domain = email.split('@')[-1].lower()
            if domain not in self.ALLOWED_DOMAINS:
                logger.warning(f"Dominio no permitido: {domain}")
                raise ImmediateHttpResponse(
                    HttpResponseRedirect(f"{settings.FRONTEND_URL}login?error=invalid_domain")
                )
            logger.warning("El correo es válido pero no está registrado: %s", email)
            raise ImmediateHttpResponse(
                HttpResponseRedirect(f"{settings.FRONTEND_URL}login?error=no_registered")
            )

            
            
    def save_token(self, request, sociallogin, token):
        print(">>> save_token() ejecutado – token no será guardado")
    
