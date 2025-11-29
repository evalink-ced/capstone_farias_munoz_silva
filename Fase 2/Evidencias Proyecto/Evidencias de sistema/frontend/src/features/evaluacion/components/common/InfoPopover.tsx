import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoPopoverProps {
  content: string;
  className?: string;
}

export default function InfoPopover({ content, className }: InfoPopoverProps) {
  return (
    <Popover placement="top" showArrow={true} offset={10}>
      <PopoverTrigger>
        <button
          type="button"
          aria-label="Más información"
          className={cn(
            // Layout base
            "group inline-flex items-center justify-center rounded-full transition-all duration-200 outline-none",
            // Tamaño
            "w-6 h-6",
            // Colores: Gris sutil por defecto -> Indigo suave en hover
            "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50",
            // Accesibilidad
            "focus-visible:ring-2 focus-visible:ring-indigo-500",
            className
          )}
        >
          <Info className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
        </button>
      </PopoverTrigger>
      
      <PopoverContent className="max-w-xs p-4 bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl dark:bg-slate-900/95 dark:border-slate-800">
        <div className="space-y-2">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Información
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {content}
            </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}