// features/evaluacion/jefatura/pages/JefaturaEvaluacionDetallePage.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import axios from "@/services/google/axiosInstance";
import "@/features/evaluacion/styles/animations.css";
import DenegarModal from "@/features/evaluacion/components/autoevaluacion/PageInicio/Resumen/DenegarModal";
import EvaluacionDetalleCommon from "@/features/evaluacion/components/EvaluacionDetalleCommon";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { EvaluationUtils } from "@/features/evaluacion/constants/defaults";
import type {
    EvaluacionJefe,
    AreaDetalle,
    CompetenciaDetalle,
    IndicadorDetalle,
    EstadoEvaluacion
} from "@/features/evaluacion/types/evaluacion";

// ─────────────────────────────────────────────────────────────────────
// TIPOS ESPECÍFICOS PARA JEFATURA
// ─────────────────────────────────────────────────────────────────────
interface AreaDetalleExtended {
    area?: string;
    ponderacion?: number | string | null;
    obtenido?: number | string | null;
    maximo?: number | string | null;
}

// Extender EvaluacionJefe para campos específicos de jefatura
interface JefaturaEvaluacionDetail extends EvaluacionJefe {
    text_destacar?: string | null;
    text_mejorar?: string | null;
    retroalimentacion?: string | null;
    es_ponderada?: boolean;
    ponderada?: boolean;
    detalle_areas?: AreaDetalleExtended[];
    // Campos del serializer (ya calculados en backend)
    puntaje_total_obtenido?: number;
    puntaje_total_maximo?: number;
    porcentaje_total?: number;
    // Campos del flujo de estados
    reunion_realizada?: boolean;
    fecha_reunion?: string | null;
    retroalimentacion_completada?: boolean;
    cerrado_para_firma?: boolean;
    fecha_firma?: string | null;
    estado_actual?: EstadoEvaluacion;
}

interface ProcessedArea {
    area: string;
    ponderacion: number;
    obtenido: number | null;
    aporte: number | null;
}

interface BadgeStyle {
    tone: string;
    text: string;
    soft: string;
    ring: string;
    accent: string;
}

// ─────────────────────────────────────────────────────────────────────
// CONSTANTES Y UTILIDADES
// ─────────────────────────────────────────────────────────────────────
const BASE_URL = "/evaluacion/api/mis-evaluaciones/";

const toNumber = (value: unknown): number | null => {
    if (value === null || value === undefined || value === "") return null;
    const num = typeof value === "string" ? parseFloat(value) : Number(value);
    return isNaN(num) ? null : num;
};

const getBadgeStyle = (score?: number | null): BadgeStyle => {
    if (score == null) {
        return {
            tone: "border-default-200 bg-default-50 text-default-600",
            text: "Sin datos",
            soft: "bg-default-100 text-default-600",
            ring: "ring-default-100",
            accent: "text-default-600",
        };
    }

    const evaluationInfo = EvaluationUtils.getEvaluationInfo(score);

    return {
        tone: `border-${evaluationInfo.color}/30 bg-${evaluationInfo.color}/10 text-${evaluationInfo.color}`,
        text: evaluationInfo.text,
        soft: `bg-${evaluationInfo.color}/10 text-${evaluationInfo.color}`,
        ring: `ring-${evaluationInfo.color}/20`,
        accent: `text-${evaluationInfo.color}`,
    };
};

const isWeightedEvaluation = (data?: JefaturaEvaluacionDetail | null): boolean =>
    !!(data?.es_ponderada ?? data?.ponderada ?? false);

// ─────────────────────────────────────────────────────────────────────
// HOOKS PERSONALIZADOS
// ─────────────────────────────────────────────────────────────────────
const useProcessedAreas = (detailAreas?: AreaDetalleExtended[] | null): ProcessedArea[] => {
    return useMemo(() => {
        if (!detailAreas?.length) return [];

        return detailAreas
            .map((area) => ({
                area: area.area ?? "Área sin nombre",
                ponderacion: toNumber(area.ponderacion) ?? 0,
                obtenido: toNumber(area.obtenido) ?? null,
            }))
            .map((area) => ({
                ...area,
                aporte: area.obtenido != null ? (area.obtenido * area.ponderacion) / 100 : null,
            }));
    }, [detailAreas]);
};

