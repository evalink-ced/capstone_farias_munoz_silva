from django.contrib import admin
from .models import TipoEvaluacion,EvaluacionAsignada,Autoevaluacion, JefeEvaluacionAsignada,EvaluacionJefe,RespuestaIndicadorJefe
from historial.admin import *

@admin.register(TipoEvaluacion)
class TipoEvaluacionAdmin(HistorialAdminMixin):
    list_display = ('id', 'n_tipo_evaluacion')
    search_fields = ('n_tipo_evaluacion',)


    
    
@admin.register(EvaluacionAsignada)
class EvaluacionAsignadaAdmin(HistorialAdminMixin):
    list_display = ('id', 'tipo_evaluacion', 'fecha_evaluacion')
    list_filter = ('tipo_evaluacion',)
    search_fields = ('tipo_evaluacion__n_tipo_evaluacion',)
    raw_id_fields = ('personas_asignadas',)
    autocomplete_fields = ('personas_asignadas',)
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('tipo_evaluacion')
    

@admin.register(Autoevaluacion)
class AutoevaluacionAdmin(HistorialAdminMixin):
    list_display = ('id', 'persona', 'tipo_evaluacion', 'fecha_inicio', 'completado','ponderada')  # Removido 'ponderada'
    list_filter = ('tipo_evaluacion', 'completado','ponderada')  # Removido 'ponderada'
    search_fields = ('persona__username', 'tipo_evaluacion__n_tipo_evaluacion')
    raw_id_fields = ('persona',)
    autocomplete_fields = ('persona',)
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('tipo_evaluacion', 'persona')
    
@admin.register(JefeEvaluacionAsignada)
class EvaluacionAdmin(HistorialAdminMixin):
    list_display = ('id', 'tipo_evaluacion', 'fecha_creacion', 'fecha_modificacion')
    list_filter = ('tipo_evaluacion', )
    search_fields = ('persona__username', 'tipo_evaluacion__n_tipo_evaluacion')


@admin.register(EvaluacionJefe)
class EvaluacionJefeAdmin(HistorialAdminMixin):
    list_display = ('id', 'persona', 'evaluador', 'tipo_evaluacion', 'fecha_evaluacion', 'completado', 'ponderada', 'estado_firma', 'fecha_firma')
    list_filter = ('tipo_evaluacion', 'completado', 'ponderada', 'estado_firma', 'cerrado_para_firma', 'retroalimentacion_completada')
    search_fields = ('persona__username', 'evaluador__username', 'tipo_evaluacion__n_tipo_evaluacion', 'motivo_denegacion')
    raw_id_fields = ('persona', 'evaluador')
    autocomplete_fields = ('persona', 'evaluador')
    readonly_fields = ('fecha_inicio', 'fecha_ultima_modificacion', 'fecha_firma', 'logro_obtenido')
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('persona', 'evaluador', 'tipo_evaluacion', 'fecha_evaluacion', 'asignacion')
        }),
        ('Estado de la Evaluación', {
            'fields': ('completado', 'ponderada', 'fecha_reunion', 'retroalimentacion_completada', 'cerrado_para_firma')
        }),
        ('Firma y Aprobación', {
            'fields': ('estado_firma', 'fecha_firma', 'motivo_denegacion'),
            'description': 'Gestión del estado de firma y motivos de denegación'
        }),
        ('Contenido de la Evaluación', {
            'fields': ('text_destacar', 'text_mejorar', 'retroalimentacion', 'logro_obtenido'),
            'classes': ('collapse',)
        }),
        ('Metadatos', {
            'fields': ('fecha_inicio', 'fecha_ultima_modificacion', 'estructura_json', 'version_plantilla'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('tipo_evaluacion', 'persona', 'evaluador')
    

    
