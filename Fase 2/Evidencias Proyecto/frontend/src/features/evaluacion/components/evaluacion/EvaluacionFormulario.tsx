  import { useLocation } from "react-router-dom";

import EvaluacionFormularioBase from "../common/EvaluacionFormularioBase";

import EvaluacionPaginada from "./EvaluacionPaginada";

export default function EvaluacionFormulario() {
  const { state } = useLocation();
  const evaluacionId = state?.id;

  return (
    <EvaluacionFormularioBase
      evaluacionId={evaluacionId}
      renderPaginacion={(props: any) => (
        <EvaluacionPaginada
          actualizarPuntaje={props.actualizarPuntaje}
          estructura={props.estructura}
          evaluacionId={props.evaluacionId}
          respuestas={props.respuestas}
          // ✅ PASAR ESTADO DE GUARDANDO
          guardando={props.guardando}
        />
      )}
      tipoEvaluacion="evaluacion"
    />
  );
}
