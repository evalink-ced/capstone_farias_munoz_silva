import { Card, CardHeader, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

import { EvaluationUtils } from "@/features/evaluacion/constants/defaults";

export interface AutoevaluacionSubordinado {
  id: number;
  persona: { id: number; first_name: string; last_name: string; email: string };
  tipo_evaluacion: { id: number; n_tipo_evaluacion: string };
  completado: boolean;
  logro_obtenido: number | string;
  fecha_inicio: string;
  fecha_ultima_modificacion: string | null;
}

export default function EnhancedUserCard({
  autoevaluacion,
  nombreCompleto,
  onVer,
}: {
  autoevaluacion: AutoevaluacionSubordinado;
  nombreCompleto: (persona: {
    first_name: string;
    last_name: string;
  }) => string;
  onVer: () => void;
}) {
  const fechaInicio = new Date(autoevaluacion.fecha_inicio);
  const fechaModificacion = autoevaluacion.fecha_ultima_modificacion
    ? new Date(autoevaluacion.fecha_ultima_modificacion)
    : null;

  const getInitials = (persona: { first_name: string; last_name: string }) =>
    `${persona.first_name.charAt(0)}${persona.last_name.charAt(0)}`.toUpperCase();

  const logroObtenido = (() => {
    const valor: any = autoevaluacion.logro_obtenido as any;

    if (typeof valor === "number") return valor;
    if (typeof valor === "string") {
      const parsed = parseFloat(valor.replace?.(",", ".") ?? valor);

      return isNaN(parsed) ? 0 : parsed;
    }

    return 0;
  })();

  const getStatusInfo = (a: AutoevaluacionSubordinado) => {
    if (a.completado) {
      const evaluationInfo = EvaluationUtils.getEvaluationInfo(logroObtenido);

      return {
        color: evaluationInfo.color as any,
        text: evaluationInfo.text,
        bgColor: evaluationInfo.bgColor,
      };
    }

    return {
      color: "warning" as const,
      text: "Pendiente",
      bgColor: "bg-amber-500",
    };
  };

  const statusInfo = getStatusInfo(autoevaluacion);

  return (
    <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-slate-800/90">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4 w-full">
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">
                {getInitials(autoevaluacion.persona)}
              </span>
            </div>
            <div
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${statusInfo.bgColor} flex items-center justify-center`}
            >
              {autoevaluacion.completado ? (
                <CheckCircleIcon className="w-3 h-3 text-white" />
              ) : (
                <ClockIcon className="w-3 h-3 text-white" />
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-800 dark:text-white text-lg truncate">
              {nombreCompleto(autoevaluacion.persona)}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
              {autoevaluacion.persona.email}
            </p>
            <div className="mt-2">
              <Chip
                className="font-medium"
                color={statusInfo.color}
                size="sm"
                variant="flat"
              >
                {statusInfo.text}
              </Chip>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        {autoevaluacion.completado && logroObtenido > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Logro obtenido
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-white">
                {logroObtenido.toFixed(1)}%
              </span>
            </div>
            <Progress
              className="mb-1"
              color={statusInfo.color}
              size="sm"
              value={logroObtenido}
            />
          </div>
        )}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <CalendarDaysIcon className="w-4 h-4" />
            <span>Iniciado: {fechaInicio.toLocaleDateString("es-CL")}</span>
          </div>
          {fechaModificacion && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <ClockIcon className="w-4 h-4" />
              <span>
                Última modificación:{" "}
                {fechaModificacion.toLocaleDateString("es-CL")}
              </span>
            </div>
          )}
        </div>
        <Button
          className="w-full font-medium"
          color="primary"
          endContent={<EyeIcon className="w-4 h-4" />}
          size="sm"
          variant="flat"
          onPress={onVer}
        >
          {autoevaluacion.completado ? "Ver evaluación" : "Revisar progreso"}
        </Button>
      </CardBody>
    </Card>
  );
}
