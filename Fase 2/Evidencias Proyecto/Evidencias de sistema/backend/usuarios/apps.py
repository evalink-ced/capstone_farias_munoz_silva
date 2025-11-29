from django.apps import AppConfig
from importlib import import_module


class UsuariosConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'usuarios'

    def ready(self):
        try:
            import_module('usuarios.signals')
        except Exception:
            pass
