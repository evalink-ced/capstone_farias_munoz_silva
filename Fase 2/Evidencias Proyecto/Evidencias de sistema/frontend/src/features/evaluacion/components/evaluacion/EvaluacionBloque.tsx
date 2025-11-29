import EvaluacionBloqueBase from "../common/EvaluacionBloqueBase";
import { CustomRadioNivel } from "../common/CustomRadioNivel";

import { Respuesta } from "@/features/evaluacion/types/asignar/evaluacion";
import {
  AreaEvaluacion,
  TipoEvaluacion,
} from "@/features/evaluacion/types/evaluacion";

interface Props {
  area: AreaEvaluacion;
  estructura: TipoEvaluacion;
  respuestas: Respuesta[];
  actualizarPuntaje: (indicadorId: number, puntaje: number) => void;
  evaluacionId: number;
  // ✅ AGREGAR PROP PARA ESTADO DE GUARDANDO
  guardando?: boolean;
}

export default function EvaluacionBloque({
  area,
  estructura,
  respuestas,
  actualizarPuntaje,
  evaluacionId,
  guardando = false,
}: Props) {
  return (
    <EvaluacionBloqueBase
      actualizarPuntaje={actualizarPuntaje}
      area={area}
      estructura={estructura}
      evaluacionId={evaluacionId}
      redirectPath="/evaluacion-jefatura"
      renderRadioNivel={(props: any) => <CustomRadioNivel {...props} />}
      respuestas={respuestas}
      tipoEvaluacion="evaluacion"
      // ✅ PASAR ESTADO DE GUARDANDO
      guardando={guardando}
    />
  );
}
