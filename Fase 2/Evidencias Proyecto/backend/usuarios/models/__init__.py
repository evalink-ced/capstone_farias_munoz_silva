# usuarios/models/__init__.py

# Importaciones principales
from .user_base import User
# Importaciones de otros módulos
from usuarios.models.estructura import Cargo, Codigo, Ciclo, Genero
# Importaciones de choices y mixins para uso externo si es necesario
from .user_choices import TipoContrato
from .user_mixins import ContractMixin, AssignmentMixin

# Mantener compatibilidad con importaciones existentes
__all__ = [
    'User',
    'Evaluacion',
    'Cargo',
    'Codigo', 
    'Ciclo',
    'Genero',
    'TipoContrato',
    'ContractMixin',
    'AssignmentMixin',
]