import { Button } from "@heroui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { Tabs, Tab } from "@heroui/tabs";
import { Chip } from "@heroui/chip";
import {
  PlusIcon,
  DocumentTextIcon,
  UserIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

import { fetchEvaluacion } from "@/features/evaluacion/services/plantilla/evaluacion";
import { TipoEvaluacion } from "@/features/evaluacion/types/evaluacion";

export default function EditarEvaluacionPage() {
  const navigate = useNavigate();
  const [tiposEvaluacion, setTiposEvaluacion] = useState<TipoEvaluacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabSeleccionado, setTabSeleccionado] = useState<
    "evaluaciones" | "autoevaluaciones"
  >("evaluaciones");

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

  const autoevaluaciones = useMemo(
    () => tiposEvaluacion.filter((t) => t.auto),
    [tiposEvaluacion],
  );

  const evaluaciones = useMemo(
    () => tiposEvaluacion.filter((t) => !t.auto),
    [tiposEvaluacion],
  );

  const lista = tabSeleccionado === "evaluaciones" ? evaluaciones : autoevaluaciones;
  const isEvaluaciones = tabSeleccionado === "evaluaciones";

  const TipoEvaluacionCard = ({
    tipo,
    onClick,
  }: {
    tipo: TipoEvaluacion;
    onClick: () => void;
  }) => (
    <Card
      isPressable
      className="group cursor-pointer border-0 bg-background/60 backdrop-blur-sm 
                 hover:bg-background/80 hover:scale-[1.02] 
                 transition-all duration-300 ease-out
                 shadow-sm hover:shadow-xl hover:shadow-primary/5
                 dark:bg-default-50/5 dark:hover:bg-default-50/10"
      onPress={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between w-full">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isEvaluaciones
              ? "bg-primary/10 text-primary"
              : "bg-secondary/10 text-secondary"
              }`}>
              {isEvaluaciones ? (
                <DocumentTextIcon className="w-5 h-5" />
              ) : (
                <UserIcon className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground leading-tight">
                {tipo.n_tipo_evaluacion}
              </h3>
            </div>
          </div>
          <Chip
            size="sm"
            variant="flat"
            color={isEvaluaciones ? "primary" : "secondary"}
            className="text-xs"
          >
            {isEvaluaciones ? "Evaluación" : "AutoEvaluación"}
          </Chip>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        <p className="text-sm text-default-500 group-hover:text-default-600 transition-colors">
          Click para editar configuración
        </p>
      </CardBody>
    </Card>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className={`p-4 rounded-full mb-4 ${isEvaluaciones
        ? "bg-primary/10 text-primary"
        : "bg-secondary/10 text-secondary"
        }`}>
        {isEvaluaciones ? (
          <DocumentTextIcon className="w-8 h-8" />
        ) : (
          <UserIcon className="w-8 h-8" />
        )}
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        {isEvaluaciones ? "No hay evaluaciones" : "No hay autoevaluaciones"}
      </h3>
      <p className="text-sm text-default-500 text-center mb-6 max-w-sm">
        {isEvaluaciones
          ? "Crea tu primera evaluación para comenzar a gestionar el proceso de evaluación."
          : "Crea tu primera autoevaluación para permitir la autoevaluación de usuarios."
        }
      </p>
      <Button
        color={isEvaluaciones ? "primary" : "secondary"}
        variant="flat"
        startContent={<PlusIcon className="w-4 h-4" />}
        onPress={() =>
          navigate(
            `/evaluacion-crear?auto=${tabSeleccionado === "autoevaluaciones"}`,
          )
        }
      >
        {isEvaluaciones ? "Crear Evaluación" : "Crear AutoEvaluación"}
      </Button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Spinner
              size="lg"
              color="primary"
              classNames={{
                circle1: "border-b-primary",
                circle2: "border-b-primary/30",
              }}
            />
            <div className="absolute inset-0 animate-ping">
              <div className="w-full h-full rounded-full bg-primary/10"></div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">Cargando</p>
            <p className="text-sm text-default-500">Obteniendo tipos de evaluación...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/50 rounded-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm">
              <SparklesIcon className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent pb-4">
            Gestión de Plantillas
          </h1>
          <p className="text-default-600 max-w-2xl mx-auto">
            Administra y personaliza tus plantillas de evaluación y autoevaluación
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="p-1 bg-default-100/80 dark:bg-default-100/20 backdrop-blur-sm rounded-xl border border-default-200/50">
            <Tabs
              aria-label="Tipos de evaluación"
              selectedKey={tabSeleccionado}
              onSelectionChange={(key) =>
                setTabSeleccionado(key as "evaluaciones" | "autoevaluaciones")
              }
              classNames={{
                tabList: "gap-1",
                cursor: "bg-background shadow-sm",
                tab: "h-12 px-6 data-[selected=true]:text-foreground",
                tabContent: "group-data-[selected=true]:text-foreground text-default-600"
              }}
            >
              <Tab
                key="evaluaciones"
                title={
                  <div className="flex items-center gap-2">
                    <DocumentTextIcon className="w-4 h-4" />
                    <span>Evaluaciones</span>
                    {evaluaciones.length > 0 && (
                      <Chip size="sm" variant="flat" color="primary" className="text-xs">
                        {evaluaciones.length}
                      </Chip>
                    )}
                  </div>
                }
              />
              <Tab
                key="autoevaluaciones"
                title={
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    <span>AutoEvaluaciones</span>
                    {autoevaluaciones.length > 0 && (
                      <Chip size="sm" variant="flat" color="secondary" className="text-xs">
                        {autoevaluaciones.length}
                      </Chip>
                    )}
                  </div>
                }
              />
            </Tabs>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6 ">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-foreground">
              {isEvaluaciones ? "Evaluaciones" : "AutoEvaluaciones"}
            </h2>
            <Chip
              size="sm"
              variant="flat"
              color={isEvaluaciones ? "primary" : "secondary"}
            >
              {lista.length} {lista.length === 1 ? "plantilla" : "plantillas"}
            </Chip>
          </div>

          <Button
            color={isEvaluaciones ? "primary" : "secondary"}
            variant="shadow"
            startContent={<PlusIcon className="w-4 h-4" />}
            className="font-medium"
            onPress={() =>
              navigate(
                `/evaluacion-crear?auto=${tabSeleccionado === "autoevaluaciones"}`,
              )
            }
          >
            Crear {isEvaluaciones ? "Evaluación" : "AutoEvaluación"}
          </Button>
        </div>

        {/* Content Area */}
        <div className="bg-background/60 backdrop-blur-sm rounded-2xl border border-default-200/50 shadow-sm dark:bg-default-50/5">
          {lista.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {lista.map((tipo, index) => (
                  <TipoEvaluacionCard
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}