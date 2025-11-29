from django.contrib import admin
from institucion.models.empresa import Empresa
from import_export.admin import ImportExportModelAdmin
from django.utils import timezone

# ============ NUEVOS MODELOS ACTIVOS ============

@admin.register(Empresa)
class EmpresaAdmin(admin.ModelAdmin):
    list_display = ("name","empresa")
    search_fields = ("name",)

