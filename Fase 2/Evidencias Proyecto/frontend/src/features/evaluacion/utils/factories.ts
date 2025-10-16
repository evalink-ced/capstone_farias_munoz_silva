// src/features/evaluacion/utils/factories.ts
import { cloneNiveles } from "../constants/defaults";
import type { AreaEvaluacion, Competencia, Indicador, NivelLogro } from "@/features/evaluacion/types/evaluacion";

let uid = Date.now();
const nextId = () => ++uid;

type IndicadorOverrides = Partial<
  Pick<Indicador, "indicador" | "definicion" | "nvlindicadores" | "numero" | "id">
>;

/** Crea un indicador con valores por defecto y permite overrides */
export const makeIndicador = (numero: number, baseId?: number, overrides: IndicadorOverrides = {}): Indicador => ({
  numero,
  id: overrides.id ?? (baseId ?? 0) * 100 + numero,
  indicador: overrides.indicador ?? `Indicador ${numero}`,
  definicion: overrides.definicion ?? `Definición del indicador ${numero}`,
  nvlindicadores: (overrides.nvlindicadores?.length ? overrides.nvlindicadores : cloneNiveles()) as NivelLogro[],
});

/** Crea N indicadores, permitiendo generar a partir de overrides por cada índice */
export const makeIndicadores = (cantidad: number, baseId?: number, items?: Array<IndicadorOverrides>): Indicador[] => {
  return Array.from({ length: cantidad }, (_, i) => {
    const numero = i + 1;
    const overrides = items?.[i] ?? {};
    return makeIndicador(numero, baseId, overrides);
  });
};

export const makeCompetencia = (id: number, name = "Competencia", indicadores: Indicador[] | number = 1): Competencia => {
  const list = Array.isArray(indicadores)
    ? indicadores
    : makeIndicadores(indicadores, id);
  return { id, name, indicadores: list };
};

export const makeArea = (nombre: string, ponderacion: number, competencias: Competencia[]): AreaEvaluacion => ({
  n_area: nombre,
  ponderacion,
  competencias,
});

// Default para formularios vacíos
export const makeDefaultArea = (): AreaEvaluacion =>
  makeArea("", 0, [makeCompetencia(nextId(), "", 1)]);
