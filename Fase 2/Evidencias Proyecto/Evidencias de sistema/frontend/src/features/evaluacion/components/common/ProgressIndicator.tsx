import { Loader2, CheckCircle2, ChevronRight, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const isComplete = progresoArea === 100;

  // Cálculo del mini-círculo
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progresoArea / 100) * circumference;

  return (
    <div className="fixed bottom-24 right-4 sm:bottom-28 sm:right-8 z-[60] animate-in slide-in-from-bottom-10 fade-in duration-700 ease-out pointer-events-none sm:pointer-events-auto">
      
      {/* CÁPSULA PRINCIPAL ADAPTATIVA */}
      <div className={cn(
        "flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 pr-4 sm:pr-5 rounded-full shadow-2xl transition-all duration-300 pointer-events-auto",
        
        // --- ESTILOS BASE (LIGHT MODE) ---
        "bg-white/90 backdrop-blur-md text-slate-900 border border-slate-200", 
        "shadow-slate-200/50", // Sombra suave en light mode
        
        // --- ESTILOS DARK MODE ---
        "dark:bg-slate-900/90 dark:text-white dark:border-slate-700/50",
        "dark:shadow-black/50", // Sombra fuerte en dark mode
        
        // --- HOVER EFFECTS (Adaptativos) ---
        "hover:scale-105",
        "hover:border-indigo-500/30 hover:shadow-indigo-500/10", // Hover Light
        "dark:hover:border-indigo-500/50 dark:hover:shadow-indigo-500/20", // Hover Dark
        
        // --- Estado Guardando ---
        guardando && "ring-2 ring-indigo-500/30 dark:ring-indigo-500/50"
      )}>
        
        {/* 1. Icono de Progreso (Izquierda) */}
        <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10">
            {guardando ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
            ) : isComplete ? (
                <div className="bg-emerald-500 rounded-full p-1 animate-in zoom-in shadow-sm">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
            ) : (
                /* Mini Ring SVG */
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 24 24">
                    {/* Track: Gris claro en light, Gris oscuro en dark */}
                    <circle 
                        cx="12" cy="12" r={radius} fill="none" strokeWidth="2.5" 
                        className="stroke-slate-200 dark:stroke-slate-700" 
                    />
                    {/* Progress: Indigo fuerte en light, Indigo brillante en dark */}
                    <circle
                        cx="12" cy="12" r={radius} fill="none" strokeWidth="2.5" strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="stroke-indigo-600 dark:stroke-indigo-400 transition-all duration-500 ease-out"
                    />
                </svg>
            )}
            
            {/* Texto de porcentaje (Adaptativo) */}
            {!guardando && !isComplete && (
                <span className="absolute text-[8px] font-bold text-slate-600 dark:text-slate-300">
                    {Math.round(progresoArea)}
                </span>
            )}
        </div>

        {/* 2. Información de Texto (Centro) */}
        <div className="flex flex-col min-w-[100px] sm:min-w-[120px]">
            <div className="flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-indigo-500 dark:text-indigo-400 hidden sm:block" />
                
                {/* Etiqueta pequeña (UPPERCASE) */}
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                    {guardando ? "Sincronizando..." : isComplete ? "Completado" : "Progreso"}
                </span>
            </div>
            
            {/* Nombre del Área (Texto Principal) */}
            <span className="text-xs sm:text-sm font-bold truncate max-w-[140px] sm:max-w-[180px] text-slate-900 dark:text-slate-100">
                {area.n_area}
            </span>
        </div>

        {/* 3. Decoración (Derecha) */}
        {!isComplete && (
            <div className="pl-2 border-l border-slate-200 dark:border-slate-700 hidden sm:block">
                <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </div>
        )}
      </div>

    </div>
  );
}