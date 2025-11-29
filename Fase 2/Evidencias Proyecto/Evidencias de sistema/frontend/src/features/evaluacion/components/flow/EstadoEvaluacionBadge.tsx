import type { EstadoEvaluacion } from "@/features/evaluacion/types/evaluacion";

import { Chip, Tooltip } from "@heroui/react";

interface EstadoEvaluacionBadgeProps {
  estado: EstadoEvaluacion;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "bordered" | "light" | "flat" | "faded" | "shadow";
}

const estadoConfig = {
  pendiente: {
    color: "warning" as const,
    label: "Pendiente",
    icon: "⏳",
  },
  retroalimentar: {
    color: "primary" as const,
    label: "Retroalimentar",
    icon: "💬",
  },
  firmar: {
    color: "warning" as const,
    label: "Aceptar",
    icon: "✍️",
  },
  finalizado: {
    color: "success" as const,
    label: "Finalizado",
    icon: "✅",
  },
  // Agregar compatibilidad con estados antiguos mapeándolos a los nuevos
  completado: {
    color: "primary" as const,
    label: "Retroalimentar",
    icon: "💬",
  },
  retroalimentacion: {
    color: "primary" as const,
    label: "Retroalimentar",
    icon: "💬",
  },
  cerrado_para_firma: {
    color: "warning" as const,
    label: "Aceptar",
    icon: "✍️",
  },
  firmado: {
    color: "success" as const,
    label: "Finalizado",
    icon: "✅",
  },
  firmado_obs: {
    color: "success" as const,
    label: "Finalizado",
    icon: "✅",
  },
};

function getTooltipContent(estado: EstadoEvaluacion): string {
  switch (estado) {
    case "pendiente":
      return "La jefatura debe completar la evaluación";
    case "retroalimentar":
      return "Evaluación completada, pendiente de retroalimentación";
    case "firmar":
      return "pendiente aceptación del trabajador ";
    case "finalizado":
      return "Proceso completado";
    default:
      return "Estado desconocido";
  }
}

export function EstadoEvaluacionBadge({
  estado,
  size = "md",
  variant = "flat",
}: EstadoEvaluacionBadgeProps) {
  const config = estadoConfig[estado as keyof typeof estadoConfig];

  // Si no se encuentra el estado, usar un estado por defecto
  if (!config) {
    console.warn(`Estado no reconocido: ${estado}`);
    const defaultConfig = {
      color: "default" as const,
      label: "Desconocido",
      icon: "❓",
    };

    return (
      <Tooltip className="text-xs" content="Estado no reconocido">
        <Chip
          color={defaultConfig.color}
          size={size}
          startContent={<span className="text-xs">{defaultConfig.icon}</span>}
          variant={variant}
        >
          {defaultConfig.label}
        </Chip>
      </Tooltip>
    );
  }

  const tooltipContent = getTooltipContent(estado);

  return (
    <Tooltip className="text-xs" content={tooltipContent}>
      <Chip
        color={config.color}
        size={size}
        startContent={<span className="text-xs">{config.icon}</span>}
        variant={variant}
      >
        {config.label}
      </Chip>
    </Tooltip>
  );
}
