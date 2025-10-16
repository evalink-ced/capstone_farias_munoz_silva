import clsx from "clsx";

import { AreaEvaluacion } from "@/features/evaluacion/types/evaluacion";

interface ProgressIndicatorProps {
  area: AreaEvaluacion;
  progresoArea: number;
  guardando?: boolean;
}

export default function ProgressIndicator({
  area,
  progresoArea,
  guardando = false,
}: ProgressIndicatorProps) {
  return (
    <div className="fixed top-1/2 right-2 sm:right-4 lg:right-6 -translate-y-1/2 z-40 group">
      <div className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-primary-100/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
        {/* Círculo de progreso */}
        <svg className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 -rotate-90" viewBox="0 0 100 100">
          <circle
            className="text-default-100"
            cx="50"
            cy="50"
            fill="transparent"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
          />
          <circle
            className={clsx(
              guardando
                ? "text-primary-400"
                : progresoArea < 30
                  ? "text-danger-400"
                  : progresoArea < 70
                    ? "text-warning-400"
                    : "text-success-400",
              guardando && "animate-pulse"
            )}
            cx="50"
            cy="50"
            fill="transparent"
            r="40"
            stroke="currentColor"
            strokeDasharray="251.2"
            strokeDashoffset={251.2 - (progresoArea / 100) * 251.2}
            strokeLinecap="round"
            strokeWidth="8"
          />
        </svg>

        {/* Texto de porcentaje en el centro */}
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span
            className={clsx(
              "font-bold text-[10px] sm:text-xs lg:text-sm leading-none",
              guardando
                ? "text-primary-600"
                : progresoArea < 30
                  ? "text-danger-600"
                  : progresoArea < 70
                    ? "text-warning-600"
                    : "text-success-600",
            )}
          >
            {progresoArea}%
          </span>
          <span className="text-[8px] sm:text-[9px] lg:text-[10px] text-default-500 leading-none mt-0.5">
            {guardando ? "Guardando..." : "Área"}
          </span>
        </div>

        {/* Tooltip con información del área - solo en desktop */}
        <div className="absolute -left-40 sm:-left-44 lg:-left-48 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/95 backdrop-blur-sm p-2 sm:p-3 rounded-lg shadow-lg border border-primary-100/50 w-36 sm:w-40 lg:w-44 text-left pointer-events-none hidden lg:block">
          <h3 className="text-xs sm:text-sm font-semibold text-primary-700 break-words">
            {area.n_area}
          </h3>
          {guardando && (
            <p className="text-xs text-primary-600 mt-1">
              Guardando cambios...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
