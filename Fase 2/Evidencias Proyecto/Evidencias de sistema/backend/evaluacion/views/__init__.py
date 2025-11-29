from evaluacion.views.views import (
    TipoEvaluacionViewSet,EvaluacionAsignadaViewSet,UsuarioViewSet
)
from evaluacion.views.autoevaluacion import AutoevaluacionViewSet
from evaluacion.views.autoevaluacion_subordinados import AutoevaluacionSubordinadosViewSet
from evaluacion.views.jefe_evaluacion_asignar import JefeEvaluacionAsignadaViewSet,JefeEvaluacionAsignadaMostrarViewSet,JefeEvaluacionAsignadaMostrarAsignaciónViewSet
from evaluacion.views.evaluacion_jefe import (
    EvaluacionViewSet,  MisEvaluacionesJefaturaViewSet
)
from evaluacion.views.mixto_views import EvaluacionMixtaViewSet

from evaluacion.views.subordinados import SubordinadosViewSet