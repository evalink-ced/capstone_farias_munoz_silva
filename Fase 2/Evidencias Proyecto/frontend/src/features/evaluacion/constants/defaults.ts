// src/features/evaluacion/constants/defaults.ts

// Niveles de evaluación por puntos (para formularios)
export const DEFAULT_NIVELES = [
  { nombre: "DESTACADO 4 puntos", nvl: 4, puntaje: 4, descripcion: "Siempre (4 OA)." },
  { nombre: "COMPETENTE 3 puntos", nvl: 3, puntaje: 3, descripcion: "Constantemente (3 OA)." },
  { nombre: "INICIAL 2 puntos", nvl: 2, puntaje: 2, descripcion: "Ocasionalmente (2 OA)." },
  { nombre: "INSATISFACTORIO 1 punto", nvl: 1, puntaje: 1, descripcion: "Rara vez o nunca (1 o ninguna OA)." },
];

export const cloneNiveles = () => DEFAULT_NIVELES.map(n => ({ ...n }));

// Criterios de evaluación por porcentaje estandarizados
export const EVALUATION_CRITERIA = {
  // Rangos de porcentaje
  RANGES: {
    DESTACADO: { min: 91, max: 100 },
    COMPETENTE: { min: 81, max: 90 },
    INICIAL: { min: 71, max: 80 },
    INSATISFACTORIO: { min: 0, max: 70 }
  },

  // Niveles de evaluación
  LEVELS: {
    DESTACADO: 'destacado',
    COMPETENTE: 'competente', 
    INICIAL: 'inicial',
    INSATISFACTORIO: 'insatisfactorio'
  } as const,

  // Textos para mostrar
  TEXTS: {
    destacado: 'Destacado',
    competente: 'Competente',
    inicial: 'Inicial',
    insatisfactorio: 'Insatisfactorio'
  },

  // Colores para UI (NextUI/HeroUI)
  COLORS: {
    destacado: 'success' as const,      // Azul para 91-100%
    competente: 'primary' as const,     // Verde para 81-90%
    inicial: 'warning' as const,        // Amarillo para 71-80%
    insatisfactorio: 'danger' as const  // Rojo para ≤70%
  },

  // Colores de fondo para badges/chips
  BG_COLORS: {
    destacado: 'bg-blue-500',           // Azul para 91-100%
    competente: 'bg-emerald-500',       // Verde para 81-90%
    inicial: 'bg-amber-500',            // Amarillo para 71-80%
    insatisfactorio: 'bg-red-500'       // Rojo para ≤70%
  }
} as const;

// Tipos derivados
export type EvaluationLevel = keyof typeof EVALUATION_CRITERIA.TEXTS;
export type EvaluationColor = typeof EVALUATION_CRITERIA.COLORS[EvaluationLevel];

// Funciones utilitarias centralizadas
export const EvaluationUtils = {
  /**
   * Obtiene el nivel de evaluación basado en el porcentaje
   */
  getLevel: (percentage: number): EvaluationLevel => {
    if (percentage >= EVALUATION_CRITERIA.RANGES.DESTACADO.min) return 'destacado';
    if (percentage >= EVALUATION_CRITERIA.RANGES.COMPETENTE.min) return 'competente';
    if (percentage >= EVALUATION_CRITERIA.RANGES.INICIAL.min) return 'inicial';
    return 'insatisfactorio';
  },

  /**
   * Obtiene el color UI basado en el porcentaje
   */
  getColor: (percentage: number): EvaluationColor => {
    const level = EvaluationUtils.getLevel(percentage);
    return EVALUATION_CRITERIA.COLORS[level];
  },

  /**
   * Obtiene el texto a mostrar basado en el porcentaje
   */
  getText: (percentage: number): string => {
    const level = EvaluationUtils.getLevel(percentage);
    return EVALUATION_CRITERIA.TEXTS[level];
  },

  /**
   * Obtiene el color de fondo basado en el porcentaje
   */
  getBgColor: (percentage: number): string => {
    const level = EvaluationUtils.getLevel(percentage);
    return EVALUATION_CRITERIA.BG_COLORS[level];
  },

  /**
   * Obtiene información completa del nivel de evaluación
   */
  getEvaluationInfo: (percentage: number) => {
    const level = EvaluationUtils.getLevel(percentage);
    return {
      level,
      text: EVALUATION_CRITERIA.TEXTS[level],
      color: EVALUATION_CRITERIA.COLORS[level],
      bgColor: EVALUATION_CRITERIA.BG_COLORS[level],
      percentage
    };
  },

  /**
   * Verifica si un porcentaje está en un rango específico
   */
  isInRange: (percentage: number, targetLevel: EvaluationLevel): boolean => {
    const range = EVALUATION_CRITERIA.RANGES[targetLevel.toUpperCase() as keyof typeof EVALUATION_CRITERIA.RANGES];
    return percentage >= range.min && percentage <= range.max;
  }
};
