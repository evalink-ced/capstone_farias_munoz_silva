import { Progress } from "@heroui/progress";
import { CheckCircle2 } from "lucide-react";
import { JSX } from "react";
import { cn } from "@/lib/utils";

import { Competencia } from "@/features/evaluacion/types/evaluacion";
import IndicadorItem from "@/features/evaluacion/components/common/IndicadorItem";

interface RadioNivelProps {
  radioKey: string;
  value: string;
  nombre: string;
  descripcion: string;
  puntaje: number;
}

interface CompetenciaContentProps {
  competencia: Competencia;
  obtenerPuntaje: (indicadorId: number) => number;
  manejarCambioPuntaje: (indicadorId: number, puntaje: number) => void;
  estaRespondido: (indicadorId: number) => boolean;
  renderRadioNivel: (props: RadioNivelProps) => JSX.Element;
}

export default function CompetenciaContent({
  competencia,
  obtenerPuntaje,
  manejarCambioPuntaje,
  estaRespondido,
  renderRadioNivel,
}: CompetenciaContentProps) {
  // Cálculos de progreso
  const totalIndicadores = competencia.indicadores.length;
  const indicadoresRespondidos = competencia.indicadores.filter((ind) =>
    estaRespondido(ind.id)
  ).length;
  const progreso = (indicadoresRespondidos / totalIndicadores) * 100;
  const isCompleted = progreso === 100;

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. Header de Competencia (Estilo Notion/Linear)
        Limpio, sin fondo de tarjeta, enfocado en la tipografía.
        Usamos 'sticky' para que el contexto persista al hacer scroll.
      */}
      <header className="sticky top-0 z-30 -mx-4 px-4 py-4 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/60 sm:static sm:bg-transparent sm:border-none sm:p-0 sm:mx-0 transition-all">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {competencia.name}
            </h2>
            <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
               Evalúa los siguientes indicadores correspondientes a esta competencia.
            </p>
          </div>

          {/* Widget de Progreso Compacto */}
          <div className="flex flex-col items-end gap-2 min-w-[200px]">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className={cn(
                "transition-colors",
                isCompleted ? "text-emerald-600" : "text-slate-600"
              )}>
                {isCompleted ? "Completado" : "Progreso"}
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-900 font-bold">
                {indicadoresRespondidos} <span className="text-slate-400 font-normal">/ {totalIndicadores}</span>
              </span>
            </div>
            
            <Progress
              aria-label="Progreso de la competencia"
              size="sm"
              value={progreso}
              classNames={{
                base: "max-w-md",
                track: "drop-shadow-sm border border-slate-100 bg-white h-2.5",
                indicator: cn(
                  "bg-gradient-to-r transition-all duration-500 ease-out",
                  isCompleted 
                    ? "from-emerald-400 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" 
                    : "from-primary-500 to-primary-600"
                ),
              }}
            />
          </div>
        </div>
      </header>

      {/* 2. Grid de Indicadores 
        Aquí eliminamos la <Card> envolvente. Renderizamos directamente el IndicadorItem
        que ya tiene su propio diseño de tarjeta.
      */}
      <div className="grid gap-6">
        {competencia.indicadores.map((indicador, index) => (
          <div 
            key={indicador.id}
            // Animación escalonada simple (Stagger) usando clases nativas
            className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <IndicadorItem
              indicador={indicador}
              estaRespondido={estaRespondido}
              obtenerPuntaje={obtenerPuntaje}
              manejarCambioPuntaje={manejarCambioPuntaje}
              renderRadioNivel={renderRadioNivel}
            />
          </div>
        ))}
      </div>

      {/* 3. Empty State / Mensaje de finalización de sección
        Feedback visual al terminar la sección
      */}
      {isCompleted && (
        <div className="mt-8 flex items-center justify-center p-8 rounded-2xl bg-emerald-50/50 border border-emerald-100 border-dashed animate-in fade-in zoom-in duration-300">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-emerald-100 rounded-full text-emerald-600 mb-1">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-emerald-900 font-semibold">Competencia completada</h3>
            <p className="text-emerald-700/80 text-sm">
              Has respondido todos los indicadores de esta sección.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}