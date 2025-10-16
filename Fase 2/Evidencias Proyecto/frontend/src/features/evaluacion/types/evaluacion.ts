export interface NivelLogro {
  nombre: string;
  descripcion: string;
  nvl: number;
  puntaje: number;
}

export interface Indicador {
  numero: number;
  id: number;
  indicador: string;
  definicion?: string;
  nvlindicadores: NivelLogro[];
  // Campos para respuestas en indicadores
  pivot?: {
    puntaje_auto?: number;
    puntaje_jefe?: number;
  };
}

export interface Competencia {
  id: number;
  name: string;
  indicadores: Indicador[];
}

export interface AreaEvaluacion {
  id?: number;
  n_area: string;
  competencias: Competencia[];
  ponderacion: number;
}

export interface TipoEvaluacion {
  id: number;
  auto: boolean;
  n_tipo_evaluacion: string;
  areas: AreaEvaluacion[];
}

// Interface para respuestas individuales
export interface RespuestaIndicador {
  indicador: number;
  puntaje: number;
}

// Interface base para evaluaciones
export interface EvaluacionBase {
  id: number;
  fecha_evaluacion: string;
  fecha_inicio?: string;
  fecha_ultima_modificacion?: string;
  completado?: boolean;
  firmado?: boolean; // Mantener para compatibilidad
  // Nuevos campos del backend
  estado_firma?: 'pendiente' | 'firmado' | 'firmado_obs';
  motivo_denegacion?: string | null;
  firmado_obs?: boolean; // Campo calculado del backend
  ponderada?: boolean;
  text_destacar?: string | null;
  text_mejorar?: string | null;
  retroalimentacion?: string | null;
  fecha_retroalimentacion?: string | null;
  // Nuevos campos para el flujo de estados
  reunion_realizada?: boolean;
  fecha_reunion?: string | null;
  retroalimentacion_completada?: boolean;
  cerrado_para_firma?: boolean;
  fecha_firma?: string | null;
  estado_actual?: string;
  logro_obtenido?: number;
  estructura_json?: TipoEvaluacion | null; // Snapshot de la estructura al momento de la evaluación
  respuestas?: RespuestaIndicador[];
}

// Interface para autoevaluaciones
export interface Autoevaluacion extends EvaluacionBase {
  persona?: {
    id: number;
    first_name: string;
    last_name: string;
    email?: string;
  };
  tipo_evaluacion?: TipoEvaluacion;
  puntaje_total_obtenido?: number;
  puntaje_total_maximo?: number;
  porcentaje_total?: number;
}

// Interface para evaluaciones de jefatura
export interface EvaluacionJefe extends EvaluacionBase {
  persona?: {
    id: number;
    first_name: string;
    last_name: string;
    email?: string;
    jefe?: string;

  };
  tipo_evaluacion?: TipoEvaluacion;
  puntaje_total_obtenido?: number;
  puntaje_total_maximo?: number;
  porcentaje_total?: number;
}

// Interface genérica para evaluaciones (mantener compatibilidad)
export interface Evaluacion extends EvaluacionBase {
  tipo_evaluacion?: TipoEvaluacion;
  logro_obtenido?: number;

  persona?: {
    id: number;
    first_name: string;
    last_name: string;
    email?: string;
    foto_thumbnail?: string;
    ciclo?: string;
    cargo?: string;
  };
  evaluador?: {
    id: number;
    first_name: string;
    last_name: string;
    email?: string;
  };
  // Campos adicionales para compatibilidad con el frontend actual
  periodo?: string;
  usuario?: string;
  areas?: AreaEvaluacion[];
}

// Interface para datos procesados de áreas (usado en componentes de detalle)
export interface AreaDetalle {
  id: number;
  nombre: string;
  competencias: CompetenciaDetalle[];
  obtenido: number;
  maximo: number;
  porcentaje: number;
}

export interface CompetenciaDetalle {
  id: number;
  nombre: string;
  indicadores: IndicadorDetalle[];
}

export interface IndicadorDetalle {
  id: number;
  nombre: string;
  puntaje: number;
  puntaje_maximo: number;
  porcentaje: number; // ✅ Add missing porcentaje property
}

// Interface para logro por área
// Tipos para el nuevo flujo de estados
export type EstadoEvaluacion =
  | 'pendiente'
  | 'retroalimentar'
  | 'firmar'
  | 'finalizado';

export interface AccionEvaluacion {
  tipo: 'marcar_reunion' | 'completar_retroalimentacion' | 'cerrar_para_firma' | 'firmar' | 'firmar_obs';
  evaluacion_id: number;
  datos?: {
    fecha_reunion?: string;
    retroalimentacion?: string;
    motivo_denegacion?: string; // Para la acción de firmar_obs
  };
}

export interface RespuestaAccion {
  success: boolean;
  message: string;
  evaluacion?: EvaluacionJefe;
}

export interface LogroPorArea {
  puntajeObtenido: number;
  puntajeMaximo: number;
  porcentaje: number;
}

