import { ReactNode } from "react";
import { CheckCircleIcon } from "lucide-react";

import { useEvaluacionFormularioBase } from "./hooks/useEvaluacionFormularioBase";

interface EvaluacionFormularioBaseProps {
  evaluacionId: number;
  tipoEvaluacion: "autoevaluacion" | "evaluacion";
  renderPaginacion: (props: any) => ReactNode;
}

export default function EvaluacionFormularioBase({
  evaluacionId,
  tipoEvaluacion,
  renderPaginacion,
}: EvaluacionFormularioBaseProps) {
  const {
    respuestas,
    estructura,
    loading,
    paginaActual,
    guardando,
    guardadoExitoso,
    actualizarPuntaje,
  } = useEvaluacionFormularioBase({ evaluacionId, tipoEvaluacion });

  if (loading || !estructura) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-sm text-default-600 font-medium">Cargando evaluación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {renderPaginacion({
        evaluacionId,
        estructura,
        respuestas,
        actualizarPuntaje,
        paginaActual,
        tipoEvaluacion,
        // ✅ PASAR ESTADO DE GUARDANDO
        guardando,
      })}

      {/* Indicador de guardado automático */}
      <div className="fixed bottom-16 sm:bottom-20 lg:bottom-24 left-1/2 transform -translate-x-1/2 z-50">
        {guardando && (
          <div className="bg-white/95 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-2.5 rounded-full shadow-lg border border-primary-100/50 text-xs sm:text-sm flex items-center gap-2 sm:gap-3 animate-bounce">
            <div className="relative">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-primary-200 border-t-primary-500 animate-spin" />
            </div>
            <span className="text-primary-700 font-medium whitespace-nowrap">
              Guardando...
            </span>
          </div>
        )}
        {guardadoExitoso && (
          <div className="bg-white/95 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-2.5 rounded-full shadow-lg border border-success-100/50 text-xs sm:text-sm flex items-center gap-2 sm:gap-3 animate-pulse">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-success-500 flex items-center justify-center">
              <CheckCircleIcon className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
            </div>
            <span className="text-success-700 font-medium whitespace-nowrap">
              Guardado
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
