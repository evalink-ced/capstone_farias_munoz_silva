import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { EstadoEvaluacionBadge } from "./EstadoEvaluacionBadge";
import { AccionesEvaluacionFlow } from "./AccionesEvaluacionFlow";
import type { EvaluacionJefe, EstadoEvaluacion } from "@/features/evaluacion/types/evaluacion";

interface ResumenEvaluacionFlowProps {
  evaluacion: EvaluacionJefe;
  onEvaluacionUpdate?: (evaluacion: EvaluacionJefe) => void;
  showActions?: boolean;
}

function getEstadoEvaluacion(evaluacion: EvaluacionJefe): EstadoEvaluacion {
  // Priorizar el nuevo campo estado_firma si existe
  
  // Lógica actualizada para el sistema de 4 estados
  if (evaluacion.firmado || evaluacion.firmado_obs) return 'finalizado';
  if (evaluacion.retroalimentacion && evaluacion.cerrado_para_firma) return 'firmar';
  if (evaluacion.completado) return 'retroalimentar';
  return 'pendiente';
}

function formatDate(dateString?: string | null): string {
  if (!dateString) return "No disponible";
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

export function ResumenEvaluacionFlow({
  evaluacion,
  onEvaluacionUpdate,
  showActions = true
}: ResumenEvaluacionFlowProps) {
  const estado = getEstadoEvaluacion(evaluacion);

  return (
    <Card>
      <CardHeader className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">
            Evaluación de {evaluacion.persona?.first_name} {evaluacion.persona?.last_name}
          </h3>
          <p className="text-sm text-gray-600">
            Fecha de evaluación: {formatDate(evaluacion.fecha_evaluacion)}
          </p>
        </div>
        <EstadoEvaluacionBadge estado={estado} />
      </CardHeader>
      <Divider />
      <CardBody>
        <div className="space-y-4">
          {/* Información del estado actual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Estado Actual</h4>
              <p className="text-sm">{evaluacion.estado_actual || "Pendiente"}</p>
            </div>
            
            {evaluacion.fecha_reunion && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Fecha de Reunión</h4>
                <p className="text-sm">{formatDate(evaluacion.fecha_reunion)}</p>
              </div>
            )}
          </div>

          {/* Retroalimentación */}
          {evaluacion.retroalimentacion && (
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Retroalimentación</h4>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{evaluacion.retroalimentacion}</p>
              </div>
            </div>
          )}

          {/* Motivo de denegación */}
          {(evaluacion.firmado_obs || evaluacion.estado_firma === 'firmado') && evaluacion.motivo_denegacion && (
            <div>
              <h4 className="font-medium text-sm text-danger-700 mb-2">Motivo de Denegación</h4>
              <div className="bg-danger-50 p-3 rounded-lg border border-danger-200">
                <p className="text-sm whitespace-pre-wrap text-danger-800">{evaluacion.motivo_denegacion}</p>
              </div>
            </div>
          )}

          {/* Fecha de firma */}
          {evaluacion.fecha_firma && (evaluacion.firmado) && (
            <div>
              <h4 className="font-medium text-sm text-success-700 mb-2">Fecha de Firma</h4>
              <div className="bg-success-50 p-3 rounded-lg">
                <p className="text-sm">{formatDate(evaluacion.fecha_firma)}</p>
              </div>
            </div>
          )}

          {/* Comentarios adicionales */}
          {(evaluacion.text_destacar || evaluacion.text_mejorar) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evaluacion.text_destacar && (
                <div>
                  <h4 className="font-medium text-sm text-success-700 mb-2">A Destacar</h4>
                  <div className="bg-success-50 p-3 rounded-lg">
                    <p className="text-sm">{evaluacion.text_destacar}</p>
                  </div>
                </div>
              )}
              
              {evaluacion.text_mejorar && (
                <div>
                  <h4 className="font-medium text-sm text-warning-700 mb-2">A Mejorar</h4>
                  <div className="bg-warning-50 p-3 rounded-lg">
                    <p className="text-sm">{evaluacion.text_mejorar}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Acciones disponibles */}
          {showActions && (
            <div className="flex justify-end pt-4">
              <AccionesEvaluacionFlow
                evaluacion={evaluacion}
                onSuccess={onEvaluacionUpdate}
              />
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}