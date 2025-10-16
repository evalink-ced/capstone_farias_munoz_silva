// features/evaluacion/autoevaluacion/utils/evaluacion.ts
import type { TipoEvaluacion } from "@/features/evaluacion/types/evaluacion";

export function totalIndicadoresEsperados(tipo?: TipoEvaluacion): number {
  if (!tipo?.areas?.length) return 0;
  return tipo.areas.reduce((acc, area) => {
    const inArea = (area.competencias ?? []).reduce(
      (acc2, c) => acc2 + (c.indicadores?.length ?? 0),
      0
    );
    return acc + inArea;
  }, 0);
}
