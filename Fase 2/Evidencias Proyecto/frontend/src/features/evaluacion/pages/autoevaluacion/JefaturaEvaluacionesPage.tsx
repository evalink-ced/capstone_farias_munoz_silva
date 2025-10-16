import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardBody } from "@heroui/card";
import { Tabs, Tab } from "@heroui/tabs";
import { Chip } from "@heroui/chip";
import { addToast } from "@heroui/toast";
import {
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline";

import "@/features/evaluacion/styles/animations.css";
import { useEvaluacionesJefe } from "@/features/evaluacion/hooks/useEvaluacionesJefe";
import { EstadoEvaluacionBadge, TimelineEvaluacion } from "@/features/evaluacion/components/flow";
import type { EvaluacionJefe, EstadoEvaluacion } from "@/features/evaluacion/types/evaluacion";
export default function JefaturaEvaluacionesPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"en-proceso" | "finalizadas">("en-proceso");
  const [filtroEstado] = useState<EstadoEvaluacion | "todas">("todas");

  // Usar el hook que maneja las evaluaciones de jefatura
  const {
    evaluaciones,
    loading,
    error,
  } = useEvaluacionesJefe({
    soloMisEvaluaciones: true,
    debug: true,
  });

  // Función para determinar el estado de una evaluación
  const getEstadoEvaluacion = useCallback((ev: EvaluacionJefe): EstadoEvaluacion => {
    // Lógica de fallback basada en campos booleanos
    if (ev.firmado || ev.firmado_obs) return 'finalizado';
    if (ev.retroalimentacion && ev.cerrado_para_firma) return 'firmar';
    if (ev.completado) return 'retroalimentar';
    return 'pendiente';
  }, []);

  // Función para filtrar por estado - ACTUALIZADA para 4 estados
  const filtrarPorEstado = useCallback((evaluaciones: EvaluacionJefe[], estado: EstadoEvaluacion) => {
    return evaluaciones.filter(ev => {
      const estadoActual = getEstadoEvaluacion(ev);
      return estadoActual === estado;
    });
  }, [getEstadoEvaluacion]);

  // Filtrar evaluaciones por tab y estado
  const evaluacionesFiltradas = useMemo(() => {
    let filtradas = evaluaciones;

    // Filtrar por tab - incluir finalizadas en finalizadas
    switch (tab) {
      case "en-proceso":
        filtradas = filtradas.filter(ev => {
          const estado = getEstadoEvaluacion(ev);
          return estado !== 'finalizado';
        });
        break;
      case "finalizadas":
        filtradas = filtradas.filter(ev => {
          const estado = getEstadoEvaluacion(ev);
          return estado === 'finalizado';
        });
        break;
    }

    // Filtrar por estado específico
    if (filtroEstado !== "todas") {
      filtradas = filtrarPorEstado(filtradas, filtroEstado);
    }

    return filtradas;
  }, [evaluaciones, tab, filtroEstado, filtrarPorEstado, getEstadoEvaluacion]);


  const counts = useMemo(() => ({
    enProceso: evaluaciones.filter(ev => {
      const estado = getEstadoEvaluacion(ev);
      return estado !== 'finalizado';
    }).length,
    finalizadas: evaluaciones.filter(ev => {
      const estado = getEstadoEvaluacion(ev);
      return estado === 'finalizado';
    }).length
  }), [evaluaciones, getEstadoEvaluacion]);

  const openEvaluacion = useCallback(
    (id: number, firmado: boolean) => {
      // Buscar la evaluación en el array para verificar su estado
      const evaluacion = evaluaciones.find(ev => ev.id === id);
      if (!evaluacion) return;

      const estado = getEstadoEvaluacion(evaluacion);

      // Mostrar mensaje informativo si está en estado pendiente
      if (estado === 'pendiente') {
        addToast({
          title: "Evaluación no disponible",
          description: "Esta evaluación aún está en proceso. Podrás acceder cuando avance a la siguiente etapa.",
          color: "warning",
          variant: "solid",
        });
        return;
      }

      navigate("/autoevaluacion/jefatura/detalle", { state: { id, firmado } });
    },
    [navigate, evaluaciones, getEstadoEvaluacion]
  );

  // CORREGIDA - usar campos que existen en EvaluacionJefe
  const extractTexto = (ev: EvaluacionJefe) =>
    ev?.retroalimentacion ?? ev?.text_destacar ?? ev?.text_mejorar ?? undefined;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-default-50/30 dark:to-default-900/30">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <div className="absolute inset-0 animate-ping">
              <div className="w-full h-full rounded-full bg-primary/10"></div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">Cargando</p>
            <p className="text-sm text-default-500">Obteniendo evaluaciones de jefatura...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm">
              <ClipboardDocumentCheckIcon className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Mis Evaluaciones
          </h1>
          <p className="text-default-600 max-w-2xl mx-auto">
            revisa tus evaluaciones de desempeño
          </p>
        </div>
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-6">
          <div className="p-1 bg-default-100/80 dark:bg-default-100/20 backdrop-blur-sm rounded-xl border border-default-200/50">
            <Tabs
              aria-label="Evaluaciones de jefatura"
              selectedKey={tab}
              onSelectionChange={(key) =>
                setTab(key as "en-proceso" | "finalizadas")
              }
              classNames={{
                tabList: "gap-1",
                cursor: "bg-background shadow-sm",
                tab: "h-10 px-4 data-[selected=true]:text-foreground",
                tabContent: "group-data-[selected=true]:text-foreground text-default-600"
              }}
            >
              <Tab
                key="en-proceso"
                title={
                  <div className="flex items-center gap-2">
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    <span>En Proceso</span>
                    {counts.enProceso > 0 && (
                      <Chip size="sm" variant="flat" color="primary" className="text-xs min-w-5 h-5">
                        {counts.enProceso}
                      </Chip>
                    )}
                  </div>
                }
              />
              <Tab
                key="finalizadas"
                title={
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Finalizadas</span>
                    {counts.finalizadas > 0 && (
                      <Chip size="sm" variant="flat" color="success" className="text-xs min-w-5 h-5">
                        {counts.finalizadas}
                      </Chip>
                    )}
                  </div>
                }
              />
            </Tabs>
          </div>
        </div>



        {/* Content Area */}
        <div className="bg-background/60 backdrop-blur-sm rounded-2xl border border-default-200/50 shadow-sm dark:bg-default-50/5">
          {/* Error State */}
          {error && (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="p-4 rounded-full mb-4 bg-danger/10 text-danger">
                <ExclamationTriangleIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Error al cargar evaluaciones
              </h3>
              <p className="text-sm text-default-500 text-center mb-6 max-w-sm">
                {error}
              </p>
            </div>
          )}

          {/* Content */}
          {!error && (
            <div className="p-6">
              {evaluacionesFiltradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <div className="p-4 rounded-full mb-4 bg-default/10 text-default-500">
                    <DocumentTextIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No hay evaluaciones en esta categoría
                  </h3>
                  <p className="text-sm text-default-500 text-center mb-6 max-w-sm">
                    {tab === "en-proceso" && "No hay evaluaciones en proceso actualmente."}
                    {tab === "finalizadas" && "No tienes evaluaciones finalizadas aún."}
                  </p>
                </div>
              ) : (
                <>
                  {/* Filtros de estado */}
                  <div className="mb-6">
                    <Card className="border-0 bg-background/60 backdrop-blur-sm shadow-sm">
                      <CardBody className="p-4">
                        <div className="flex flex-wrap items-center gap-4">
                          <span className="text-sm font-medium text-foreground">Estados de evaluación:</span>
                          <div className="flex flex-wrap gap-2">
                            {["pendiente", "retroalimentar", "firmar", "finalizado"].map((estado) => (
                              <div key={estado} className="flex items-center gap-2">
                                <EstadoEvaluacionBadge estado={estado as EstadoEvaluacion} size="sm" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </div>

                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    {tab === "en-proceso" ? "Evaluaciones en Proceso" : "Evaluaciones Finalizadas"}
                  </h3>

                  {/* Timeline Grid fusionado */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                    {evaluacionesFiltradas.map((evaluacion, index) => (
                      <div key={evaluacion.id} className="animate-fadeInUp" style={{ animationDelay: `${index * 0.08}s` }}>
                        <TimelineEvaluacion
                          evaluacion={evaluacion}
                          compact={true}
                          onOpen={openEvaluacion}
                          extractTexto={extractTexto}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
