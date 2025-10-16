import Pagination from "../common/Pagination";

import EvaluacionBloque from "./EvaluacionBloque";

import {
  TipoEvaluacion,
  AreaEvaluacion,
} from "@/features/evaluacion/types/evaluacion";
import { Respuesta } from "@/features/evaluacion/types/asignar/evaluacion";

interface EvaluacionPaginadaProps {
  estructura: TipoEvaluacion;
  respuestas: Respuesta[];
  actualizarPuntaje: (indicadorId: number, puntaje: number) => void;
  evaluacionId: number;
  // ✅ AGREGAR PROP PARA ESTADO DE GUARDANDO
  guardando?: boolean;
}

export default function EvaluacionPaginada({
  estructura,
  respuestas,
  actualizarPuntaje,
  evaluacionId,
  guardando = false,
}: EvaluacionPaginadaProps) {
  return (
    <Pagination
      estructura={estructura}
      renderBloque={(areaActual: AreaEvaluacion) => (
        <EvaluacionBloque
          actualizarPuntaje={actualizarPuntaje}
          area={areaActual}
          evaluacionId={evaluacionId}
          estructura={estructura}
          respuestas={respuestas}
          // ✅ PASAR ESTADO DE GUARDANDO
          guardando={guardando}
        />
      )}
      titulo="Evaluación"
      respuestas={respuestas}
      guardando={guardando}
    />
  );
}
