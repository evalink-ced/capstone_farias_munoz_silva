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
}

export interface Competencia {
  id: number;
  name: string;
  indicadores: Indicador[];
}

export interface AreaEvaluacion {
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
