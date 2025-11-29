# admin_config.py
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from import_export import resources, fields
from import_export.widgets import ForeignKeyWidget
from historial.admin import HistorialAdminMixin
from usuarios.models import (
    User, Cargo, Ciclo, Genero
)




DIAS_cumpleanioS = 'dias_cumpleanios'
# Configuración de encabezados
admin.site.site_header = 'CLSB Administrador'
admin.site.index_title = 'Pestañas'
admin.site.site_title = 'CSLB Administrador'


 


class UserResource(resources.ModelResource):
    jefe = fields.Field(
        column_name='correo jefe',
        attribute='jefe',
        widget=ForeignKeyWidget(User, 'email')
    )

    


    def before_import_row(self, row, **kwargs):
        jefe_email = row.get('correo jefe')
        if jefe_email:
            try:
                jefe_instance = User.objects.get(email=jefe_email)
                row['jefe'] = jefe_instance.pk
            except User.DoesNotExist:
                row['jefe'] = None


    class Meta:
        model = User
        fields = (
            'id', 'last_login', 'is_active', 'rut', 'password', 'username',
            'first_name', 'last_name', 'email', 'birthday',
            'date_joined', 'jefe', 'tiempo', 'tiempo_en', 'dias_tomados',
            'dias_restantes', DIAS_cumpleanioS, 'group', 'cargo__cargo', 'ciclo__ciclo',
            'empresa', 'genero', 'foto',
            # nuevos
            'titulos', 'magister', 'diplomados', 'bienios'
        )
        import_id_fields = ('id',)
        skip_unchanged = True
        report_skipped = True




class CustomUserAdmin(HistorialAdminMixin):
    resource_class = UserResource

    # === READONLY para propiedades ===
    readonly_fields = ( "tiempo_en_admin",)

    def tiempo_en_admin(self, obj):
        return obj.tiempo_en
    tiempo_en_admin.short_description = "Tiempo legible"

    fieldsets = (
        (_('Información Personal'), {
            'fields': ('rut', 'username', 'first_name', 'last_name', 'email', 'birthday', 'genero', 'foto')
        }),
        (_('Información Laboral'), {
            # reemplaza 'tiempo', 'tiempo_en' por los métodos readonly
            'fields': ('jefe', 'empresa', 'date_joined', 'tiempo_en_admin', 'cargo', 'ciclo')
        }),
        (_('Permisos'), {'fields': ('is_active',  'group')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('rut', 'username', 'password1', 'password2', 'first_name', 'last_name', 'email', 'birthday', 'date_joined'),
        }),
    )

    list_display = ('first_name', 'last_name', 'jefe', 'ciclo', 'date_joined', 'empresa','group','is_active')
    search_fields = ('username', 'date_joined')
    ordering = ('username', 'date_joined')
    list_filter = ('genero', 'group', 'ciclo', 'empresa','is_active')
    # Agregar el nuevo inline



# class TramosAdmin(HistorialAdminMixin):
#     list_display = ('tramo',)
#     search_fields = ('tramo',)
#     list_filter = ('tramo',)


# class TituloCapacitacionAdmin(HistorialAdminMixin):
#     list_display = ('titulo',)
#     search_fields = ('titulo',)
#     list_filter = ('titulo',)

# class CapacitacionAdmin(HistorialAdminMixin):
#     list_display = ('titulo_general','nombre','descripcion')
#     search_fields = ('titulo_general','nombre','descripcion')
#     list_filter = ('titulo_general','nombre','descripcion')

# class ParticipacionCapaAdmin(HistorialAdminMixin):
#     list_display = ('capacitacion__titulo_general','capacitacion', 'fecha_realizacion','total_usuarios')
#     search_fields = ('capacitacion', 'fecha_realizacion')
#     list_filter = ('capacitacion', 'fecha_realizacion')

#     def total_usuarios(self, obj):
#         return obj.usuario.count()
#     total_usuarios.short_description = 'Total Usuarios'

# class BieniosAdmin(HistorialAdminMixin):
#     list_display = ('usuario', 'bienios', 'tramo')
#     search_fields = ('bienios', 'tramo__tramo')
#     list_filter = ('bienios', 'tramo')


class CargoAdmin(HistorialAdminMixin):
    list_display = ('cargo', 'descripcion')
    search_fields = ('cargo', 'descripcion')
    list_filter = ('cargo',)


class CicloAdmin(HistorialAdminMixin):
    list_display = ('ciclo',)
    list_filter = ('ciclo',)




class GeneroAdmin(HistorialAdminMixin):
    list_display = ('genero',)
    list_filter = ('genero',)

# class ContactoEmergenciaAdmin(HistorialAdminMixin):
#     list_display = ('usuario','nombre','telefono','parentezco')
#     search_fields = ('usuario__username', 'nombre', 'telefono', 'parentezco')
#     list_filter = ('usuario', 'nombre', 'telefono', 'parentezco')



admin.site.register(User, CustomUserAdmin)
admin.site.register(Cargo, CargoAdmin)
admin.site.register(Ciclo, CicloAdmin)

admin.site.register(Genero, GeneroAdmin)
# admin.site.register(ContactoEmergencia, ContactoEmergenciaAdmin)



