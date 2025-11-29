import { Respuesta } from "@/features/evaluacion/types/asignar/evaluacion";
import {
  AreaEvaluacion,
  TipoEvaluacion,
} from "@/features/evaluacion/types/evaluacion";
import EvaluacionBloqueBase from "@/features/evaluacion/components/common/EvaluacionBloqueBase";
import { CustomRadioNivel } from "@/features/evaluacion/components/common/CustomRadioNivel";

interface Props {
  area: AreaEvaluacion;
  estructura: TipoEvaluacion;
  respuestas: Respuesta[];
  actualizarPuntaje: (indicadorId: number, puntaje: number) => void;
  autoevaluacionId: number;
  // ✅ AGREGAR PROP PARA ESTADO DE GUARDANDO
  guardando?: boolean;
}

export default function AutoevaluacionBloque({
  area,
  estructura,
  respuestas,
  actualizarPuntaje,
  autoevaluacionId,
  guardando = false,
}: Props) {
  return (
    <EvaluacionBloqueBase
      actualizarPuntaje={actualizarPuntaje}
      area={area}
      estructura={estructura}
      evaluacionId={autoevaluacionId}
      redirectPath="/autoevaluacion"
      renderRadioNivel={(props) => <CustomRadioNivel {...props} />}
      respuestas={respuestas}
      tipoEvaluacion="autoevaluacion"
      // ✅ PASAR ESTADO DE GUARDANDO
      guardando={guardando}
    />
  );
}
