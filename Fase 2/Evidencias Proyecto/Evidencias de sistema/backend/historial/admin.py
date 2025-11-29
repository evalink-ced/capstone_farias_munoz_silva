from import_export.admin import ImportExportModelAdmin
from .models import Historial
from django.contrib import admin
from .models import Historial


class HistorialAdminMixin(ImportExportModelAdmin):
    """
    Mixin para registrar automáticamente operaciones CRUD e integrar ImportExportModelAdmin
    """

    def save_model(self, request, obj, form, change):
        """
        Guarda el modelo y registra los cambios en el historial.
        """
        descripcion = None  # Inicializar descripción

        if change:  # Solo si se está actualizando el objeto
            cambios = []
            if obj.pk:  # Verificar que el objeto ya existe en la base de datos
                try:
                    obj_anterior = obj.__class__.objects.get(
                        pk=obj.pk)  # Obtener estado anterior
                    for field in form.changed_data:
                        old_value = getattr(obj_anterior, field,
                                            None)  # Valor anterior
                        new_value = form.cleaned_data.get(field)  # Nuevo valor

                        # Si es una relación (ForeignKey), mostrar el nombre legible
                        if hasattr(obj._meta.get_field(field), 'related_model'):
                            old_value = str(old_value) if old_value else "None"
                            new_value = str(new_value) if new_value else "None"

                        cambios.append(
                            f"{field}: '{old_value}' → '{new_value}'")

                    if cambios:
                        descripcion = "Cambios realizados:\n" + \
                            "\n".join([f"• {c}" for c in cambios])

                except obj.__class__.DoesNotExist:
                    pass  # Si no existe, no se hace nada

        else:  # Si es un objeto nuevo
            descripcion = f"Nuevo objeto creado: {obj}"

        # Guardar el objeto en la base de datos primero
        super().save_model(request, obj, form, change)

        # Registrar el historial solo después de que el objeto se haya guardado
        if descripcion:
            from .models import Historial  # Importar aquí para evitar problemas de dependencia
            Historial.objects.create(
                app_name=obj._meta.app_label,
                modelo_name=obj._meta.model_name,
                operacion='UPDATE' if change else 'CREATE',
                objeto_id=obj.pk,
                usuario=request.user,
                descripcion=descripcion
            )


@admin.register(Historial)
class HistorialAdmin(admin.ModelAdmin):
    """
    Configuración del panel de administración para el modelo Historial
    """
    list_display = ('modelo_name', 'operacion',
                    'usuario', 'fecha')
    search_fields = ('modelo_name',
                     'usuario__username', 'descripcion')
    list_filter = ('operacion', 'modelo_name', 'fecha', 'usuario__username')
    readonly_fields = ('modelo_name', 'operacion',
                       'usuario', 'fecha', 'descripcion')
    date_hierarchy = 'fecha'  # Navegación por fechas
    ordering = ('-fecha',)
    exclude = ('objeto_id', 'app_name')
    actions = None

    def has_delete_permission(self, request, obj=None):
        return False
