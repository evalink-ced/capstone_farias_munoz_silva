from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TipoEvaluacionViewSet, EvaluacionAsignadaViewSet, UsuarioViewSet, AutoevaluacionViewSet, AutoevaluacionSubordinadosViewSet, JefeEvaluacionAsignadaViewSet,EvaluacionViewSet,JefeEvaluacionAsignadaMostrarViewSet, JefeEvaluacionAsignadaMostrarAsignaciónViewSet, MisEvaluacionesJefaturaViewSet,EvaluacionMixtaViewSet, SubordinadosViewSet

router = DefaultRouter()
router.register(r'tipos-evaluacion', TipoEvaluacionViewSet)
router.register(r'autoevaluaciones-asignadas', EvaluacionAsignadaViewSet)
router.register(r'evaluaciones-asignadas', JefeEvaluacionAsignadaViewSet)
router.register(r'usuarios', UsuarioViewSet)
router.register(r'autoevaluaciones', AutoevaluacionViewSet, basename='autoevaluacion')
router.register(r'autoevaluaciones-subordinados', AutoevaluacionSubordinadosViewSet, basename='autoevaluacion-subordinados')
router.register(r'mostrar-asignacion', JefeEvaluacionAsignadaMostrarViewSet, basename='mostrar-evaluacion')
router.register(r'mostrar-asignada', JefeEvaluacionAsignadaMostrarAsignaciónViewSet, basename='mostrar-evaluacion-asignada')
router.register(r'evaluaciones-jefe', EvaluacionViewSet, basename='evaluacion')
router.register(r"mis-evaluaciones", MisEvaluacionesJefaturaViewSet, basename="mis-evaluaciones")
router.register(r"evaluaciones-mixtas", EvaluacionMixtaViewSet, basename="evaluaciones-mixtas")
router.register(r'subordinados', SubordinadosViewSet, basename='subordinados')

urlpatterns = [
    path('api/', include(router.urls)),
]