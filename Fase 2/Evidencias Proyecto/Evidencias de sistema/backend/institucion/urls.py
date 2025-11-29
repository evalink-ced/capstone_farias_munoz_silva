from django.urls import path
from institucion.views import EmpresaUsuarioView
from institucion.api.api import EmpresaAllView
urlpatterns = [
    path('empresa/get/empresa/', EmpresaUsuarioView.as_view(), name='mi-empresa'),
    path('empresa/get/all/', EmpresaAllView.as_view(), name='todas-empresas'),
]