const useWeightedStats = (areas: ProcessedArea[]) => {
    return useMemo(() => {
        const totalWeight = areas.reduce((acc, area) => acc + area.ponderacion, 0);
        const totalContribution = areas.reduce((acc, area) => acc + (area.aporte ?? 0), 0);

        return {
            totalWeight,
            totalContribution,
            isValidWeight: Math.abs(totalWeight - 100) < 0.1,
        };
    }, [areas]);
};

// Hook simplificado para áreas (solo para resumen por área)
const useAreasForSummary = (estructura: any, respuestasMap: Record<number, number>): AreaDetalle[] => {
    return useMemo(() => {
        if (!estructura?.areas) return [];

        return estructura.areas.map((area: any) => {
            let obtenido = 0;
            let maximo = 0;

            const competenciasCalculadas = (area?.competencias ?? []).map((comp: any) => {
                const indicadoresCalculados = (comp?.indicadores ?? []).map((ind: any) => {
                    // Obtener el puntaje máximo de los niveles de logro
                    const niveles = ind?.nvlindicadores ?? [];
                    const maxPuntaje = niveles.length
                        ? Math.max(...niveles.map((n: any) => Number(n.puntaje) || 0))
                        : 4;

                    maximo += maxPuntaje;
                    const puntajeResp = respuestasMap[Number(ind.id)] ?? 0;
                    obtenido += puntajeResp;

                    return {
                        id: Number(ind.id),
                        nombre: ind.indicador || 'Sin nombre',
                        puntaje: puntajeResp,
                        puntaje_maximo: maxPuntaje
                    } as IndicadorDetalle;
                });

                return {
                    id: Number(comp.id),
                    nombre: comp.name || 'Sin nombre',
                    indicadores: indicadoresCalculados
                } as CompetenciaDetalle;
            });

            const porcentaje = maximo > 0 ? (obtenido / maximo) * 100 : 0;

            return {
                id: Number(area.id) || 0,
                nombre: area.n_area || 'Sin nombre',
                competencias: competenciasCalculadas,
                obtenido,
                maximo,
                porcentaje
            } as AreaDetalle;
        });
    }, [estructura, respuestasMap]);
};

