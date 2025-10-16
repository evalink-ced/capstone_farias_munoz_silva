import { useLocation } from "react-router-dom";

import EvaluacionFormularioBase from "../common/EvaluacionFormularioBase";

import AutoevaluacionPaginada from "./AutoevaluacionPaginada";

export default function AutoevaluacionFormulario() {
  const { state } = useLocation();
  const autoevaluacionId = state?.id;

  return (
    <EvaluacionFormularioBase
      evaluacionId={autoevaluacionId}
      renderPaginacion={(props: any) => (
        <AutoevaluacionPaginada
          actualizarPuntaje={props.actualizarPuntaje}
          autoevaluacionId={props.evaluacionId}
          estructura={props.estructura}
          respuestas={props.respuestas}
          // ✅ PASAR ESTADO DE GUARDANDO
          guardando={props.guardando}
        />
      )}
      tipoEvaluacion="autoevaluacion"
    />
  );
}
