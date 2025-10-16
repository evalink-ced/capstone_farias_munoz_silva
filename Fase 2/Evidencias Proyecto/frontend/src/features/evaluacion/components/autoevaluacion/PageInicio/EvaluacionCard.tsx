// features/evaluacion/autoevaluacion/components/EvaluacionCard.tsx
import { memo, useCallback } from "react";
import type { Evaluacion } from "@/features/evaluacion/types/evaluacion";
import { totalIndicadoresEsperados } from "@/features/evaluacion/utils/evaluacion";

import { safeMonthToLabel } from "@/features/evaluacion/utils/date";
import StatusBadge from "./StatusBadge";

type Props = {
    item: Evaluacion;
    finalizada: boolean;
    onOpen: (id: number, finalizada: boolean) => void;
};

const EvaluacionCard = memo(function EvaluacionCard({ item, finalizada, onOpen }: Props) {
    const total = totalIndicadoresEsperados(item.tipo_evaluacion);
    const respondidos = item.respuestas?.length ?? 0;
    const faltantes = Math.max(total - respondidos, 0);
    const periodo = safeMonthToLabel(item.fecha_evaluacion);

    const handleClick = useCallback(() => onOpen(item.id, finalizada), [item.id, finalizada, onOpen]);

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label={`${finalizada ? "Ver" : "Continuar"} evaluación ${item.tipo_evaluacion?.n_tipo_evaluacion ?? item.id}`}
            className="group w-full rounded-3xl border border-white/40 bg-white/90 p-6 text-start outline-none backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:border-blue-200/50 hover:bg-white hover:shadow-2xl focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
            <div className="mb-4 flex items-start justify-between gap-4">
                <h3 className="line-clamp-2 flex-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-900">
                    {item.tipo_evaluacion?.n_tipo_evaluacion ?? "Evaluación sin nombre"}
                </h3>
                <StatusBadge finalizada={finalizada} />
            </div>

            <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                    <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-blue-100 to-purple-100">
                        <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M8 7h8M8 7a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V8a1 1 0 00-1-1" />
                        </svg>
                    </div>
                    <span className="font-medium">Período: {periodo}</span>
                </div>

                {!finalizada && (
                    <div className="flex items-center">
                        <div
                            className={`mr-3 flex h-8 w-8 items-center justify-center rounded-xl ${faltantes > 0
                                    ? "bg-gradient-to-r from-orange-100 to-red-100"
                                    : "bg-gradient-to-r from-green-100 to-emerald-100"
                                }`}
                        >
                            {faltantes > 0 ? (
                                <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            ) : (
                                <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                        <span className={`text-sm font-medium ${faltantes > 0 ? "text-orange-700" : "text-green-700"}`}>
                            {faltantes > 0
                                ? `${faltantes} indicador${faltantes > 1 ? "es" : ""} por responder`
                                : "Todos los indicadores respondidos"}
                        </span>
                    </div>
                )}
            </div>

            <div className="mt-4 border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-blue-400" />
                        <span>{total} indicadores totales</span>
                    </div>
                    <div className="flex items-center text-xs font-medium text-blue-600 transition-colors group-hover:text-blue-700">
                        <span className="mr-1">{finalizada ? "Ver detalles" : "Continuar"}</span>
                        <svg className="h-3 w-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </button>
    );
});

export default EvaluacionCard;
