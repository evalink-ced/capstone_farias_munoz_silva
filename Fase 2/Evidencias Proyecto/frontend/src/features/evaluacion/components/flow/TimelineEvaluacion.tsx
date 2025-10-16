import { Card, CardBody, Chip, Button } from "@heroui/react";
import { EyeIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import type { EvaluacionJefe, EstadoEvaluacion } from "@/features/evaluacion/types/evaluacion";
import { EstadoEvaluacionBadge } from "./EstadoEvaluacionBadge";

interface TimelineEvaluacionProps {
  evaluacion: EvaluacionJefe;
  compact?: boolean;
  onOpen?: (id: number, firmado: boolean) => void;
  extractTexto?: (ev: EvaluacionJefe) => string | undefined;
}

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  date?: string;
  icon: string;
  color: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
}

function getTimelineSteps(evaluacion: EvaluacionJefe): TimelineStep[] {
  return [
    {
      id: "pendiente",
      title: "Pendiente",
      description: "La evaluación está en curso",
      completed: !!evaluacion.completado,
      icon: "⏳",
      color: "default"
    },
    {
      id: "retroalimentar",
      title: "Retroalimentación",
      description: "Completar retroalimentación escrita",
      completed: !!evaluacion.retroalimentacion,
      date: evaluacion.fecha_retroalimentacion || undefined,
      icon: "💬",
      color: "primary"
    },
    {
      id: "firmar",
      title: "Firmar Evaluación",
      description: "La evaluación está lista para ser firmada",
      completed: !!evaluacion.cerrado_para_firma,
      date: evaluacion.fecha_ultima_modificacion || undefined,
      icon: "🔒",
      color: "warning"
    },
    {
      id: "finalizado",
      title: "Finalizado",
      description: "La evaluación ha sido firmada y finalizada",
      completed: !!(evaluacion.firmado || evaluacion.firmado_obs),
      date: evaluacion.fecha_firma || undefined,
      icon: "✅",
      color: "success"
    }
  ];
}

function formatDate(dateString?: string | null): string {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getEstadoEvaluacion(evaluacion: EvaluacionJefe): EstadoEvaluacion {


  // Lógica actualizada para el sistema de 4 estados
  if (evaluacion.firmado || evaluacion.firmado_obs) return 'finalizado';
  if (evaluacion.retroalimentacion && evaluacion.cerrado_para_firma) return 'firmar';
  if (evaluacion.completado) return 'retroalimentar';
  return 'pendiente';
}

export function TimelineEvaluacion({ evaluacion, compact = false, onOpen }: TimelineEvaluacionProps) {
  const steps = getTimelineSteps(evaluacion);
  const estado = getEstadoEvaluacion(evaluacion);

  const handleOpenEvaluacion = () => {
    if (onOpen) {
      // Actualizado para el nuevo sistema de estados
      const estaFinalizado = !!(evaluacion.firmado || evaluacion.firmado_obs);
      onOpen(evaluacion.id, estaFinalizado);
    }
  };

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" isPressable onPress={handleOpenEvaluacion}>
        <CardBody className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-primary" />
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">
                    {evaluacion.persona?.first_name} {evaluacion.persona?.last_name}
                  </span>
                </div>
              </div>
              <EstadoEvaluacionBadge estado={estado} size="sm" />
            </div>
          </div>

          {/* Timeline compacto */}
          <div className="bg-default-50 rounded-lg p-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              {steps.map((step, index) => {
                const isLast = index === steps.length - 1;
                const isActive = step.completed;
                const isNext = !step.completed && (index === 0 ? !evaluacion.completado : steps[index - 1].completed);

                return (
                  <div key={step.id} className="flex items-center gap-2 flex-shrink-0">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isActive
                        ? "bg-success-100 text-success-600 border-2 border-success-500"
                        : isNext
                          ? "bg-primary-100 text-primary-600 border-2 border-primary-500"
                          : "bg-gray-100 text-gray-400 border-2 border-gray-300"
                        }`}
                    >
                      {step.icon}
                    </div>
                    {!isLast && (
                      <div className={`w-4 h-0.5 ${isActive ? "bg-success-300" : "bg-gray-200"
                        }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Información adicional */}
          {estado !== 'pendiente' && evaluacion.logro_obtenido !== undefined && evaluacion.logro_obtenido !== null && (
            <div className="mt-3 p-2 bg-success-50 rounded text-sm">
              <div className="flex items-center justify-between">
                <span className="text-success-700 font-medium">Porcentaje de Logro:</span>
                <span className="text-success-800 font-bold">{evaluacion.logro_obtenido}%</span>
              </div>
              <div className="mt-1 w-full bg-success-200 rounded-full h-2">
                <div
                  className="bg-success-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${evaluacion.logro_obtenido}%` }}
                ></div>
              </div>
            </div>
          )}

          {evaluacion.fecha_evaluacion && (
            <div className="mt-2 text-xs text-default-500">
              Período: {evaluacion.fecha_evaluacion}
            </div>
          )}

          {estado !== 'pendiente' && (
            <Button
              size="sm"
              variant="light"
              color="primary"
              startContent={<EyeIcon className="w-4 h-4" />}
              onPress={handleOpenEvaluacion}
            >
              Ver Evaluación
            </Button>
          )}
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">
              Progreso de la Evaluación - {evaluacion?.persona?.first_name} {evaluacion?.persona?.last_name}
            </h3>
          </div>
          <EstadoEvaluacionBadge estado={estado} />
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const isActive = step.completed;
            const isNext = !step.completed && (index === 0 || steps[index - 1].completed);

            return (
              <div key={step.id} className="flex items-start gap-4">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${isActive
                      ? "bg-success-100 text-success-600 border-2 border-success-500"
                      : isNext
                        ? "bg-primary-100 text-primary-600 border-2 border-primary-500"
                        : "bg-gray-100 text-gray-400 border-2 border-gray-300"
                      }`}
                  >
                    {step.icon}
                  </div>
                  {!isLast && (
                    <div
                      className={`w-0.5 h-12 ${isActive ? "bg-success-300" : "bg-gray-200"
                        }`}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  <div className="flex items-center gap-2 mb-1">
                    <h4
                      className={`text-base font-medium ${isActive
                        ? "text-success-700"
                        : isNext
                          ? "text-primary-700"
                          : "text-gray-500"
                        }`}
                    >
                      {step.title}
                    </h4>
                    {isActive && (
                      <Chip color={step.color} size="sm" variant="flat">
                        Completado
                      </Chip>
                    )}
                    {isNext && (
                      <Chip color="primary" size="sm" variant="flat">
                        Siguiente
                      </Chip>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                  {step.date && isActive && (
                    <p className="text-xs text-gray-500">
                      {formatDate(step.date)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {onOpen && (
          <div className="mt-4 pt-4 border-t border-default-200">
            <Button
              color="primary"
              variant="flat"
              startContent={<EyeIcon className="w-4 h-4" />}
              onPress={handleOpenEvaluacion}
              className="w-full"
            >
              Ver Evaluación Completa
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}