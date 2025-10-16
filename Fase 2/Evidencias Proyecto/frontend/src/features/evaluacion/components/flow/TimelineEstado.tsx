import { Card, CardBody, CardHeader, Chip } from "@heroui/react";
import {
    ClockIcon,
    ChatBubbleLeftRightIcon,
    DocumentCheckIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    CalendarDaysIcon
} from "@heroicons/react/24/outline";
import type { EvaluacionJefe, EstadoEvaluacion } from "@/features/evaluacion/types/evaluacion";

interface TimelineEstadoProps {
    evaluacion: EvaluacionJefe;
    className?: string;
}

interface EstadoStep {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    date?: string | null;
    icon: React.ReactNode;
    color: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
    showObservations?: boolean;
    observations?: string | null;
}

function formatDate(dateString?: string | null): string {
    if (!dateString) return "";

    try {
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    } catch {
        return dateString;
    }
}

function getEstadoSteps(evaluacion: EvaluacionJefe): EstadoStep[] {
    const steps: EstadoStep[] = [];

    // 1. Evaluación Completada
    if (evaluacion.completado) {
        steps.push({
            id: "completado",
            title: "Evaluación",
            description: "",
            completed: true,
            date: evaluacion.fecha_ultima_modificacion,
            icon: <DocumentCheckIcon className="w-5 h-5" />,
            color: "success"
        });
    }

    // 2. Reunión Realizada (si aplica)
    if (evaluacion.reunion_realizada) {
        steps.push({
            id: "reunion",
            title: "Reunión de Retroalimentación",
            description: "Se realizó la reunión de retroalimentación",
            completed: true,
            date: evaluacion.fecha_reunion,
            icon: <CalendarDaysIcon className="w-5 h-5" />,
            color: "primary"
        });
    }

    // 3. Retroalimentación Completada
    if (evaluacion.retroalimentacion_completada || evaluacion.retroalimentacion) {
        steps.push({
            id: "retroalimentacion",
            title: "Retroalimentación",
            description: "Se completó la retroalimentación ",
            completed: true,
            date: evaluacion.fecha_reunion,
            icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />,
            color: "success"
        });
    }

    // 4. Cerrado para Firma
    if (evaluacion.cerrado_para_firma) {
        steps.push({
            id: "cerrado_firma",
            title: "Listo para Firma",
            description: "La evaluación está lista para ser firmada",
            completed: true,
            date: evaluacion.fecha_ultima_modificacion,
            icon: <ClockIcon className="w-5 h-5" />,
            color: "success"
        });
    }

    // 5. Firmado
    if (evaluacion.firmado || evaluacion.firmado_obs) {
        const tienObservaciones = !!(evaluacion.firmado_obs && evaluacion.motivo_denegacion);

        steps.push({
            id: "firmado",
            title: tienObservaciones ? "Firmado con Observaciones" : "Evaluación Firmada",
            description: tienObservaciones
                ? "La evaluación fue firmada con observaciones"
                : "La evaluación fue firmada exitosamente",
            completed: true,
            date: evaluacion.fecha_firma,
            icon: tienObservaciones
                ? <ExclamationTriangleIcon className="w-5 h-5" />
                : <CheckCircleIcon className="w-5 h-5" />,
            color: tienObservaciones ? "warning" : "success",
            showObservations: tienObservaciones,
            observations: evaluacion.motivo_denegacion
        });
    }

    return steps;
}

function getEstadoActual(evaluacion: EvaluacionJefe): { estado: EstadoEvaluacion; descripcion: string } {
    if (evaluacion.firmado || evaluacion.firmado_obs) {
        return {
            estado: 'finalizado',
            descripcion: evaluacion.firmado_obs ? 'Firmado con observaciones' : 'Evaluación finalizada'
        };
    }

    if (evaluacion.cerrado_para_firma) {
        return {
            estado: 'firmar',
            descripcion: 'Pendiente de firma'
        };
    }

    if (evaluacion.completado) {
        return {
            estado: 'retroalimentar',
            descripcion: 'En proceso de retroalimentación'
        };
    }

    return {
        estado: 'pendiente',
        descripcion: 'Evaluación en curso'
    };
}

export function TimelineEstado({ evaluacion, className = "" }: TimelineEstadoProps) {
    const steps = getEstadoSteps(evaluacion);
    const estadoActual = getEstadoActual(evaluacion);

    if (steps.length === 0) {
        return (
            <Card className={`shadow-lg ${className}`}>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <ClockIcon className="w-6 h-6 text-default-500" />
                        <h3 className="text-lg font-semibold">Estado de la Evaluación</h3>
                    </div>
                </CardHeader>
                <CardBody>
                    <div className="text-center py-8">
                        <ClockIcon className="w-12 h-12 text-default-300 mx-auto mb-4" />
                        <p className="text-default-500">La evaluación aún no ha sido completada</p>
                        <Chip variant="flat" color="default" className="mt-2">
                            {estadoActual.descripcion}
                        </Chip>
                    </div>
                </CardBody>
            </Card>
        );
    }

    return (
        <Card className={`shadow-lg ${className}`}>
            <CardHeader>
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        <CheckCircleIcon className="w-6 h-6 text-success" />
                        <h3 className="text-lg font-semibold">Progreso de la Evaluación</h3>
                    </div>
                    <Chip
                        variant="flat"
                        color={estadoActual.estado === 'finalizado' ? 'success' : 'primary'}
                        size="sm"
                    >
                        {estadoActual.descripcion}
                    </Chip>
                </div>
            </CardHeader>
            <CardBody>
                <div className="space-y-6">
                    {steps.map((step, index) => {
                        const isLast = index === steps.length - 1;

                        return (
                            <div key={step.id} className="relative">
                                {/* Línea conectora */}
                                {!isLast && (
                                    <div className="absolute left-6 top-12 w-0.5 h-6 bg-default-200" />
                                )}

                                {/* Contenido del paso */}
                                <div className="flex items-start gap-4">
                                    {/* Icono */}
                                    <div className={`
                    flex items-center justify-center w-12 h-12 rounded-full border-2 flex-shrink-0
                    ${step.color === 'success' ? 'bg-success-50 border-success-200 text-success-600' :
                                            step.color === 'primary' ? 'bg-primary-50 border-primary-200 text-primary-600' :
                                                step.color === 'warning' ? 'bg-warning-50 border-warning-200 text-warning-600' :
                                                    'bg-default-50 border-default-200 text-default-600'}
                  `}>
                                        {step.icon}
                                    </div>

                                    {/* Contenido */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="font-semibold text-foreground">{step.title}</h4>
                                            <Chip
                                                size="sm"
                                                variant="flat"
                                                color={step.color}
                                                className="text-xs"
                                            >
                                                Completado
                                            </Chip>
                                        </div>

                                        <p className="text-sm text-default-600 mb-2">
                                            {step.description}
                                        </p>

                                        {step.date && (
                                            <div className="flex items-center gap-2 text-xs text-default-500">
                                                <CalendarDaysIcon className="w-4 h-4" />
                                                <span>{formatDate(step.date)}</span>
                                            </div>
                                        )}

                                        {/* Observaciones si las hay */}
                                        {step.showObservations && step.observations && (
                                            <div className="mt-3 p-3 bg-warning-50 border border-warning-200 rounded-lg">
                                                <div className="flex items-start gap-2">
                                                    <ExclamationTriangleIcon className="w-4 h-4 text-warning-600 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-medium text-warning-800 mb-1">
                                                            Observaciones:
                                                        </p>
                                                        <p className="text-sm text-warning-700">
                                                            {step.observations}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </CardBody>
        </Card>
    );
}