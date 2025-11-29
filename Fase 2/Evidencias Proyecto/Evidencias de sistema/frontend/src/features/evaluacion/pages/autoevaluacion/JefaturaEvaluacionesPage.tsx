// features/evaluacion/jefatura/pages/JefaturaEvaluacionesPage.tsx
import type {
  EvaluacionJefe,
  EstadoEvaluacion,
} from "@/features/evaluacion/types/evaluacion";

import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Tabs, Tab } from "@heroui/tabs";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { addToast } from "@heroui/toast";

// Iconos
import {
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
  ChatBubbleBottomCenterTextIcon,
  PencilSquareIcon,
  Squares2X2Icon,
  TableCellsIcon,
  FunnelIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

// Componentes internos
import { TimelineEvaluacion } from "@/features/evaluacion/components/flow";
import { useEvaluacionesJefe } from "@/features/evaluacion/hooks/useEvaluacionesJefe";

// --- Componente de Estadística (KPI) ---
const StatCard = ({ title, value, icon, color, actionLabel }: any) => (
  <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
    <CardBody className="p-5 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </span>
        </div>
        {actionLabel && (
          <p className="text-xs text-blue-600 mt-1 font-medium">
            {actionLabel}
          </p>
        )}
      </div>
      <div
        className={`p-3 rounded-xl bg-${color}-50 text-${color}-600 dark:bg-${color}-900/20`}
      >
        {icon}
      </div>
    </CardBody>
  </Card>
);

export default function JefaturaEvaluacionesPage() {
  const navigate = useNavigate();

  // Estados de UI
  const [tab, setTab] = useState<"en-proceso" | "finalizadas">("en-proceso");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Data
  const { evaluaciones, loading, error } = useEvaluacionesJefe({
    soloMisEvaluaciones: true,
    debug: true,
  });

  // --- Lógica de Negocio: Determinación de Estados ---
  const getEstadoEvaluacion = useCallback(
    (ev: EvaluacionJefe): EstadoEvaluacion => {
      if (ev.firmado || ev.firmado_obs) return "finalizado";
      if (ev.retroalimentacion && ev.cerrado_para_firma) return "firmar";
      if (ev.completado) return "retroalimentar";

      return "pendiente";
    },
    [],
  );

  // --- Lógica de Negocio: Estadísticas Calculadas ---
  const stats = useMemo(() => {
    const total = evaluaciones.length;
    const finalizadas = evaluaciones.filter(
      (e) => getEstadoEvaluacion(e) === "finalizado",
    ).length;
    // Métricas accionables para el jefe
    const porRetroalimentar = evaluaciones.filter(
      (e) => getEstadoEvaluacion(e) === "retroalimentar",
    ).length;
    const porFirmar = evaluaciones.filter(
      (e) => getEstadoEvaluacion(e) === "firmar",
    ).length;
    const enEspera = evaluaciones.filter(
      (e) => getEstadoEvaluacion(e) === "pendiente",
    ).length;

    return { total, finalizadas, porRetroalimentar, porFirmar, enEspera };
  }, [evaluaciones, getEstadoEvaluacion]);

  // --- Filtros ---
  const years = useMemo(() => {
    const setYears = new Set<string>();

    evaluaciones.forEach((ev) => {
      const m = String(ev?.fecha_evaluacion ?? "").match(/(\d{4})/);

      if (m) setYears.add(m[1]);
    });

    return Array.from(setYears).sort((a, b) => Number(b) - Number(a));
  }, [evaluaciones]);

  const yearItems = useMemo(
    () => [
      { key: "all", label: "Todos los años" },
      ...years.map((y) => ({ key: y, label: y })),
    ],
    [years],
  );

  const evaluacionesFiltradas = useMemo(() => {
    // 1. Filtrar por Tab
    let filtradas = evaluaciones.filter((ev) => {
      const estado = getEstadoEvaluacion(ev);

      return tab === "en-proceso"
        ? estado !== "finalizado"
        : estado === "finalizado";
    });

    // 2. Filtrar por Año
    if (yearFilter !== "all") {
      filtradas = filtradas.filter((ev) =>
        String(ev?.fecha_evaluacion ?? "").includes(yearFilter),
      );
    }

    // 3. Ordenar
    return filtradas.sort((a, b) =>
      String(b?.fecha_evaluacion ?? "").localeCompare(
        String(a?.fecha_evaluacion ?? ""),
      ),
    );
  }, [evaluaciones, tab, yearFilter, getEstadoEvaluacion]);

  // --- Acciones ---
  const openEvaluacion = useCallback(
    (id: number) => {
      const evaluacion = evaluaciones.find((ev) => ev.id === id);

      if (!evaluacion) return;

      const estado = getEstadoEvaluacion(evaluacion);

      if (estado === "pendiente") {
        addToast({
          title: "Evaluación en curso",
          description: "El colaborador aún está completando su autoevaluación.",
          color: "warning",
          variant: "solid",
        });

        return;
      }

      // Pasamos el estado de firmado explícitamente si es necesario
      const firmado = estado === "finalizado";

      navigate("/autoevaluacion/jefatura/detalle", { state: { id, firmado } });
    },
    [navigate, evaluaciones, getEstadoEvaluacion],
  );

  // Helper para texto (mantenido de tu lógica original)
  const extractTexto = (ev: EvaluacionJefe) =>
    ev?.retroalimentacion ?? ev?.text_destacar ?? ev?.text_mejorar ?? undefined;

  // --- Render ---
  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Revisar Mis Evaluaciones
          </h1>
          <p className="text-gray-500 mt-1">
            Revisa el proceso de las evaluaciones realizadas por tu jefatura.
          </p>
        </div>
      </div>

      {/* 2. STATS (Dashboard Accionable) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          color="gray"
          icon={<ClockIcon className="w-6 h-6" />}
          title="En Espera"
          value={stats.enEspera}
        />
        <StatCard
          actionLabel={
            stats.porRetroalimentar > 0 ? "Requiere acción inmediata" : null
          }
          color="amber"
          icon={<ChatBubbleBottomCenterTextIcon className="w-6 h-6" />}
          title="Por Retroalimentar"
          value={stats.porRetroalimentar}
        />


        <StatCard
          actionLabel={stats.porFirmar > 0 ? "Firma pendiente" : null}
          color="blue"
          icon={<PencilSquareIcon className="w-6 h-6" />}
          title="Por Aceptar"
          value={stats.porFirmar}
        />
        <StatCard
          color="green"
          icon={<CheckCircleIcon className="w-6 h-6" />}
          title="Finalizadas"
          value={stats.finalizadas}
        />
      </div>

      {/* 3. MAIN CONTENT */}
      <Card className="shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 min-h-[500px]">
        <CardHeader className="flex flex-col md:flex-row gap-4 justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          {/* Tabs */}
          <Tabs
            aria-label="Filtro de estado"
            classNames={{
              cursor: "bg-blue-50 dark:bg-blue-900/20",
              tabContent:
                "group-data-[selected=true]:text-blue-600 font-medium",
            }}
            color="primary"
            selectedKey={tab}
            variant="light"
            onSelectionChange={(k) => setTab(k as any)}
          >
            <Tab
              key="en-proceso"
              title={
                <div className="flex items-center gap-2">
                  <span>En Proceso</span>
                  <Chip color="primary" size="sm" variant="flat">
                    {stats.enEspera + stats.porRetroalimentar + stats.porFirmar}
                  </Chip>
                </div>
              }
            />
            <Tab
              key="finalizadas"
              title={
                <div className="flex items-center gap-2">
                  <span>Finalizadas</span>
                  <Chip color="success" size="sm" variant="flat">
                    {stats.finalizadas}
                  </Chip>
                </div>
              }
            />
          </Tabs>

          {/* Toolbar */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Select
              className="w-40"
              defaultSelectedKeys={["all"]}
              selectedKeys={[yearFilter]}
              size="sm"
              startContent={<FunnelIcon className="w-4 h-4 text-gray-400" />}
              onSelectionChange={(keys) =>
                setYearFilter(Array.from(keys)[0] as string)
              }
            >
              {yearItems.map((item) => (
                <SelectItem key={item.key}>{item.label}</SelectItem>
              ))}
            </Select>

            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <Button
                isIconOnly
                className={
                  viewMode === "cards" ? "bg-white shadow-sm" : "text-gray-500"
                }
                size="sm"
                variant={viewMode === "cards" ? "solid" : "light"}
                onPress={() => setViewMode("cards")}
              >
                <Squares2X2Icon className="w-5 h-5" />
              </Button>
              <Button
                isIconOnly
                className={
                  viewMode === "table" ? "bg-white shadow-sm" : "text-gray-500"
                }
                size="sm"
                variant={viewMode === "table" ? "solid" : "light"}
                onPress={() => setViewMode("table")}
              >
                <TableCellsIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardBody className="p-6 bg-gray-50/50 dark:bg-transparent">
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card
                  key={i}
                  className="h-64 border-none shadow-none bg-gray-100 animate-pulse"
                >
                  <CardBody />
                </Card>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-10 text-red-500 bg-red-50 rounded-xl border border-red-100">
              <p>Error: {error}</p>
            </div>
          )}

          {!loading && !error && evaluacionesFiltradas.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <ClipboardDocumentCheckIcon className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">
                No hay evaluaciones en esta vista
              </p>
            </div>
          )}

          {!loading &&
            !error &&
            evaluacionesFiltradas.length > 0 &&
            (viewMode === "cards" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {evaluacionesFiltradas.map((evaluacion) => (
                  <div key={evaluacion.id} className="h-full">
                    {/* Mantenemos tu componente Timeline pero envuelto limpio */}
                    <TimelineEvaluacion
                      compact={true}
                      evaluacion={evaluacion}
                      extractTexto={extractTexto}
                      showPersonaName={true} // Importante para jefatura ver el nombre
                      onOpen={openEvaluacion}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <TablaEvaluaciones
                getEstado={getEstadoEvaluacion}
                items={evaluacionesFiltradas}
                onAction={openEvaluacion}
              />
            ))}
        </CardBody>
      </Card>
    </div>
  );
}

