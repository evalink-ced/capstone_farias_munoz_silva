import { RadioGroup, useRadio, RadioProps } from "@heroui/radio";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils"; 
// --- 1. Tarjeta "Soft UI" (Más redonda y color Indigo) ---
const SoftSelectionCard = (props: RadioProps & { label: string; score: number; description: string }) => {
  const { Component, isSelected, getBaseProps, getInputProps } = useRadio(props);

  return (
    <Component {...getBaseProps()} className="cursor-pointer h-full group outline-none">
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>

      <div className={cn(
        "relative flex flex-col h-full p-5 transition-all duration-300 text-left",
        // FORMA: Bordes muy redondeados (rounded-3xl)
        "rounded-3xl border-2", 
        
        // ESTADOS DE COLOR (INDIGO):
        isSelected 
          ? "border-indigo-500 bg-indigo-50/50 shadow-md shadow-indigo-100 scale-[1.02]" // Activo: Indigo suave
          : "border-slate-100 bg-white hover:border-indigo-200 hover:bg-slate-50 hover:shadow-sm" // Inactivo: Limpio
      )}>
        
        {/* Header: Label y Check */}
        <div className="flex items-center justify-between mb-4">
            <span className={cn(
                "text-[10px] font-bold px-3 py-1 uppercase tracking-widest transition-colors",
                // BADGE: Completamente redondo (rounded-full)
                "rounded-full",
                isSelected 
                    ? "bg-indigo-600 text-white shadow-sm" // Badge activo fuerte
                    : "bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
            )}>
                {props.label}
            </span>
            
            {/* Icono de Selección */}
            <div className={cn(
                "transition-all duration-300",
                isSelected ? "text-indigo-600 scale-100 opacity-100" : "text-slate-200 scale-90 opacity-0"
            )}>
                <CheckCircle2 className="w-6 h-6 fill-indigo-50" />
            </div>
        </div>

        {/* Descripción */}
        <div className="flex-1">
            <p className={cn(
                "text-sm leading-relaxed transition-colors",
                isSelected ? "text-indigo-950 font-medium" : "text-slate-600"
            )}>
                {props.description}
            </p>
        </div>

        {/* Footer: Puntaje */}
        <div className="mt-5 pt-3 border-t border-dashed border-slate-200/60 flex justify-end">
             <span className={cn(
                 "text-xs font-bold px-2 py-1 rounded-lg transition-colors",
                 isSelected ? "text-indigo-700 bg-indigo-100/50" : "text-slate-400"
             )}>
                {props.score} pts
             </span>
        </div>

      </div>
    </Component>
  );
};

// --- 2. Fila Contenedora (Rounded) ---
const IndicadorRow = ({ 
    indicador, 
    puntajeActual, 
    isCompleted, 
    manejarCambioPuntaje 
}: { 
    indicador: any, 
    puntajeActual: number, 
    isCompleted: boolean,
    manejarCambioPuntaje: any 
}) => {
    return (
        <div className={cn(
            "p-6 md:p-8 transition-all duration-500",
            // CONTENEDOR: Super redondeado también
            "rounded-[2rem] border",
            isCompleted 
                ? "bg-slate-50/50 border-transparent" // Desvanece sutilmente al completar
                : "bg-white border-slate-100 shadow-sm"
        )}>
            {/* Header: Pregunta */}
            <div className="flex gap-5 mb-8">
                 {/* Badge del número: Círculo perfecto */}
                 <div className={cn(
                    "flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold border-2 transition-all duration-300",
                    isCompleted 
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200" // Éxito = Indigo
                        : "bg-white text-slate-400 border-slate-100"
                )}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : indicador.numero}
                </div>
                
                <div className="pt-1">
                    <h3 className={cn(
                        "text-lg font-semibold leading-snug transition-colors",
                        isCompleted ? "text-slate-600" : "text-slate-900"
                    )}>
                        {indicador.indicador}
                    </h3>
                    {indicador.definicion && (
                        <p className="mt-2 text-sm text-slate-500 max-w-3xl leading-relaxed">
                            {indicador.definicion}
                        </p>
                    )}
                </div>
            </div>

            {/* Grid de Opciones */}
            <RadioGroup
                className="w-full"
                value={puntajeActual.toString()}
                onValueChange={(val) => manejarCambioPuntaje(indicador.id, parseInt(val))}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {indicador.nvlindicadores
                        .sort((a: any, b: any) => b.puntaje - a.puntaje)
                        .map((nivel: any) => (
                            <SoftSelectionCard
                                key={nivel.nvl}
                                value={nivel.puntaje.toString()}
                                label={nivel.nombre}
                                score={nivel.puntaje}
                                description={nivel.descripcion}
                            />
                    ))}
                </div>
            </RadioGroup>
        </div>
    );
};

// --- 3. Componente Principal ---
export default function CompetenciaCompacta({
  competencia,
  obtenerPuntaje,
  manejarCambioPuntaje,
  estaRespondido,
}: any) {
  return (
    <div className="space-y-10 pb-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b ml-4 mt-2 border-slate-100">
            <div>
                 <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{competencia.name}</h2>
                 <p className="text-slate-500 mt-2 text-base">
                    Selecciona la opción que mejor describa el desempeño.
                 </p>
            </div>
            
            {/* Opcional: Indicador de progreso visual "Pill" */}
            <div className="mt-4 md:mt-0 px-4 py-2 bg-slate-50 rounded-full border border-slate-100 text-sm font-medium text-slate-600">
                {competencia.indicadores.filter((i:any) => estaRespondido(i.id)).length} / {competencia.indicadores.length} Completados
            </div>
        </header>

        <div className="space-y-8">
            {competencia.indicadores.map((indicador: any) => (
                <IndicadorRow
                    key={indicador.id}
                    indicador={indicador}
                    puntajeActual={obtenerPuntaje(indicador.id)}
                    isCompleted={estaRespondido(indicador.id)}
                    manejarCambioPuntaje={manejarCambioPuntaje}
                />
            ))}
        </div>
    </div>
  );
}