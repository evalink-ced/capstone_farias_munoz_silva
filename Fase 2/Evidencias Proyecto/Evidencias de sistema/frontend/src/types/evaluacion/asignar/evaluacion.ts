import { TipoEvaluacion } from "../evaluacion";
export interface AsignacionEvaluacion {
  id: number;
  tipo_evaluacion: TipoEvaluacion;
  fecha_evaluacion: string;
  personas_asignadas: Usuario[];
  persona?: string;
  personas?: Usuario[];
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
