from django.contrib import admin
from django.contrib.admin import AdminSite
from django.contrib.auth.models import Group
from allauth.account.models import EmailAddress
from allauth.socialaccount.models import SocialApp, SocialAccount, SocialToken
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken


class GroupBasedAdminSite(AdminSite):
    site_header = 'Evalink Administrador'
    site_title = 'Evalink Administrador'
    index_title = 'Pestañas'

    def has_permission(self, request):
        user = request.user
        group = getattr(user, 'group', None)
        return (
            user.is_authenticated
            and user.is_active
            and bool(getattr(group, 'is_staff', False))
        )
    

custom_admin_site = GroupBasedAdminSite(name='group_admin')

# Reutilizar los registros existentes del admin por defecto
custom_admin_site._registry = admin.site._registry

# Ocultar modelo auth.Group del panel
try:
    custom_admin_site.unregister(Group)
    
except Exception:
    pass
try:
    custom_admin_site.unregister(EmailAddress)
except Exception:
    pass
for m in (SocialApp, SocialAccount, SocialToken, OutstandingToken, BlacklistedToken):
    try:
        custom_admin_site.unregister(m)
    except Exception:
        pass