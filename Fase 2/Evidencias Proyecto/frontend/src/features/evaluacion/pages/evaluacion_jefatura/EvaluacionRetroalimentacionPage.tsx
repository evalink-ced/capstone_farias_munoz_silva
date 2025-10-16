import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { addToast } from "@heroui/toast";
import axios from "@/services/google/axiosInstance";
import EvaluacionDetalleCommon from "@/features/evaluacion/components/EvaluacionDetalleCommon";
import { EvaluacionJefe, AreaDetalle, CompetenciaDetalle, IndicadorDetalle } from "@/features/evaluacion/types/evaluacion";
import { completarRetroalimentacionYCerrar } from "@/features/evaluacion/services/evaluacion";

export default function EvaluacionRetroalimentacionPage() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const id = state?.id;

    const [evaluacion, setEvaluacion] = useState<EvaluacionJefe | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [retroalimentacion, setRetroalimentacion] = useState("");

    // Priorizar estructura_json (snapshot) sobre tipo_evaluacion
    const estructura = evaluacion?.estructura_json ?? evaluacion?.tipo_evaluacion;

    useEffect(() => {
        if (!id) {
            addToast({
                title: "Error",
                description: "No se encontró la evaluación seleccionada.",
                color: "danger",
                variant: "solid",
            });
            navigate("/evaluacion-jefatura");
            return;
        }

        const cargarEvaluacion = async () => {
            try {
                const { data } = await axios.get(`/evaluacion/api/evaluaciones-jefe/${id}/`);
                setEvaluacion(data);
                setRetroalimentacion(data.retroalimentacion || "");
                console.log(data);
            } catch (err) {
                console.error(err);
                addToast({
                    title: "Error al cargar los datos",
                    description: "No se pudo cargar la evaluación.",
                    color: "danger",
                    variant: "solid",
                });
                navigate("/evaluacion-jefatura");
            } finally {
                setLoading(false);
            }
        };

        cargarEvaluacion();
    }, [id, navigate]);

    const respuestasMap = useMemo(() => {
        if (!evaluacion?.respuestas) return {} as Record<number, number>;
        return evaluacion.respuestas.reduce((acc: Record<number, number>, r: any) => {
            acc[r.indicador] = Number(r.puntaje) ?? 0;
            return acc;
        }, {});
    }, [evaluacion]);

    // Simplificado para usar valores del backend y mantener solo cálculos de áreas para el resumen
    const { areas, puntajeTotal, puntajeMaximo, porcentajeTotal } = useMemo(() => {
        if (!estructura?.areas) {
            return {
                areas: [] as AreaDetalle[],
                puntajeTotal: evaluacion?.puntaje_total_obtenido || 0,
                puntajeMaximo: evaluacion?.puntaje_total_maximo || 0,
                porcentajeTotal: evaluacion?.logro_obtenido || 0 // ✅ Usar logro_obtenido del backend
            };
        }

        // Calcular áreas solo para el resumen detallado
        const areasCalculadas: AreaDetalle[] = estructura.areas.map((area: any) => {
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

        return {
            areas: areasCalculadas,
            puntajeTotal: evaluacion?.puntaje_total_obtenido || 0, // ✅ Usar valor del backend
            puntajeMaximo: evaluacion?.puntaje_total_maximo || 0,  // ✅ Usar valor del backend
            porcentajeTotal: evaluacion?.logro_obtenido || 0       // ✅ Usar logro_obtenido del backend
        };
    }, [estructura, respuestasMap, evaluacion]);

    // Obtener título y datos del usuario desde la respuesta del backend
    const titulo = estructura?.n_tipo_evaluacion || evaluacion?.tipo_evaluacion?.n_tipo_evaluacion || "Retroalimentación de Evaluación";
    const periodo = evaluacion?.fecha_evaluacion || 'Sin período';
    const nombreUsuario = evaluacion?.persona
        ? `${evaluacion.persona.first_name || ''} ${evaluacion.persona.last_name || ''}`.trim()
        : 'Sin usuario';
    const nombreEvaluador = evaluacion?.persona?.jefe
        ? `${evaluacion.persona.jefe || ''}`.trim()
        : 'Sin evaluador';

    const handleCompletarRetroalimentacion = async () => {
        if (!evaluacion?.id) return;

        // Validar retroalimentación
        if (!retroalimentacion.trim()) {
            addToast({
                title: "Error",
                description: "Debe escribir una retroalimentación antes de completar.",
                color: "danger",
                variant: "solid",
            });
            return;
        }

        setSaving(true);
        try {
            // Usar la función unificada que completa retroalimentación y cierra para firma
            const response = await completarRetroalimentacionYCerrar(evaluacion.id, retroalimentacion);

            if (response.success) {
                addToast({
                    title: "Éxito",
                    description: response.message,
                    color: "success",
                    variant: "solid",
                });

                // Navegar de vuelta a la lista
                navigate("/evaluacion-jefatura");
            } else {
                addToast({
                    title: "Error",
                    description: response.message || "Error al procesar la acción.",
                    color: "danger",
                    variant: "solid",
                });
            }
        } catch (error) {
            console.error(error);
            addToast({
                title: "Error",
                description: "Error inesperado al procesar la acción.",
                color: "danger",
                variant: "solid",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        navigate("/evaluacion-jefatura");
    };

    // Determinar qué acciones están disponibles
    const puedeCompletarRetroalimentacion = evaluacion?.completado && !evaluacion?.retroalimentacion_completada;
    const tieneAccionesDisponibles = puedeCompletarRetroalimentacion;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <Spinner size="lg" color="primary" />
                    <p className="text-default-600">Cargando evaluación...</p>
                </div>
            </div>
        );
    }

    if (!evaluacion) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <p className="text-lg text-default-600">No se encontró la evaluación</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <EvaluacionDetalleCommon
                titulo={titulo}
                periodo={periodo}
                usuario={`Evaluado: ${nombreUsuario}  |   Evaluador: ${nombreEvaluador}`}
                areas={areas}
                puntajeTotal={puntajeTotal}
                puntajeMaximo={puntajeMaximo}
                porcentajeTotal={porcentajeTotal}
                onBack={handleBack}
                tipo="evaluacion_jefatura"
                text_destacar={evaluacion?.text_destacar}
                text_mejorar={evaluacion?.text_mejorar}
                evaluacionData={evaluacion}
                showTimelineEstado={true}
                evaluacionId={id}
            />
            {/* Sección de Retroalimentación */}
            <Card className="w-full">
                <CardHeader className="pb-3">
                    <div className="flex flex-col">
                        <h3 className="text-lg font-semibold">Retroalimentación</h3>
                        <p className="text-sm text-default-500">
                            Complete la retroalimentación para el evaluado
                        </p>
                    </div>
                </CardHeader>
                <CardBody className="space-y-4">
                    <Textarea
                        label="Comentarios de Retroalimentación"
                        placeholder="Escriba aquí los comentarios y retroalimentación para el evaluado..."
                        value={retroalimentacion}
                        onChange={(e) => setRetroalimentacion(e.target.value)}
                        minRows={6}
                        maxRows={12}
                        isDisabled={evaluacion?.retroalimentacion_completada}
                        description={evaluacion?.retroalimentacion_completada ? "La retroalimentación ya ha sido completada" : "Proporcione comentarios constructivos sobre el desempeño"}
                    />

                    {/* Estado actual */}
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-default-500">Estado:</span>
                        {evaluacion?.retroalimentacion_completada ? (
                            <span className="text-success-600 font-medium">✅ Retroalimentación Completada</span>
                        ) : (
                            <span className="text-warning-600 font-medium">⏳ Pendiente de Completar</span>
                        )}
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-3 pt-4 justify-center">
                        {tieneAccionesDisponibles && (
                            <Button
                                color="success"
                                onPress={handleCompletarRetroalimentacion}
                                isLoading={saving}
                                isDisabled={!retroalimentacion.trim()}
                            >
                                Completar Retroalimentación y Cerrar para Firma
                            </Button>
                        )}

                        {evaluacion?.cerrado_para_firma && (
                            <div className="text-center text-success-600 font-medium">
                                ✅ Evaluación cerrada para firma
                            </div>
                        )}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}