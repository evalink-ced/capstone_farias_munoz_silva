import { useRadio, RadioProps } from "@heroui/radio";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils"; // Asegúrate de tener esta utilidad (clsx + tailwind-merge)

interface CustomRadioNivelProps extends RadioProps {
  nombre: string;
  descripcion: string;
  puntaje: number;
}

// Configuración de estilos fuera del componente para evitar re-cálculos y desorden
const VARIANTS = {
  emerald: {
    container: "data-[selected=true]:border-emerald-500 data-[selected=true]:bg-emerald-50/50",
    badge: "bg-emerald-100 text-emerald-700",
    icon: "text-emerald-500",
  },
  amber: {
    container: "data-[selected=true]:border-amber-500 data-[selected=true]:bg-amber-50/50",
    badge: "bg-amber-100 text-amber-700",
    icon: "text-amber-500",
  },
  // Puedes agregar más variantes si lo necesitas (blue, red, etc.)
};

export const CustomRadioNivel = ({
  nombre,
  descripcion,
  puntaje,
  ...props
}: CustomRadioNivelProps) => {
  const { Component, isSelected, getBaseProps, getInputProps, getLabelProps } = useRadio(props);

  // Lógica simplificada de color: Alto rendimiento vs Bajo rendimiento
  // En SaaS, menos colores = más claridad.
  const colorScheme = puntaje >= 3 ? "emerald" : "amber";
  const styles = VARIANTS[colorScheme];

  return (
    <Component
      {...getBaseProps()}
      className={cn(
        // Base Layout & Typo
        "group relative flex w-full cursor-pointer select-none items-start gap-4 rounded-xl border p-4 transition-all duration-200",
        // Default State (Unselected)
        "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50",
        // Focus States (Accessibility)
        "focus-within:ring-2 focus-within:ring-primary-100 focus-within:border-primary-500",
        // Selected State (Dynamic) applied via data attributes
        styles.container
      )}
    >
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>

      {/* 1. Icono de Estado (Radio Visual) */}
      {/* Reemplazamos los divs anidados por Iconos SVG limpios que son más nítidos */}
      <div className="mt-0.5 flex-shrink-0">
        {isSelected ? (
            <div className="animate-in zoom-in duration-200">
                <CheckCircle2 className={cn("h-5 w-5", styles.icon)} />
            </div>
        ) : (
            <Circle className="h-5 w-5 text-slate-300 group-hover:text-slate-400 transition-colors" />
        )}
      </div>

      {/* 2. Contenido de Texto */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h3
            {...getLabelProps()}
            className={cn(
              "text-base font-medium text-slate-700 transition-colors",
              isSelected && "text-slate-900 font-semibold"
            )}
          >
            {nombre}
          </h3>

          {/* Badge de Puntaje - Minimalista */}
          <span
            className={cn(
              "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-black/5 transition-colors",
              isSelected ? styles.badge : "bg-slate-100 text-slate-600"
            )}
          >
            {puntaje} pts
          </span>
        </div>

        <p className={cn(
            "text-sm leading-relaxed transition-colors",
            isSelected ? "text-slate-600" : "text-slate-500"
        )}>
          {descripcion}
        </p>
      </div>

      {/* 3. Borde Activo (Overlay opcional para "pop" extra) */}
      {/* Este div crea un borde interior extra cuando está seleccionado, técnica usada por Stripe/Vercel */}
      <div 
        className={cn(
            "absolute inset-0 rounded-xl pointer-events-none transition-all duration-200",
            isSelected ? "border-2 border-transparent" : "border border-transparent"
        )} 
        style={{ 
            borderColor: isSelected ? 'currentColor' : undefined,
            color: isSelected && colorScheme === 'emerald' ? 'rgba(16, 185, 129, 0.1)' : 'transparent' // Truco visual sutil
        }}
      />
    </Component>
  );
};