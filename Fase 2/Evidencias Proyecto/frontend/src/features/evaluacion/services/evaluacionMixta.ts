// services/evaluacionMixta.ts
import axios from "@/services/google/axiosInstance";

// services/evaluacionMixta.ts
export type IndicadorMixto = {
  id: number | null;
  nombre: string;              // rótulo corto (p.ej. "Indicador 5")
  popover?: string | null;     // ⬅ NUEVO: texto largo (descripción)
  tooltip?: string | null;     // (si lo quieres conservar)
  puntaje_auto: number | null;
  puntaje_jefe: number | null;
  delta: number | null;
};


export type CompetenciaMixto = {
  id: number | null;
  nombre: string;
  indicadores: IndicadorMixto[];
};

export type AreaMixto = {
  id: number | null;
  nombre: string;
  competencias: CompetenciaMixto[];
};

export type EvaluacionMixta = {

  tipo_evaluacion_id: number;
  tipo_evaluacion: string;
  persona_id: number | null;
  persona_nombre: string | null;            // NUEVO
  evaluador_id: number | null;
  evaluador_nombre: string | null;          // NUEVO
  fecha_evaluacion: string;                 // "MM-AAAA"

  // qué evaluaciones se comparan
  evaluacion_auto_id: number | null;        // NUEVO
  evaluacion_auto_nombre: string | null;    // NUEVO
  evaluacion_jefe_id: number | null;        // NUEVO
  evaluacion_jefe_nombre: string | null;    // NUEVO

  areas: AreaMixto[];
  resumen?: {
    auto_pts?: number | null;
    jefe_pts?: number | null;
    max_pts?: number | null;
    delta_pts?: number | null;

    auto_pct?: number | null;   // 0..100
    jefe_pct?: number | null;
    delta_pct?: number | null;

    respondidos_auto?: number;
    respondidos_jefe?: number;
  };
};

export async function getEvaluacionMixta(detalleId: number) {
  const { data } = await axios.get<EvaluacionMixta>(
    `/evaluacion/api/evaluaciones-mixtas/${detalleId}/`
  );
  return data;
}
