import { ReactNode } from "react";
import { Loader2, Cloud } from "lucide-react"; 
import { useEvaluacionFormularioBase } from "./hooks/useEvaluacionFormularioBase";
import { cn } from "@/lib/utils";

interface EvaluacionFormularioBaseProps {
  evaluacionId: number;
  tipoEvaluacion: "autoevaluacion" | "evaluacion";
  renderPaginacion: (props: any) => ReactNode;
}

// 1. Componente de UI para el Estado de Carga (Skeleton)
const FormularioSkeleton = () => (
  <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8 animate-pulse">
    {/* Header Skeleton */}
    <div className="space-y-4">
      <div className="h-8 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800/50 rounded-md" />
    </div>
    {/* Content Skeleton */}
    <div className="grid gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-40 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800" />
      ))}
    </div>
  </div>
);

// 2. Indicador de Guardado (Elevado para no tapar la paginación)
const AutoSaveIndicator = ({ 
  guardando, 
  guardadoExitoso 
}: { 
  guardando: boolean; 
  guardadoExitoso: boolean 
}) => {
  // Solo mostramos si está pasando algo
  if (!guardando && !guardadoExitoso) return null;

  return (
    <div 
      className={cn(
        // POSICIÓN CLAVE:
        // 'bottom-24': Lo sube 96px, suficiente para limpiar la barra de paginación.
        // 'left-6': Lo ponemos a la izquierda para equilibrar el indicador de progreso que está a la derecha.
        // O si prefieres todo a la derecha, usa 'right-6' pero apilado. Aquí sugiero izquierda para balancear.
        "fixed bottom-24 left-4 sm:bottom-28 sm:left-8 z-40 transition-all duration-500 ease-out transform",
        guardando ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        guardadoExitoso && "translate-y-0 opacity-100"
      )}
    >
      <div className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-full shadow-xl border backdrop-blur-md text-xs font-bold uppercase tracking-wider transition-colors duration-300",
        // Estilo adaptativo (Light/Dark)
        guardando 
          ? "bg-white/90 border-indigo-100 text-indigo-600 dark:bg-slate-900/90 dark:border-indigo-900 dark:text-indigo-400" 
          : "bg-emerald-50/90 border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-900/50 dark:text-emerald-400"
      )}>
        {guardando && (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Sincronizando...</span>
          </>
        )}
        
        {!guardando && guardadoExitoso && (
          <>
            <Cloud className="w-3.5 h-3.5" />
            <span>Guardado en la nube</span>
          </>
        )}
      </div>
    </div>
  );
};

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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <FormularioSkeleton />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/30">
      
      <main className="w-full mx-auto transition-all duration-300 ease-in-out">
        {renderPaginacion({
          evaluacionId,
          estructura,
          respuestas,
          actualizarPuntaje,
          paginaActual,
          tipoEvaluacion,
          guardando,
        })}
      </main>

      {/* Indicador Flotante (Ahora a la IZQUIERDA y ELEVADO) */}
      <AutoSaveIndicator guardando={guardando} guardadoExitoso={guardadoExitoso} />
      
    </div>
  );
}