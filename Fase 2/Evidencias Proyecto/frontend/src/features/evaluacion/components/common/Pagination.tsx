import { useState, ReactNode } from "react";
import { Button } from "@heroui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import { Respuesta } from "@/features/evaluacion/types/asignar/evaluacion";
import { AreaEvaluacion, Competencia } from "@/features/evaluacion/types/evaluacion";

interface PaginationProps {
  estructura: any;
  renderBloque: (areaActual: any) => ReactNode;
  titulo: string;
  respuestas?: Respuesta[];
  guardando?: boolean;
}

export default function Pagination({
  estructura,
  renderBloque,
  respuestas = [],
  guardando = false,
}: PaginationProps) {
  const [paginaActual, setPaginaActual] = useState(0);
  const totalPaginas = estructura.areas.length;

  const areaActual = estructura.areas[paginaActual];

  // Función corregida para calcular el progreso de un área específica
  const calcularProgresoArea = (area: AreaEvaluacion): number => {
    const totalIndicadoresArea = area.competencias.reduce(
      (acc: number, comp: Competencia) => acc + comp.indicadores.length,
      0,
    );

    // Corrección: contar indicadores únicos del área que tienen respuesta
    const indicadoresRespondidosArea = area.competencias.reduce((acc, comp) => {
      return acc + comp.indicadores.filter((ind) => {
        const respuesta = respuestas.find((r) => r.indicador === ind.id);
        return respuesta && respuesta.puntaje > 0;
      }).length;
    }, 0);

    return totalIndicadoresArea > 0 
      ? Math.round((indicadoresRespondidosArea / totalIndicadoresArea) * 100)
      : 0;
  };

  // Verificar si el área actual está completa
  const areaActualCompleta = calcularProgresoArea(areaActual) === 100;

  // Determinar si se puede avanzar
  const puedeAvanzar = !guardando && areaActualCompleta && paginaActual < totalPaginas - 1;

  const avanzar = () => {
    if (puedeAvanzar) {
      setPaginaActual(paginaActual + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const retroceder = () => {
    if (paginaActual > 0 && !guardando) {
      setPaginaActual(paginaActual - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-default-200 to-default-100/50">
      {/* Contenido principal */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 pb-20 sm:pb-24 lg:pb-28">
        <div
          key={`area-${paginaActual}`}
          className="animate-in fade-in-0 slide-in-from-right-4 duration-500"
        >
          {renderBloque(areaActual)}
        </div>
      </div>

      {/* Navegación flotante mejorada */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* Fondo con glassmorphism */}
        <div className="bg-default/40 backdrop-blur-xl border-t border-default-200/30 shadow-2xl">
          <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-2 sm:py-3 lg:py-4">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              {/* Botón Anterior */}
              <Button
                className={`
                  group relative overflow-hidden rounded-lg sm:rounded-xl transition-all duration-300 flex-shrink-0
                  ${paginaActual === 0 || guardando
                    ? "bg-default-300 text-default-800 cursor-not-allowed"
                    : "bg-gradient-to-r from-primary-500 to-primary-700 text-default hover:from-primary-600 hover:to-primary-700 hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5"
                  }
                `}
                isDisabled={paginaActual === 0 || guardando}
                size="sm"
                onPress={retroceder}
              >
                <div className="flex items-center gap-1 sm:gap-2 px-1 sm:px-2">
                  <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline font-medium text-sm">Anterior</span>
                </div>
                {paginaActual > 0 && !guardando && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                )}
              </Button>

              {/* Indicador central mejorado */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-center">
                <div className="bg-default-100/80 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5">
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm lg:text-base font-semibold text-default-700">
                    <span>{paginaActual + 1}</span>
                    <span className="text-default-400">/</span>
                    <span>{totalPaginas}</span>
                  </div>
                </div>

                {/* Indicadores de página con estado de completado */}
                <div className="flex gap-1 sm:gap-1.5">
                  {Array.from({ length: Math.min(totalPaginas, 5) }, (_, index) => {
                    const pageIndex = totalPaginas <= 5 ? index :
                      paginaActual < 3 ? index :
                        paginaActual > totalPaginas - 3 ? totalPaginas - 5 + index :
                          paginaActual - 2 + index;

                    const areaProgreso = calcularProgresoArea(estructura.areas[pageIndex]);
                    const areaCompleta = areaProgreso === 100;

                    return (
                      <div
                        key={pageIndex}
                        className={`w-1 h-1 sm:w-1.5 sm:h-1.5 lg:w-2 lg:h-2 rounded-full transition-all duration-300 ${
                          pageIndex === paginaActual
                            ? "bg-primary-600 scale-125"
                            : areaCompleta
                              ? "bg-success-500 scale-100"
                              : "bg-default-400 scale-100"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Botón Siguiente */}
              <Button
                className={`
                  group relative overflow-hidden rounded-lg sm:rounded-xl transition-all duration-300 flex-shrink-0
                  ${!puedeAvanzar
                    ? "bg-default-300 text-default-800 cursor-not-allowed"
                    : "bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5"
                  }
                `}
                isDisabled={!puedeAvanzar}
                size="sm"
                onPress={avanzar}
                title={
                  guardando 
                    ? "Espera a que se guarden los cambios"
                    : !areaActualCompleta 
                      ? "Completa el área actual para continuar"
                      : paginaActual === totalPaginas - 1
                        ? "Última área"
                        : "Siguiente área"
                }
              >
                <div className="flex items-center gap-1 sm:gap-2 px-1 sm:px-2">
                  <span className="hidden sm:inline font-medium text-sm">
                    {guardando ? "Guardando..." : "Siguiente"}
                  </span>
                  <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                {puedeAvanzar && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
