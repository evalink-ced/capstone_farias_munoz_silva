export interface AsignacionEvaluacion {
  id: number;
  tipo_evaluacion: TipoEvaluacionLite;
  fecha_evaluacion: string;
  // Autoevaluación:
  personas_asignadas?: UsuarioLite[];
  // Compat legado:
  personas?: UsuarioLite[];
  // Jefatura:
  detalles?: DetalleAsignacion[];
}


export interface UsuarioLite {
  id: number;
  first_name: string;
  last_name: string;
  empresa?: { empresa: string } | null;
  ciclo?: { ciclo: string } | null;
}

export interface DetalleAsignacion {
  id: number;
  persona: UsuarioLite;
  evaluador: UsuarioLite;
}

export interface TipoEvaluacionLite {
  auto: boolean;
  n_tipo_evaluacion: string;
}

export interface NuevaAsignacionEvaluacion {
  tipo_evaluacion_id: number;
  fecha_evaluacion: string;
  personas_asignadas_ids: number[];
}

export interface Usuario {
  jefe: number;
  id: number;
  first_name: string;
  last_name: string;
  ciclo: {
    id: number;
    ciclo: string;
  };
  empresa: {
    id: number;
    empresa: string;
  };
}

export type Respuesta = { indicador: number; puntaje: number };


