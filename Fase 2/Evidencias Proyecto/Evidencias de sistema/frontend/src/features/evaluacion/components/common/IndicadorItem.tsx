import { RadioGroup } from "@heroui/radio";
import { CheckCircle2 } from "lucide-react"; // Iconos más limpios
import { JSX } from "react";
import { cn } from "@/lib/utils"; // Usando la utilidad que creamos/discutimos antes

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
    <article
      className={cn(
        "group relative rounded-xl border transition-all duration-200 ease-in-out scroll-mt-24",
        // Estados de la tarjeta (SaaS Style)
        isCompleted
          ? "bg-slate-50/50 border-emerald-200 shadow-sm" // Completado: Sutil, verde muy suave
          : "bg-white border-slate-200 hover:border-primary-300 hover:shadow-md", // Pendiente: Blanco limpio
        "focus-within:ring-2 focus-within:ring-primary-100 focus-within:border-primary-400" // Accesibilidad
      )}
    >
      <div className="p-5 sm:p-6">
        {/* Header: Número + Título + Estado */}
        <header className="flex gap-4 mb-6">
          {/* Badge del Número */}
          <div
            className={cn(
              "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors",
              isCompleted
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-600 group-hover:bg-primary-50 group-hover:text-primary-700"
            )}
          >
            {indicador.numero}
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <div className="flex justify-between items-start gap-4">
              <h3 className={cn(
                "text-base sm:text-lg font-semibold leading-tight transition-colors",
                isCompleted ? "text-slate-700" : "text-slate-900"
              )}>
                {indicador.indicador}
              </h3>
              
              {/* Icono de Estado (Check visual) */}
              {isCompleted && (
                <div className="animate-in fade-in zoom-in duration-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
              )}
            </div>

            {/* Definición / Contexto */}
            {indicador.definicion && (
              <div className="mt-2 flex items-center gap-2 text-slate-500">
                 {/* Popover más discreto */}
                <div className="opacity-70 hover:opacity-100 transition-opacity">
                   <InfoPopover content={indicador.definicion} />
                </div>
                <p className="text-sm leading-relaxed line-clamp-2 hover:line-clamp-none transition-all cursor-default">
                   {indicador.definicion}
                </p>
              </div>
            )}
          </div>
        </header>

        {/* Zona de Interacción (Radios) */}
        <section className={cn(
            "rounded-lg transition-all duration-300",
            !isCompleted && "bg-slate-50/50 p-4" // Highlight sutil para la zona de acción si no está respondida
        )}>
          <RadioGroup
            className="grid gap-3" // Grid gap consistente
            value={puntajeActual.toString()}
            onValueChange={(value) =>
              manejarCambioPuntaje(indicador.id, parseInt(value))
            }
          >
            {indicador.nvlindicadores.map((nivel) => (
              <div key={nivel.nvl} className="w-full relative z-10">
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
    </article>
  );
}