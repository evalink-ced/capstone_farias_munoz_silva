from django.urls import path
from acceso.api.permisos import UserPermissionsView, AccessPermissionsListView

urlpatterns = [
    path('api/auth/user/access/', UserPermissionsView.as_view(), name='user-permisos'),
    path('api/access/permissions/', AccessPermissionsListView.as_view(), name='access-permissions-list'),
]
