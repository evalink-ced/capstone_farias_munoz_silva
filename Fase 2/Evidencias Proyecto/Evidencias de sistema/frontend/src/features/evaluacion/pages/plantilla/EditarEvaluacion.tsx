import { Button } from "@heroui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { Card, CardBody } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { Tabs, Tab } from "@heroui/tabs";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import {
  PlusIcon,
  DocumentTextIcon,
  UserIcon,
  PencilSquareIcon,
  SwatchIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

import { fetchEvaluacion } from "@/features/evaluacion/services/plantilla/evaluacion";
import { TipoEvaluacion } from "@/features/evaluacion/types/evaluacion";

export default function EditarEvaluacionPage() {
  const navigate = useNavigate();

  // Estados
  const [tiposEvaluacion, setTiposEvaluacion] = useState<TipoEvaluacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabSeleccionado, setTabSeleccionado] = useState<
    "evaluaciones" | "autoevaluaciones"
  >("evaluaciones");

  // Carga de datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const tiposEvaluacionResponse = await fetchEvaluacion();

        setTiposEvaluacion(
          Array.isArray(tiposEvaluacionResponse) ? tiposEvaluacionResponse : [],
        );
      } catch (error) {
        console.error("Error al cargar tipos de evaluación:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrado
  const autoevaluaciones = useMemo(
    () => tiposEvaluacion.filter((t) => t.auto),
    [tiposEvaluacion],
  );
  const evaluaciones = useMemo(
    () => tiposEvaluacion.filter((t) => !t.auto),
    [tiposEvaluacion],
  );

  const lista =
    tabSeleccionado === "evaluaciones" ? evaluaciones : autoevaluaciones;
  const isEvaluaciones = tabSeleccionado === "evaluaciones";

  // --- Componente: Tarjeta de Plantilla (Admin Style) ---
  const TemplateCard = ({
    tipo,
    onClick,
  }: {
    tipo: TipoEvaluacion;
    onClick: () => void;
  }) => (
    <Card
      isPressable
      className="group border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-primary-300 transition-all duration-200 bg-white dark:bg-gray-900 h-full"
      onPress={onClick}
    >
      <CardBody className="p-5 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div
            className={`p-3 rounded-xl transition-colors ${isEvaluaciones ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20" : "bg-purple-50 text-purple-600 dark:bg-purple-900/20"}`}
          >
            {isEvaluaciones ? (
              <DocumentTextIcon className="w-6 h-6" />
            ) : (
              <UserIcon className="w-6 h-6" />
            )}
          </div>
          {/* Icono de edición que aparece al hacer hover */}
          <div className="text-gray-300 group-hover:text-primary-600 transition-colors">
            <PencilSquareIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight group-hover:text-primary-700 transition-colors">
            {tipo.n_tipo_evaluacion}
          </h3>
          <div className="flex items-center gap-2">
            <Chip
              className={`h-6 px-2 text-xs font-medium ${isEvaluaciones ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}
              size="sm"
              variant="flat"
            >
              {isEvaluaciones
                ? "Plantilla Evaluación"
                : "Plantilla AutoEvaluación"}
            </Chip>
          </div>
        </div>

        <Divider className="my-4 bg-gray-100 dark:bg-gray-800" />

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Acción
          </span>
          <div className="flex items-center gap-1 text-sm font-semibold text-gray-600 group-hover:text-primary-600 transition-colors">
            Editar Contenido{" "}
            <ChevronRightIcon className="w-3 h-3 stroke-[3px]" />
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
        <SwatchIcon className="w-10 h-10" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
        {isEvaluaciones
          ? "Sin Plantillas de Evaluación"
          : "Sin Plantillas de Autoevaluación"}
      </h3>
      <p className="text-sm text-gray-500 text-center max-w-xs mb-6">
        Define los criterios, preguntas y estructura creando tu primera
        plantilla.
      </p>
      <Button
        color="primary"
        startContent={<PlusIcon className="w-4 h-4" />}
        onPress={() =>
          navigate(
            `/evaluacion-crear?auto=${tabSeleccionado === "autoevaluaciones"}`,
          )
        }
      >
        Crear Nueva Plantilla
      </Button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b1220]">
        <div className="flex flex-col items-center gap-4">
          <Spinner color="primary" size="lg" />
          <p className="text-sm text-gray-500 font-medium">
            Cargando plantillas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b1220] pb-10">
      {/* 1. Header Principal (Sticky & Clean) */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 pt-8 pb-8 px-6 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              <SwatchIcon className="w-8 h-8 text-gray-400" />
              Gestión de Plantillas
            </h1>
            <p className="text-gray-500 mt-1">
              Diseña y configura los instrumentos de evaluación.
            </p>
          </div>
          <Button
            className="font-medium shadow-lg shadow-blue-500/20"
            color="primary"
            size="lg"
            startContent={<PlusIcon className="w-5 h-5" />}
            onPress={() =>
              navigate(
                `/evaluacion-crear?auto=${tabSeleccionado === "autoevaluaciones"}`,
              )
            }
          >
            {isEvaluaciones ? "Nueva Plantilla" : "Nueva Plantilla "}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 2. Tabs de Navegación */}
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

        {/* 3. Grid de Tarjetas */}
        {lista.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {lista.map((tipo, index) => (
              <TemplateCard
                key={`${tabSeleccionado}-${tipo.id || index}`}
                tipo={tipo}
                onClick={() =>
                  navigate("/evaluacion-editar/edicion", {
                    state: { tipoEvaluacion: tipo },
                  })
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
