import Pagination from "../common/Pagination";

import AutoevaluacionBloque from "./AutoevaluacionBloque";

import {
  TipoEvaluacion,
  AreaEvaluacion,
} from "@/features/evaluacion/types/evaluacion";
import { Respuesta } from "@/features/evaluacion/types/asignar/evaluacion";

interface AutoevaluacionPaginadaProps {
  estructura: TipoEvaluacion;
  respuestas: Respuesta[];
  actualizarPuntaje: (indicadorId: number, puntaje: number) => void;
  autoevaluacionId: number;
  // ✅ AGREGAR PROP PARA ESTADO DE GUARDANDO
  guardando?: boolean;
}

export default function AutoevaluacionPaginada({
  estructura,
  respuestas,
  actualizarPuntaje,
  autoevaluacionId,
  guardando = false,
}: AutoevaluacionPaginadaProps) {
  return (
    <Pagination
      estructura={estructura}
      guardando={guardando}
      renderBloque={(areaActual: AreaEvaluacion) => (
        <AutoevaluacionBloque
          actualizarPuntaje={actualizarPuntaje}
          area={areaActual}
          autoevaluacionId={autoevaluacionId}
          estructura={estructura}
          respuestas={respuestas}
          // ✅ PASAR ESTADO DE GUARDANDO
          guardando={guardando}
        />
      )}
      respuestas={respuestas}
      titulo="Autoevaluación"
    />
  );
}
