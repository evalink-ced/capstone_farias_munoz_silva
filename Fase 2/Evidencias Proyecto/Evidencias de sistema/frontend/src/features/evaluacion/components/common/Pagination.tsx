import { useState, ReactNode, useEffect, useMemo } from "react";
import { Button } from "@heroui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

import { Respuesta } from "@/features/evaluacion/types/asignar/evaluacion";
import { AreaEvaluacion } from "@/features/evaluacion/types/evaluacion";

interface PaginationProps {
  estructura: any;
  renderBloque: (areaActual: any) => ReactNode;
  titulo: string;
  respuestas?: Respuesta[];
  guardando?: boolean;
  // Callback opcional para cuando se termina la última área
  onFinalizar?: () => void;
}

export default function Pagination({
  estructura,
  renderBloque,
  respuestas = [],
  guardando = false,
}: PaginationProps) {
  const [paginaActual, setPaginaActual] = useState(0);
  const totalPaginas = estructura?.areas?.length || 0;
  
  // Protección: Si el índice se sale de rango, usar el último válido o undefined de forma controlada
  const areaActual = estructura?.areas?.[paginaActual];

  // Scroll al top suave cuando cambia la página
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [paginaActual]);

  // --- LÓGICA DE PROGRESO ---
  const { isAreaCompleta } = useMemo(() => {
    // Si no hay área (ej: carga inicial o error), retornamos valores seguros
    if (!areaActual) return { progresoActual: 0, isAreaCompleta: false };

    // 1. Total de indicadores en esta área
    const totalIndicadores = areaActual.competencias.reduce(
      (acc: number, comp: AreaEvaluacion["competencias"][0]) => acc + comp.indicadores.length, 0
    );

    if (totalIndicadores === 0) return { progresoActual: 100, isAreaCompleta: true };

    // 2. Contar indicadores respondidos
    let respondidosCount = 0;

    areaActual.competencias.forEach((comp: any) => {
        comp.indicadores.forEach((ind: any) => {
            // Buscamos si existe ALGUNA respuesta válida para este indicador
            const tieneRespuesta = respuestas.some(r => r.indicador == ind.id && r.puntaje > 0);
            if (tieneRespuesta) respondidosCount++;
        });
    });

    // 3. Cálculos finales
    const isAreaCompleta = respondidosCount >= totalIndicadores;
    const porcentaje = Math.round((respondidosCount / totalIndicadores) * 100);

    return { 
        progresoActual: porcentaje > 100 ? 100 : porcentaje, 
        isAreaCompleta 
    };
  }, [areaActual, respuestas]);

  
  // --- LÓGICA DE NAVEGACIÓN ---
  const esUltimaPagina = paginaActual === totalPaginas - 1;
  const puedeRetroceder = paginaActual > 0 && !guardando;
  
  // CORRECCIÓN SOLICITADA:
  // Añadimos '!esUltimaPagina' a la condición.
  // Esto hará que el botón se deshabilite automáticamente al llegar al final,
  // evitando que el usuario intente "avanzar" más allá o causar conflictos con el botón de "Finalizar Evaluación".
  const puedeAvanzar = !guardando && isAreaCompleta && !esUltimaPagina;

  // Cálculo del progreso global para la barra superior
  const progresoGlobal = totalPaginas > 0 
    ? ((paginaActual + (isAreaCompleta ? 1 : 0)) / totalPaginas) * 100 
    : 0;

  const handleSiguiente = () => {
    if (!esUltimaPagina) {
        setPaginaActual(p => p + 1);
    }
  };

  // Si no hay datos, no renderizar nada para evitar errores
  if (!areaActual) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/30">
      
      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-32">
        <div
          key={`area-${paginaActual}`}
          className="animate-in fade-in slide-in-from-right-8 duration-500 ease-out"
        >
          {renderBloque(areaActual)}
        </div>
      </main>

      {/* --- BARRA DE NAVEGACIÓN (DOCK) --- */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        
        {/* Barra de Progreso Lineal Superior */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
            <div 
                className="h-full bg-indigo-600 transition-all duration-700 ease-out"
                style={{ width: `${progresoGlobal}%` }}
            />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            
            {/* 1. BOTÓN ANTERIOR */}
            <Button
              onPress={() => setPaginaActual(p => p - 1)}
              isDisabled={!puedeRetroceder}
              className={cn(
                "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 shadow-indigo-100",
                !puedeRetroceder && "opacity-40 cursor-not-allowed"
              )}
              startContent={<ChevronLeftIcon className="w-5 h-5" />}
            >
              Anterior
            </Button>

            {/* 2. INDICADOR CENTRAL (Stepper) */}
            <div className="flex flex-col items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">
                    Área {paginaActual + 1} de {totalPaginas}
                </span>
                <div className="flex gap-1.5 mt-1">
                    {estructura?.areas?.map((_: any, idx: number) => {
                        const isActive = idx === paginaActual;
                        const isPast = idx < paginaActual;
                        return (
                            <div 
                                key={idx}
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-300",
                                    isActive ? "w-6 bg-indigo-600" :
                                    isPast ? "w-1.5 bg-indigo-200" :
                                    "w-1.5 bg-slate-200 dark:bg-slate-700"
                                )}
                            />
                        )
                    })}
                </div>
            </div>

            {/* 3. BOTÓN SIGUIENTE / FINALIZAR */}
            <Button
              onPress={handleSiguiente}
              isDisabled={!puedeAvanzar}
              className={cn(
                "font-semibold shadow-md transition-all duration-200 min-w-[120px]",
                puedeAvanzar 
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 shadow-indigo-100" 
                    : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 border border-slate-200 dark:border-slate-700 cursor-not-allowed"
              )}
              endContent={
                // Ocultamos el icono si estamos guardando O si es la última página (para que se vea limpio)
                (guardando || esUltimaPagina) ? null : <ChevronRightIcon className="w-4 h-4" />
              }
            >
              {guardando 
                ? "Guardando..." 
                : esUltimaPagina
                    ? "Última Área" // Texto informativo en lugar de acción
                    : "Siguiente"
              }
            </Button>

          </div>
        </div>
      </footer>

    </div>
  );
}