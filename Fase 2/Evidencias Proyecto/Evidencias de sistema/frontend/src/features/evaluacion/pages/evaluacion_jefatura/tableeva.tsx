import type {
  EvaluacionJefe,
  EstadoEvaluacion,
} from "@/features/evaluacion/types/evaluacion";

import React, { useEffect, useState, Suspense, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addToast } from "@heroui/toast";
import { Spinner } from "@heroui/spinner";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Tooltip } from "@heroui/tooltip";
import { Progress } from "@heroui/progress";
import {
  FunnelIcon,
  ChevronLeftIcon,
  ArrowPathIcon,
  UserGroupIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

import { columns2 } from "@/hooks/columns";
import axios from "@/services/google/axiosInstance";
import { EstadoEvaluacionBadge } from "@/features/evaluacion/components/flow/EstadoEvaluacionBadge";

// Lazy load
const OptimizedTableComponent = React.lazy(() =>
  import("@/shared/components").then((mod) => ({
    default: mod.OptimizedTableComponent,
  })),
);

// Tipos
interface EvaluacionFormateada {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  foto_thumbnail?: string;
  ciclo: string;
  cargo: string;
  completado: boolean;
  estado_texto: string;
  estado: EstadoEvaluacion;
  accion?: string;
  porcentaje_total?: number;
}

// Configuración de filtros para el Select
const filterOptions = [
  { key: "all", label: "Todos los estados" },
  { key: "pendientes", label: "⏳ Pendientes" },
  { key: "completadas", label: "✅ Completadas" }, // Completas pero no necesariamente cerradas
  { key: "retroalimentar", label: "💬 Por Retroalimentar" },
  { key: "firmar", label: "🔒 Aceptar (Cerradas)" },
  { key: "finalizadas", label: "📝 Finalizadas (Firmadas)" },
];

export default function TableevaPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  // Estados
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(""); // Estado local para el input
  const [asignaciones, setAsignaciones] = useState<EvaluacionJefe[]>([]);
  const [cargandoAsignaciones, setCargandoAsignaciones] = useState(true);
  const [filtroActivo, setFiltroActivo] = useState<string>("all");

  // Contexto
  const tipo_evaluacion = state?.tipo_evaluacion;
  const fecha_evaluacion = state?.fecha_evaluacion;

  // Formato Fecha
  const periodoFormateado = useMemo(() => {
    if (!fecha_evaluacion) return "";
    const [year, month] = fecha_evaluacion.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);

    return date.toLocaleDateString("es-CL", { year: "numeric", month: "long" });
  }, [fecha_evaluacion]);

  // Carga de Datos
  useEffect(() => {
    const cargarAsignaciones = async () => {
      try {
        setCargandoAsignaciones(true);
        const resp = await axios.get("/evaluacion/api/evaluaciones-jefe");
        const todas = resp.data as EvaluacionJefe[];

        const filtradas = todas
          .filter(
            (a) =>
              a?.tipo_evaluacion?.id === tipo_evaluacion?.id &&
              a?.fecha_evaluacion === fecha_evaluacion,
          )
          .map((a) => ({
            ...a,
            __isPonderada:
              typeof a?.ponderada === "boolean" ? a.ponderada : !!a?.ponderada,
          }));

        setAsignaciones(filtradas);
      } catch (err) {
        console.error(err);
        addToast({
          title: "Error",
          description: "No se pudieron cargar los datos.",
          color: "danger",
        });
      } finally {
        setCargandoAsignaciones(false);
      }
    };

    cargarAsignaciones();
  }, [tipo_evaluacion?.id, fecha_evaluacion]);

  // Determinación de Estado (Lógica de Negocio)
  const determinarEstado = (evaluacion: EvaluacionJefe): EstadoEvaluacion => {
    if (evaluacion.firmado || evaluacion.firmado_obs) return "finalizado";
    if (evaluacion.retroalimentacion && evaluacion.cerrado_para_firma)
      return "firmar";
    if (evaluacion.completado) return "retroalimentar";

    return "pendiente";
  };

  // Filtrado y Búsqueda Combinados
  const datosProcesados = useMemo(() => {
    let data = asignaciones;

    // 1. Filtro por Estado
    if (filtroActivo !== "all") {
      data = data.filter((a) => {
        const estado = determinarEstado(a);

        switch (filtroActivo) {
          case "pendientes":
            return estado === "pendiente";
          case "completadas":
            return a.completado; // Genérico
          case "retroalimentar":
            return estado === "retroalimentar";
          case "firmar":
            return estado === "firmar";
          case "finalizadas":
            return estado === "finalizado";
          default:
            return true;
        }
      });
    }

    // 2. Filtro por Búsqueda (Nombre/Apellido/Cargo)
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();

      data = data.filter(
        (a) =>
          a.persona?.first_name?.toLowerCase().includes(lower) ||
          a.persona?.last_name?.toLowerCase().includes(lower) ||
          a.persona?.cargo?.toLowerCase().includes(lower),
      );
    }

    return data;
  }, [asignaciones, filtroActivo, searchTerm]);

  // Formateo para Tabla
  const dataFormateada = useMemo(() => {
    return datosProcesados.map((a): EvaluacionFormateada => {
      const user = a?.persona;
      const estado = determinarEstado(a);

      let estado_texto = "Pendiente";
      let accion = "Evaluar";

      if (estado === "finalizado") {
        estado_texto = "Finalizado";
        accion = "Ver Resumen";
      } else if (estado === "retroalimentar") {
        estado_texto = "Retroalimentar";
        accion = "Retroalimentar";
      } else if (estado === "firmar") {
        estado_texto = "Aceptar";
        accion = "Ver resumen";
      }

      return {
        id: a.id,
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        email: user?.email || "",
        foto_thumbnail: user?.foto_thumbnail,
        ciclo: user?.ciclo || "",
        cargo: user?.cargo || "",
        completado: !!a?.completado,
        estado_texto,
        estado,
        accion,
        porcentaje_total: a.porcentaje_total,
      };
    });
  }, [datosProcesados]);

  // Estadísticas Rápidas (KPIs)
  const stats = useMemo(() => {
    const total = asignaciones.length; // Sobre el total REAL, no filtrado
    const finalizadas = asignaciones.filter(
      (a) => determinarEstado(a) === "finalizado",
    ).length;
    const pendientes = asignaciones.filter(
      (a) => determinarEstado(a) === "pendiente",
    ).length;
    const avance = total > 0 ? (finalizadas / total) * 100 : 0;

    // Promedio solo de las completadas/finalizadas para no sesgar con 0s
    const evaluadas = asignaciones.filter((a) => a.completado);
    const promedio =
      evaluadas.length > 0
        ? Math.round(
            evaluadas.reduce(
              (acc, curr) => acc + (curr.porcentaje_total || 0),
              0,
            ) / evaluadas.length,
          )
        : 0;

    return { total, finalizadas, pendientes, avance, promedio };
  }, [asignaciones]);

  // Acciones
  const handleActionClick = (userId: number) => {
    const evaluacion = datosProcesados.find((a) => a.id === userId);

    if (!evaluacion) return;

    if (!evaluacion.completado) {
      navigate(`/evaluacion-jefatura/tabla/formulario`, {
        state: { id: evaluacion.id },
      });
    } else if (evaluacion.completado && !evaluacion.retroalimentacion) {
      navigate(`/evaluacion-jefatura/tabla/retroalimentacion`, {
        state: { id: evaluacion.id },
      });
    } else {
      navigate(`/evaluacion-jefatura/tabla/detalle`, {
        state: { id: evaluacion.id },
      });
    }
  };

  const handleVerProgreso = (userId: number) => {
    navigate(`/evaluacion-jefatura/tabla/detalle-progreso`, {
      state: { id: userId },
    });
  };

  const getButtonText = (userId: number) =>
    dataFormateada.find((a) => a.id === userId)?.accion || "";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b1220] pb-10">
      {/* 1. Header Contextual */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 pt-6 pb-8 px-6 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4 text-gray-500 text-sm">
            <button
              className="hover:text-blue-600 flex items-center gap-1 transition-colors"
              onClick={() => navigate(-1)}
            >
              <ChevronLeftIcon className="w-4 h-4" />
              Volver al panel
            </button>
            <span>/</span>
            <span className="font-medium text-gray-900 dark:text-white">
              Evaluaciones
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                {tipo_evaluacion?.n_tipo_evaluacion || "Evaluación"}
                <span className="text-lg font-normal text-gray-400 dark:text-gray-500">
                  |
                </span>
                <span className="text-xl text-gray-600 dark:text-gray-300 font-medium capitalize">
                  {periodoFormateado}
                </span>
              </h1>
            </div>

            {/* Mini Dashboard Inline */}
            <div className="flex items-center gap-6 bg-gray-50 dark:bg-gray-800/50 p-2 pr-6 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 px-4 border-r border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                  <UserGroupIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Total
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {stats.total}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 border-r border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600">
                  <ClockIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Pendientes
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {stats.pendientes}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 pl-2">
                <div className="w-32">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      Avance Global
                    </span>
                    <span className="font-bold text-emerald-600">
                      {Math.round(stats.avance)}%
                    </span>
                  </div>
                  <Progress
                    aria-label="Avance"
                    classNames={{ indicator: "rounded-full" }}
                    color="success"
                    size="sm"
                    value={stats.avance}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* 2. Contenedor Principal de Tabla */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
          {/* Toolbar Integrada */}
          <CardHeader className="flex flex-col md:flex-row gap-4 px-6 py-5 border-b border-gray-100 dark:border-gray-800 justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Select
                className="w-full md:w-56"
                placeholder="Filtrar por estado"
                radius="lg"
                selectedKeys={[filtroActivo]}
                selectionMode="single"
                size="sm"
                startContent={<FunnelIcon className="w-4 h-4 text-gray-400" />}
                variant="bordered"
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(
                    keys as Set<React.Key>,
                  )[0] as string;

                  setFiltroActivo(selectedKey);
                  setPage(1);
                }}
              >
                {filterOptions.map((opt) => (
                  <SelectItem key={opt.key}>{opt.label}</SelectItem>
                ))}
              </Select>

              <Tooltip content="Recargar / Limpiar">
                <Button
                  isIconOnly
                  variant="light"
                  onPress={() => {
                    setFiltroActivo("all");
                    setSearchTerm("");
                  }}
                >
                  <ArrowPathIcon className="w-5 h-5 text-gray-500" />
                </Button>
              </Tooltip>
            </div>
          </CardHeader>

          <CardBody className="p-0 min-h-[500px]">
            {cargandoAsignaciones ? (
              <div className="flex flex-col items-center justify-center h-96 gap-4">
                <Spinner color="primary" size="lg" />
                <p className="text-gray-500 text-sm">
                  Cargando colaboradores...
                </p>
              </div>
            ) : (
              <Suspense
                fallback={
                  <div className="h-96 flex items-center justify-center">
                    <Spinner />
                  </div>
                }
              >
                <OptimizedTableComponent
                  columns={columns2}
                  data={dataFormateada}
                  getButtonText={getButtonText}
                  loading={false}
                  page={page}
                  renderCell={(
                    item: EvaluacionFormateada,
                    columnKey: string,
                  ) => {
                    if (columnKey === "estado_texto") {
                      return (
                        <EstadoEvaluacionBadge
                          estado={item.estado}
                          size="sm"
                          variant="flat"
                        />
                      );
                    }
                    if (columnKey === "accion") {
                      return (
                        <div className="flex items-center gap-2 justify-end">
                          {!item.completado && (
                            <Button
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              color="primary"
                              size="sm"
                              variant="light"
                              onPress={() => handleVerProgreso(item.id)}
                            >
                              Progreso
                            </Button>
                          )}
                          <Button
                            className="font-medium shadow-sm min-w-[100px]"
                            color={item.completado ? "success" : "primary"}
                            size="sm"
                            variant={item.completado ? "flat" : "solid"}
                            onPress={() => handleActionClick(item.id)}
                          >
                            {getButtonText(item.id)}
                          </Button>
                        </div>
                      );
                    }
                    if (columnKey === "porcentaje_total") {
                      // Renderizar un mini score si existe
                      return item.porcentaje_total ? (
                        <span className="font-bold text-gray-700 dark:text-gray-300">
                          {item.porcentaje_total}%
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      );
                    }

                    return undefined;
                  }}
                  searchTerm="" // Ya manejamos el filtrado externamente en 'datosProcesados'
                  setPage={setPage}
                  onButtonClick={handleActionClick}
                />
              </Suspense>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