// --- Subcomponente Tabla para limpieza ---
const TablaEvaluaciones = ({ items, getEstado, onAction }: any) => (
  <Table
    aria-label="Tabla Jefatura"
    classNames={{ wrapper: "bg-white p-0 shadow-none" }}
    shadow="none"
  >
    <TableHeader>
      <TableColumn>COLABORADOR</TableColumn>
      <TableColumn>PERIODO</TableColumn>
      <TableColumn>ESTADO ACTUAL</TableColumn>
      <TableColumn align="end">ACCIÓN</TableColumn>
    </TableHeader>
    <TableBody>
      {items.map((ev: any) => {
        const estado = getEstado(ev);
        const colorMap: any = {
          pendiente: "default",
          retroalimentar: "warning",
          firmar: "secondary",
          finalizado: "success",
        };

        return (
          <TableRow key={ev.id}>
            <TableCell>
              <div className="font-medium text-gray-900 dark:text-white">
                {/* Asumiendo que el objeto tiene datos del usuario, si no, usar ID */}
                {ev.nombre_colaborador || `Colaborador #${ev.user_id || ev.id}`}
              </div>
              <div className="text-xs text-gray-500">
                {ev?.tipo_evaluacion?.n_tipo_evaluacion || "Evaluación General"}
              </div>
            </TableCell>
            <TableCell>{ev.fecha_evaluacion}</TableCell>
            <TableCell>
              <Chip
                className="capitalize"
                color={colorMap[estado]}
                size="sm"
                variant="flat"
              >
                {estado}
              </Chip>
            </TableCell>
            <TableCell>
              <Button
                color={estado === "finalizado" ? "success" : "primary"}
                size="sm"
                variant={estado === "finalizado" ? "flat" : "solid"}
                onPress={() => onAction(ev.id)}
              >
                {estado === "retroalimentar"
                  ? "Retroalimentar"
                  : estado === "firmar"
                    ? "Firmar"
                    : estado === "finalizado"
                      ? "Ver Detalle"
                      : "Ver Estado"}
              </Button>
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
);