// ─────────────────────────────────────────────────────────────────────
// COMPONENTES ESPECÍFICOS
// ─────────────────────────────────────────────────────────────────────
const WeightedAreasTable = ({ areas, stats }: { areas: ProcessedArea[]; stats: ReturnType<typeof useWeightedStats> }) => (
    <Card className="mb-6 shadow-lg">
        <CardHeader>
            <div className="flex items-center justify-between w-full">
                <h3 className="font-semibold">Desglose por Áreas (Evaluación Ponderada)</h3>
                <div className="text-xs">
                    <span className="text-default-600">Ponderación total: </span>
                    <span className={stats.isValidWeight ? "text-success font-medium" : "text-warning font-medium"}>
                        {Math.round(stats.totalWeight)}%
                    </span>
                    {!stats.isValidWeight && (
                        <span className="text-warning ml-1">(ideal: 100%)</span>
                    )}
                </div>
            </div>
        </CardHeader>
        <CardBody>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="border-b border-default-200">
                        <tr className="text-left text-default-600">
                            <th className="py-3 pr-4 font-medium">Área</th>
                            <th className="py-3 pr-4 font-medium">Ponderación</th>
                            <th className="py-3 pr-4 font-medium">Logro</th>
                            <th className="py-3 font-medium">Aporte</th>
                        </tr>
                    </thead>
                    <tbody>
                        {areas.map((area, index) => (
                            <tr key={`${area.area}-${index}`} className="border-t border-default-100">
                                <td className="py-3 pr-4 font-medium">{area.area}</td>
                                <td className="py-3 pr-4">
                                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                        {area.ponderacion}%
                                    </span>
                                </td>
                                <td className="py-3 pr-4">
                                    {area.obtenido != null ? (
                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getBadgeStyle(area.obtenido).soft}`}>
                                            {area.obtenido}%
                                        </span>
                                    ) : (
                                        <span className="text-default-400">—</span>
                                    )}
                                </td>
                                <td className="py-3">
                                    {area.aporte != null ? (
                                        <span className="inline-flex items-center rounded-full bg-default-100 px-2 py-1 text-xs font-medium">
                                            +{area.aporte.toFixed(1)} pts
                                        </span>
                                    ) : (
                                        <span className="text-default-400">—</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 rounded-lg bg-default-50 p-3">
                <p className="text-xs text-default-600">
                    <strong>Contribución total calculada:</strong> {Math.round(stats.totalContribution)} puntos porcentuales
                </p>
                <p className="text-xs text-default-500 mt-1">
                    * El aporte indica cuántos puntos suma cada área al resultado final según su ponderación.
                </p>
            </div>
        </CardBody>
    </Card>
);

const ActionButtons = ({
    isReadOnly,
    saving,
    onAccept,
    onReject
}: {
    isReadOnly: boolean;
    saving: boolean;
    onAccept: () => void;
    onReject: () => void;
}) => {
    if (isReadOnly) return null;

    return (
        <Card className="shadow-lg">
            <CardBody>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        onPress={onAccept}
                        isLoading={saving}
                        className="rounded-xl bg-success text-success-foreground px-8"
                        size="lg"
                    >
                        Firmar Evaluación
                    </Button>
                    <Button
                        onPress={onReject}
                        isDisabled={saving}
                        variant="bordered"
                        className="rounded-xl border-warning text-warning px-8"
                        size="lg"
                    >
                        Firmar con Observaciones
                    </Button>
                </div>
            </CardBody>
        </Card>
    );
};

const NotFoundError = ({ onGoBack }: { onGoBack: () => void }) => (
    <div className="min-h-screen bg-background text-foreground">
        <div className="flex min-h-screen items-center justify-center px-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardBody className="p-8">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-default-100">
                        <svg className="h-6 w-6 text-default-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold">Evaluación no encontrada</h3>
                    <p className="mt-2 text-sm text-default-600">
                        No se pudo encontrar la evaluación solicitada. Vuelve al listado para intentar de nuevo.
                    </p>
                    <div className="mt-6">
                        <Button onPress={onGoBack} className="w-full rounded-xl bg-primary text-primary-foreground">
                            Volver al listado
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────

export default function JefaturaEvaluacionDetallePage() {
    const { state } = useLocation() as { state?: { id?: number; firmado?: boolean } };
    const navigate = useNavigate();

    const evaluationId = state?.id;
    // ✅ CORREGIR: Usar el estado real de la evaluación, no solo el parámetro de navegación
    const [isReadOnly, setIsReadOnly] = useState(state?.firmado ?? false);

    // Estados
    const [data, setData] = useState<JefaturaEvaluacionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [openRejectModal, setOpenRejectModal] = useState(false);


    // Priorizar estructura_json (snapshot) sobre tipo_evaluacion
    const estructura = data?.estructura_json ?? data?.tipo_evaluacion;

    // Mapeo de respuestas para el resumen por áreas
    const respuestasMap = useMemo(() => {
        if (!data?.respuestas) return {} as Record<number, number>;
        return data.respuestas.reduce((acc: Record<number, number>, r: any) => {
            acc[r.indicador] = Number(r.puntaje) ?? 0;
            return acc;
        }, {});
    }, [data]);

    // ✅ SIMPLIFICADO: Solo calcular áreas para resumen, usar valores del backend para totales
    const areas = useAreasForSummary(estructura, respuestasMap);

    // ✅ USAR DIRECTAMENTE LOS VALORES DEL BACKEND (ya calculados y ponderados)
    const puntajeTotal = data?.puntaje_total_obtenido ?? 0;
    const puntajeMaximo = data?.puntaje_total_maximo ?? 0;
    const porcentajeTotal = data?.logro_obtenido ?? 0;

    // Datos procesados para evaluaciones ponderadas
    const isWeighted = isWeightedEvaluation(data);
    const processedAreas = useProcessedAreas(data?.detalle_areas);
    const weightedStats = useWeightedStats(processedAreas);

    // Obtener título y datos del usuario desde la respuesta del backend
    const titulo = estructura?.n_tipo_evaluacion || data?.tipo_evaluacion?.n_tipo_evaluacion || "Detalle de Evaluación de Jefatura";
    const periodo = data?.fecha_evaluacion || 'Sin período';
    const nombreUsuario = data?.persona
        ? `${data.persona.first_name || ''} ${data.persona.last_name || ''}`.trim()
        : 'Sin usuario';
    const nombreEvaluador = data?.persona?.jefe
        ? `${data.persona.jefe || ''}`.trim()
        : 'Sin evaluador';

    // Cargar datos
    const fetchEvaluationDetail = useCallback(async () => {
        if (!evaluationId) return;

        try {
            setLoading(true);
            // 🔧 CORREGIDO: Remover el parámetro scope que causaba duplicación de datos
            const response = await axios.get(`${BASE_URL}${evaluationId}/`, {
                params: { _t: Date.now() } // Solo mantener cache busting
            });
            setData(response.data);
            // ✅ ACTUALIZAR: Usar el estado real de la evaluación - considerar tanto firmado como firmado_obs
            setIsReadOnly(response.data.firmado || response.data.estado_firma === 'firmado_obs');
            console.log('📊 Datos de evaluación (sin scope):', response.data);
        } catch (error) {
            console.error("Error loading evaluation:", error);
            addToast({
                title: "Error al cargar",
                description: "No se pudo cargar la evaluación. Intenta de nuevo en unos minutos.",
                color: "danger",
                variant: "solid",
            });
        } finally {
            setLoading(false);
        }
    }, [evaluationId]);

    useEffect(() => {
        fetchEvaluationDetail();
    }, [fetchEvaluationDetail]);

    // Handlers
    const handleAcceptEvaluation = async () => {
        if (!evaluationId || !data) return;

        // ✅ VALIDAR ESTADO ANTES DE INTENTAR FIRMAR
        if (data.firmado) {
            addToast({
                title: "Evaluación ya firmada",
                description: "Esta evaluación ya ha sido firmada anteriormente.",
                color: "warning",
                variant: "solid",
            });
            return;
        }

        if (!data.cerrado_para_firma) {
            addToast({
                title: "Evaluación no disponible para firma",
                description: "La evaluación debe estar cerrada para firma por la jefatura antes de poder firmarla.",
                color: "warning",
                variant: "solid",
            });
            return;
        }

        try {
            setSaving(true);

            // ✅ AGREGAR: Llamada al backend para guardar el estado firmado
            await axios.patch(`${BASE_URL}${evaluationId}/`, {
                firmado: true
            });

            addToast({
                title: "Evaluación aceptada",
                description: "Se ha marcado como firmada exitosamente.",
                color: "success",
                variant: "solid",
            });

            // ✅ ACTUALIZAR ESTADO LOCAL
            setData(prev => prev ? { ...prev, firmado: true, fecha_firma: new Date().toISOString() } : null);
            setIsReadOnly(true);

            navigate(-1);
        } catch (error: any) {
            console.error("Error accepting evaluation:", error);

            // ✅ MOSTRAR ERROR ESPECÍFICO DEL BACKEND
            const errorMessage = error.response?.data?.error || "No se pudo aceptar la evaluación. Revisa tu conexión e inténtalo otra vez.";

            addToast({
                title: "Error al aceptar",
                description: errorMessage,
                color: "danger",
                variant: "solid",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleRejectEvaluation = async (reason: string) => {
        if (!evaluationId) {
            addToast({
                title: "Error",
                description: "ID de evaluación no válido",
                color: "danger",
                variant: "solid",
            });
            return;
        }

        if (!data?.cerrado_para_firma) {
            addToast({
                title: "Evaluación no disponible para rechazo",
                description: "La evaluación debe estar cerrada para firma antes de poder rechazarla.",
                color: "warning",
                variant: "solid",
            });
            return;
        }

        // ✅ VERIFICAR SI YA ESTÁ DENEGADA
        if (data?.estado_firma === 'firmado_obs') {
            addToast({
                title: "Evaluación ya denegada",
                description: "Esta evaluación ya fue denegada anteriormente.",
                color: "warning",
                variant: "solid",
            });
            return;
        }

        try {
            setSaving(true);

            // ✅ USAR EL MISMO PATRÓN QUE ACEPTAR: PATCH al endpoint base
            await axios.patch(`${BASE_URL}${evaluationId}/`, {
                estado_firma: 'firmado_obs',
                motivo_denegacion: reason
            });

            addToast({
                title: "Evaluación denegada",
                description: "Se ha enviado el motivo de denegación a la jefatura.",
                color: "warning",
                variant: "solid",
            });

            // ✅ RECARGAR DATOS DEL SERVIDOR EN LUGAR DE SOLO ACTUALIZAR ESTADO LOCAL
            await fetchEvaluationDetail();
            setOpenRejectModal(false);

            // ✅ OPCIONAL: Navegar de vuelta después de un breve delay para que el usuario vea el cambio
            setTimeout(() => {
                navigate(-1);
            }, 1500);
        } catch (error: any) {
            console.error("Error rejecting evaluation:", error);

            // ✅ MOSTRAR ERROR ESPECÍFICO DEL BACKEND
            const errorMessage = error.response?.data?.error || "No se pudo denegar la evaluación. Revisa tu conexión e inténtalo otra vez.";

            addToast({
                title: "Error al denegar",
                description: errorMessage,
                color: "danger",
                variant: "solid",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        navigate("/autoevaluacion/inicio");
    };

    // Función para formatear fecha
    const formatearFecha = (fecha: string | null): string => {
        if (!fecha) return '';
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Función para determinar el estado de la evaluación
    const getEstadoEvaluacion = (): string | undefined => {
        if (!data) return undefined;

        // Solo mostrar estado cuando está firmado_obs o firmado
        if (data.estado_firma === 'firmado_obs') {
            const fechaTexto = data.fecha_firma ? ` el ${formatearFecha(data.fecha_firma)}` : '';
            return `Proceso Completado (firmado_obs por el trabajador${fechaTexto})`;
        } else if (data.firmado || data.estado_firma === 'firmado') {
            const fechaTexto = data.fecha_firma ? ` el ${formatearFecha(data.fecha_firma)}` : '';
            return `Proceso Completado (Firmado por el trabajador${fechaTexto})`;
        }

        // Para todos los demás estados, no mostrar badge
        return undefined;
    };

    // Renderizado condicional
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-default-600">Cargando evaluación...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return <NotFoundError onGoBack={handleBack} />;
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="mx-auto max-w-7xl px-4 py-8">


                <EvaluacionDetalleCommon
                    titulo={titulo}
                    periodo={periodo}
                    usuario={`Evaluado: ${nombreUsuario}  |   Evaluador: ${nombreEvaluador}`}
                    estadoEvaluacion={getEstadoEvaluacion()}
                    areas={areas}
                    puntajeTotal={puntajeTotal}
                    puntajeMaximo={puntajeMaximo}
                    porcentajeTotal={porcentajeTotal}
                    onBack={handleBack}
                    tipo="evaluacion_jefatura"
                    text_destacar={data?.text_destacar}
                    text_mejorar={data?.text_mejorar}
                    text_retroalimentacion={data?.retroalimentacion}
                    evaluacionData={data}
                    showTimelineEstado={true}
                    evaluacionId={evaluationId}
                />

                {/* Funcionalidades específicas de jefatura */}
                <div className="mt-8 space-y-6">
                    {/* Tabla de áreas ponderadas si aplica */}
                    {isWeighted && processedAreas.length > 0 && (
                        <WeightedAreasTable areas={processedAreas} stats={weightedStats} />
                    )}



                    {/* ✅ BOTONES DE ACCIÓN - MEJORAR LÓGICA */}
                    <ActionButtons
                        isReadOnly={isReadOnly || !data?.cerrado_para_firma || data?.estado_firma === 'firmado_obs'}
                        saving={saving}
                        onAccept={handleAcceptEvaluation}
                        onReject={() => setOpenRejectModal(true)}
                    />
                </div>

                {/* Modal de rechazo */}
                <DenegarModal
                    open={openRejectModal}
                    onClose={() => setOpenRejectModal(false)}
                    onSubmit={handleRejectEvaluation}
                    loading={saving}
                />
            </div>
        </div>
    );
}
