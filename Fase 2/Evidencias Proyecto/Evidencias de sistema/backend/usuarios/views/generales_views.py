from django.shortcuts import render
from django.contrib.auth.decorators import login_required

def email_domain_error(request):
    context = {
        'error_message': 'El dominio de tu correo electrónico no está permitido.',
        'allowed_domains': ['cslb.cl', 'colegioenriquealvear.cl']
    }
    return render(request, 'usuarios/email_domain_error.html', context)


def profile(request):
    return render(request, 'account/profile.html')

def solicitar_acceso(request):
    return render(request, 'usuarios/solicitar_acceso.html', {
        'mensaje': "Tu cuenta aún no ha sido activada. Solicita acceso en Recursos Humanos."
    })