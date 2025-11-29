import { useRadio, RadioProps } from "@heroui/radio";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { cn } from "@/lib/utils"; // Tu utilidad de clases

interface RadioNivelCompactoProps extends RadioProps {
  nombre: string;
  descripcion: string;
  puntaje: number;
}

export default function RadioNivelCompacto({
  nombre,
  descripcion,
  puntaje,
  ...props
}: RadioNivelCompactoProps) {
  const { Component, getBaseProps, getInputProps, isSelected } = useRadio(props);

  return (
    <Component
      {...getBaseProps()}
      className={cn(
        // --- 1. Base Container ---
        "group relative flex flex-col p-5 w-full min-h-[140px] cursor-pointer outline-none",
        "transition-all duration-300 ease-out",
        "border-2", // Borde siempre visible para evitar saltos de layout
        
        // --- 2. Forma "Soft UI" ---
        "rounded-3xl", // Bordes muy redondeados
        
        // --- 3. Estados de Color (Inactivo vs Activo) ---
        isSelected
          ? "border-indigo-500 bg-indigo-50/60 shadow-md shadow-indigo-100/50" // Activo: Indigo suave
          : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50 hover:shadow-sm", // Inactivo: Limpio
        
        // --- 4. Focus ---
        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
      )}
    >
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>

      {/* Header: Radio + Puntaje */}
      <div className="flex items-start justify-between mb-4">
        
        {/* Radio Button Visual (Custom) */}
        <div className={cn(
          "relative flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-300",
          isSelected
            ? "border-indigo-600 bg-indigo-600 scale-110" // Activo
            : "border-slate-300 bg-transparent group-hover:border-indigo-300" // Inactivo
        )}>
          {/* Dot central animado */}
          <div className={cn(
            "w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-all duration-300 transform",
            isSelected ? "scale-100 opacity-100" : "scale-0 opacity-0"
          )} />
        </div>

        {/* Badge de Puntaje */}
        <div className={cn(
            "text-xs font-bold px-3 py-1 rounded-full transition-colors",
            isSelected 
                ? "bg-indigo-600 text-white" 
                : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
        )}>
          {puntaje} pts
        </div>
      </div>

      {/* Contenido de Texto */}
      <div className="flex flex-col gap-2">
        {/* Título */}
        <div className={cn(
            "text-sm font-bold uppercase tracking-wider transition-colors",
            isSelected ? "text-indigo-900" : "text-slate-700"
        )}>
          {nombre}
        </div>

        {/* Descripción */}
        <div className={cn(
            "text-sm leading-relaxed transition-colors",
            isSelected ? "text-indigo-900/80 font-medium" : "text-slate-500"
        )}>
          {descripcion}
        </div>
      </div>
      
    </Component>
  );
}