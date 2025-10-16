from django.urls import path, include
from usuarios.views import (
email_domain_error,solicitar_acceso,UsuarioActualAPIView
)
from rest_framework.routers import DefaultRouter
from usuarios.views.cron_views import ejecutar_recordatorios_pendientes



from .api.api import UserProfileView, UserAllView, UserDetailView
from rest_framework_simplejwt.views import TokenRefreshView
from usuarios.views import (
     CicloViewSet)

router = DefaultRouter()
router.register(r'ciclos', CicloViewSet)


urlpatterns = [

     path('proyecto/api/', include(router.urls)),

     path('email-domain-error/', email_domain_error, name='email_domain_error'),  # Error de dominio template

     path('solicitar-acceso/', solicitar_acceso, name='solicitar_acceso'),


     #api implementadas
     path('proyecto/api/user/', UserProfileView.as_view(), name='user-profile'),
     path('proyecto/api/user-all/', UserAllView.as_view(), name='user-all'),
     path('proyecto/api/user/<int:user_id>/', UserDetailView.as_view(), name='user-detail'),
     path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
     path("usuario/api/get/usuario/", UsuarioActualAPIView.as_view(), name="usuario-actual"),
    path('cron/recordatorios-pendientes/', ejecutar_recordatorios_pendientes, name='cron_recordatorios'),
]
