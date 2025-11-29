import pytest
from django.test import RequestFactory
from django.urls import reverse
from allauth.socialaccount.models import SocialLogin, SocialAccount
from allauth.core.exceptions import ImmediateHttpResponse
from usuarios.adapters.social_adapters import MySocialAccountAdapter  # Asegúrate que el path es correcto
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
def test_pre_social_login_with_invalid_domain(monkeypatch):
    adapter = MySocialAccountAdapter()
    request = RequestFactory().get('/accounts/google/login/callback/')

    # Simula login con dominio no permitido
    sociallogin = SocialLogin(account=SocialAccount(provider='google'))
    sociallogin.account.extra_data = {
        'email': 'usuario@dominioinvalido.com'
    }

    with pytest.raises(ImmediateHttpResponse) as excinfo:
        adapter.pre_social_login(request, sociallogin)

    assert excinfo.value.response.status_code == 302
    assert reverse('email_domain_error') in excinfo.value.response.url


@pytest.mark.django_db
def test_pre_social_login_conecta_usuario_existente(monkeypatch):
    adapter = MySocialAccountAdapter()
    request = RequestFactory().get('/accounts/google/login/callback/')

    # Crea un usuario previamente en la base
    email_valido = 'usuario@cslb.cl'
    user = User.objects.create_user(username='usuario', email=email_valido, password='123456')

    # Simula social login con ese mismo correo
    sociallogin = SocialLogin(account=SocialAccount(provider='google'))
    sociallogin.account.extra_data = {
        'email': email_valido
    }

    llamado = {}

    def fake_connect(request, user):
        llamado['conectado'] = True

    monkeypatch.setattr(sociallogin, 'connect', fake_connect)

    adapter.pre_social_login(request, sociallogin)

    assert llamado.get('conectado') is True


@pytest.mark.django_db
def test_pre_social_login_redirige_si_usuario_no_existe(monkeypatch):
    adapter = MySocialAccountAdapter()
    request = RequestFactory().get('/accounts/google/login/callback/')

    # Email válido pero usuario NO existe en la base
    email = 'nuevo.usuario@cslb.cl'

    sociallogin = SocialLogin(account=SocialAccount(provider='google'))
    sociallogin.account.extra_data = {'email': email}

    def fake_connect(request, user):
        raise AssertionError("No se debe llamar connect() si el usuario no existe")

    monkeypatch.setattr(sociallogin, 'connect', fake_connect)

    with pytest.raises(ImmediateHttpResponse) as excinfo:
        adapter.pre_social_login(request, sociallogin)

    assert excinfo.value.response.status_code == 302
    assert reverse('solicitar_acceso') in excinfo.value.response.url
