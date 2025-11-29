import { Button } from "@heroui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { Card, CardBody } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { Tabs, Tab } from "@heroui/tabs";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import {
  PlusIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  Square2StackIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

import {
  fetchAsignarAutoevaluacion,
  fetchAsignarEvaluacion,
} from "@/features/evaluacion/services/asignar/evaluacion";
import { AsignacionEvaluacion } from "@/features/evaluacion/types/asignar/evaluacion";

// Lazy load del modal
const ModalDetalleAsignacion = lazy(() =>
  import("@/features/evaluacion/components/Asignar").then((module) => ({
    default: module.ModalDetalleAsignacion,
  })),
);

export default function AsignarEvaluacionPage() {
  const navigate = useNavigate();

  // Estados
  const [tiposEvaluacion, setTiposEvaluacion] = useState<
    AsignacionEvaluacion[]
  >([]);
  const [asignacionSeleccionada, setAsignacionSeleccionada] =
    useState<AsignacionEvaluacion | null>(null);
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tabSeleccionado, setTabSeleccionado] = useState<
    "evaluaciones" | "autoevaluaciones"
  >("evaluaciones");

  // Carga de datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [autoevals, evals] = await Promise.all([
          fetchAsignarAutoevaluacion(),
          fetchAsignarEvaluacion(),
        ]);

        setTiposEvaluacion([...evals, ...autoevals]);
      } catch (error) {
        console.error("Error al cargar tipos de evaluación:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrado de datos
  const autoevaluaciones = useMemo(
    () => tiposEvaluacion.filter((t) => t.tipo_evaluacion?.auto),
    [tiposEvaluacion],
  );
  const evaluaciones = useMemo(
    () => tiposEvaluacion.filter((t) => !t.tipo_evaluacion?.auto),
    [tiposEvaluacion],
  );

  const lista =
    tabSeleccionado === "evaluaciones" ? evaluaciones : autoevaluaciones;
  const isEvaluaciones = tabSeleccionado === "evaluaciones";

  // --- Componente: Tarjeta de Configuración (Clean Style) ---
  const ConfigCard = ({
    asignacion,
    onClick,
  }: {
    asignacion: AsignacionEvaluacion;
    onClick: () => void;
  }) => (
    <Card
      isPressable
      className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-primary-300 transition-all duration-200 bg-white dark:bg-gray-900 group"
      onPress={onClick}
    >
      <CardBody className="p-5">
        <div className="flex items-start justify-between w-full mb-4">
          <div
            className={`p-3 rounded-xl ${isEvaluaciones ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "bg-purple-50 text-purple-600 dark:bg-purple-900/20"}`}
          >
            {isEvaluaciones ? (
              <DocumentTextIcon className="w-6 h-6" />
            ) : (
              <UserIcon className="w-6 h-6" />
            )}
          </div>
          <Chip
            className="text-xs text-gray-500"
            color="default"
            size="sm"
            variant="flat"
          >
            {isEvaluaciones ? "Evaluación" : "Autoevaluación"}
          </Chip>
        </div>

        <div className="space-y-1 mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 h-14">
            {asignacion.tipo_evaluacion?.n_tipo_evaluacion}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <CalendarDaysIcon className="w-4 h-4" />
            <span>{asignacion.fecha_evaluacion}</span>
          </div>
        </div>

        <Divider className="my-3 bg-gray-100 dark:bg-gray-800" />

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Configuración
          </span>
          <div className="flex items-center gap-1 text-sm font-medium text-primary-600 group-hover:underline">
            Ver detalle <ChevronRightIcon className="w-3 h-3" />
          </div>
        </div>
      </CardBody>
    </Card>
  );

  // --- Componente: Empty State ---
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50">
      <div
        className={`p-4 rounded-full mb-4 bg-gray-100 dark:bg-gray-800 text-gray-400`}
      >
        <Square2StackIcon className="w-10 h-10" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
        {isEvaluaciones
          ? "Sin Evaluaciones Configuradas"
          : "Sin Autoevaluaciones Configuradas"}
      </h3>
      <p className="text-sm text-gray-500 text-center max-w-xs mb-6">
        {isEvaluaciones
          ? "Comienza creando un nuevo ciclo de evaluación para tu equipo."
          : "Habilita un proceso de autoevaluación para los colaboradores."}
      </p>
      <Button
        color="primary"
        startContent={<PlusIcon className="w-4 h-4" />}
        onPress={() =>
          navigate(`/evaluacion-asignar/crear?auto=${!isEvaluaciones}`)
        }
      >
        Crear Nueva Configuración
      </Button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b1220]">
        <div className="flex flex-col items-center gap-4">
          <Spinner color="primary" size="lg" />
          <p className="text-sm text-gray-500 font-medium">
            Cargando catálogo...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b1220] pb-10">
      {/* 1. Header Principal (Admin Style) */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 pt-8 pb-8 px-6 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              <AdjustmentsHorizontalIcon className="w-8 h-8 text-gray-400" />
              Configuración de Asignaciones
            </h1>
            <p className="text-gray-500 mt-1">
              Administra los ciclos y tipos de evaluación disponibles.
            </p>
          </div>
          <Button
            className="font-medium shadow-lg shadow-blue-500/20"
            color="primary"
            size="lg"
            startContent={<PlusIcon className="w-5 h-5" />}
            onPress={() =>
              navigate(
                `/evaluacion-asignar/crear?auto=${tabSeleccionado === "autoevaluaciones"}`,
              )
            }
          >
            {isEvaluaciones ? "Nueva Evaluación" : "Nueva AutoEvaluación"}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 2. Controles y Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <Tabs
            classNames={{
              cursor: "w-full bg-primary",
              tabContent:
                "group-data-[selected=true]:text-primary font-medium text-gray-500",
            }}
            color="primary"
            selectedKey={tabSeleccionado}
            variant="underlined"
            onSelectionChange={(key) => setTabSeleccionado(key as any)}
          >
            <Tab
              key="evaluaciones"
              title={
                <div className="flex items-center gap-2">
                  <DocumentTextIcon className="w-4 h-4" />
                  <span>Evaluaciones</span>
                  <Chip color="primary" size="sm" variant="flat">
                    {evaluaciones.length}
                  </Chip>
                </div>
              }
            />
            <Tab
              key="autoevaluaciones"
              title={
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span>Autoevaluaciones</span>
                  <Chip color="secondary" size="sm" variant="flat">
                    {autoevaluaciones.length}
                  </Chip>
                </div>
              }
            />
          </Tabs>
        </div>

        {/* 3. Grid de Contenido */}
        {lista.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {lista.map((asignacion, index) => (
              <ConfigCard
                key={`${tabSeleccionado}-${asignacion.id || index}`}
                asignacion={asignacion}
                onClick={() => {
                  setAsignacionSeleccionada(asignacion);
                  setMostrarModalDetalle(true);
                }}
              />
            ))}
          </div>
        )}

        {/* Modal (Lazy Loaded) */}
        <Suspense fallback={null}>
          {mostrarModalDetalle && asignacionSeleccionada && (
            <ModalDetalleAsignacion
              asignacionSeleccionada={asignacionSeleccionada}
              mostrarModalDetalle={mostrarModalDetalle}
              setMostrarModalDetalle={setMostrarModalDetalle}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
}
