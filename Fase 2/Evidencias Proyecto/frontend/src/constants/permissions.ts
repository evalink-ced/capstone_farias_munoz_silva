// Constantes de permisos organizadas por módulos
export const PERMISSIONS = {
  // Portal Trabajador
  PORTAL: {
    AUTOEVALUACION: 'portal.autoevaluacion',
  },
  
  // Equipo Directivo
  DIRECTIVO: {
    EVALUAR_DESEMPENO: 'directivo.evaluar_desempeno',
    EVALUACION_MIXTA: 'directivo.evaluacion_mixta',
  },
  // Evaluación de Desempeño
  EVALUACION: {
    PLANTILLAS: 'evaluacion.plantillas',
    ASIGNAR: 'evaluacion.asignar',
    AUTOEVALUACION: 'evaluacion.autoevaluacion',
    JEFATURA: 'evaluacion.jefatura',
  },
  
  // Licencias
  
  // Fundación
  FUNDACION: {
    USUARIOS_FICHA: 'fundacion.usuarios_ficha',
  },
  
  // Sistema
  SISTEMA: {
    USUARIOS: 'sistema.usuarios',
    USER_PROFILE: 'sistema.user_profile',
  },
} as const;

// Tipo para autocompletado y validación
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS][keyof typeof PERMISSIONS[keyof typeof PERMISSIONS]];

// Helper para obtener todos los permisos como array
export const getAllPermissions = (): Permission[] => {
  return Object.values(PERMISSIONS).flatMap(module => 
    Object.values(module)
  ) as Permission[];
};

// Helper para validar si un permiso existe
export const isValidPermission = (permission: string): permission is Permission => {
  return getAllPermissions().includes(permission as Permission);
};