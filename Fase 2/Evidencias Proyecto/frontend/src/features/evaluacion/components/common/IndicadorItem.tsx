import { RadioGroup } from "@heroui/radio";
import clsx from "clsx";
import { JSX } from "react";

import InfoPopover from "./InfoPopover";

import { NivelLogro } from "@/features/evaluacion/types/evaluacion";

interface RadioNivelProps {
  radioKey: string;
  value: string;
  nombre: string;
  descripcion: string;
  puntaje: number;
}

interface IndicadorItemProps {
  indicador: {
    id: number;
    numero: number;
    indicador: string;
    definicion?: string;
    nvlindicadores: NivelLogro[];
  };
  obtenerPuntaje: (indicadorId: number) => number;
  manejarCambioPuntaje: (indicadorId: number, puntaje: number) => void;
  estaRespondido: (indicadorId: number) => boolean;
  renderRadioNivel: (props: RadioNivelProps) => JSX.Element;
}


export default function IndicadorItem({
  indicador,
  obtenerPuntaje,
  manejarCambioPuntaje,
  estaRespondido,
  renderRadioNivel,
}: IndicadorItemProps) {
  const puntajeActual = obtenerPuntaje(indicador.id);
  const isCompleted = estaRespondido(indicador.id);

  return (
    <article className="group relative default/95 hover:default transition-all duration-300 hover:shadow-lg hover:shadow-black/5">
      {/* Status indicator bar - Thinner for small screens */}
      <div className={clsx(
        "absolute left-0 top-0 bottom-0 w-1 xs:w-1.5 transition-all duration-300",
        isCompleted 
          ? "bg-gradient-to-b from-emerald-400 to-emerald-600" 
          : "bg-gradient-to-b from-amber-400 to-amber-600"
      )} />

      <div className="pl-3 xs:pl-4 sm:pl-6 pr-2 xs:pr-3 sm:pr-4 py-3 xs:py-4 sm:py-6">
        {/* Header section - Optimized for ultra small screens */}
        <header className="flex items-start justify-between gap-2 xs:gap-3 mb-2 xs:mb-3 sm:mb-4">
          <div className="flex items-start gap-2 xs:gap-3 flex-1 min-w-0">
            {/* Indicator number - Smaller for ultra small screens */}
            <div className="flex-shrink-0 w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 bg-primary-100 text-primary-700 rounded-md xs:rounded-lg flex items-center justify-center">
              <span className="text-xs xs:text-sm sm:text-base font-bold">
                {indicador.numero}
              </span>
            </div>

            {/* Title and definition - Better text sizing */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-slate-800 leading-tight mb-1 xs:mb-2 break-words">
                {indicador.indicador}
              </h3>
              
              {indicador.definicion && (
                <div className="flex items-start gap-1 xs:gap-2">
                  <InfoPopover content={indicador.definicion} />
                  <p className="text-xs xs:text-sm text-slate-600 leading-relaxed break-words">
                    {indicador.definicion.length > 80 
                      ? `${indicador.definicion.substring(0, 80)}...` 
                      : indicador.definicion
                    }
                  </p>
                </div>
              )}
            </div>
          </div>


        </header>

        {/* Radio options section - Optimized spacing */}
        <section className="space-y-1 xs:space-y-2 sm:space-y-3">
          <RadioGroup
            value={puntajeActual.toString()}
            onValueChange={(value) => manejarCambioPuntaje(indicador.id, parseInt(value))}
            className="gap-1 xs:gap-2 sm:gap-3"
          >
            {indicador.nvlindicadores.map((nivel) => (
              <div 
                key={nivel.nvl} 
                className="w-full"
              >
                {renderRadioNivel({
                  radioKey: `${indicador.id}-${nivel.nvl}`,
                  value: nivel.puntaje.toString(),
                  nombre: nivel.nombre,
                  descripcion: nivel.descripcion,
                  puntaje: nivel.puntaje,
                })}
              </div>
            ))}
          </RadioGroup>
        </section>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </article>
  );
}
