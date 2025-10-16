import { Chip, Tooltip } from "@heroui/react";
import type { EstadoEvaluacion } from "@/features/evaluacion/types/evaluacion";

interface EstadoEvaluacionBadgeProps {
  estado: EstadoEvaluacion;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "bordered" | "light" | "flat" | "faded" | "shadow";
}

const estadoConfig = {
  pendiente: {
    color: "warning" as const,
    label: "Pendiente",
    icon: "⏳"
  },
  retroalimentar: {
    color: "primary" as const,
    label: "Retroalimentar",
    icon: "💬"
  },
  firmar: {
    color: "warning" as const,
    label: "Firmar",
    icon: "✍️"
  },
  finalizado: {
    color: "success" as const,
    label: "Finalizado",
    icon: "✅"
  },
  // Agregar compatibilidad con estados antiguos mapeándolos a los nuevos
  completado: {
    color: "primary" as const,
    label: "Retroalimentar",
    icon: "💬"
  },
  retroalimentacion: {
    color: "primary" as const,
    label: "Retroalimentar", 
    icon: "💬"
  },
  cerrado_para_firma: {
    color: "warning" as const,
    label: "Firma",
    icon: "✍️"
  },
  firmado: {
    color: "success" as const,
    label: "Finalizado",
    icon: "✅"
  },
  firmado_obs: {
    color: "success" as const,
    label: "Finalizado",
    icon: "✅"
  }
};

function getTooltipContent(estado: EstadoEvaluacion): string {
  switch (estado) {
    case "pendiente":
      return "La jefatura debe completar la evaluación";
    case "retroalimentar":
      return "Evaluación completada, pendiente de retroalimentación";
    case "firmar":
      return "pendiente firma del trabajador ";
    case "finalizado":
      return "Proceso completado";
    default:
      return "Estado desconocido";
  }
}

export function EstadoEvaluacionBadge({
  estado,
  size = "md",
  variant = "flat"
}: EstadoEvaluacionBadgeProps) {
  const config = estadoConfig[estado as keyof typeof estadoConfig];

  // Si no se encuentra el estado, usar un estado por defecto
  if (!config) {
    console.warn(`Estado no reconocido: ${estado}`);
    const defaultConfig = {
      color: "default" as const,
      label: "Desconocido",
      icon: "❓"
    };
    
    return (
      <Tooltip content="Estado no reconocido" className="text-xs">
        <Chip
          color={defaultConfig.color}
          size={size}
          variant={variant}
          startContent={<span className="text-xs">{defaultConfig.icon}</span>}
        >
          {defaultConfig.label}
        </Chip>
      </Tooltip>
    );
  }

  const tooltipContent = getTooltipContent(estado);

  return (
    <Tooltip content={tooltipContent} className="text-xs">
      <Chip
        color={config.color}
        size={size}
        variant={variant}
        startContent={<span className="text-xs">{config.icon}</span>}
      >
        {config.label}
      </Chip>
    </Tooltip>
  );
}