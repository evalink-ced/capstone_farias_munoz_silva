// features/evaluacion/autoevaluacion/pages/AutoevaluacionInicioPage.tsx
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Tabs, Tab } from "@heroui/tabs";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Skeleton } from "@heroui/skeleton";
import { addToast } from "@heroui/toast";

// Iconos estándar (Heroicons)
import {
  ClipboardDocumentCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartPieIcon,
  Squares2X2Icon,
  TableCellsIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

import { useAutoevaluaciones } from "@/features/evaluacion/hooks/useAutoevaluaciones";
import { EvaluacionGrid } from "@/features/evaluacion/components/autoevaluacion/PageInicio";

// --- Tipos ---
interface Estadisticas {
  total: number;
  completadas: number;
  pendientes: number;
  progresoGeneral: number;
  promedioLogro: number;
}

// --- Componente StatCard Moderno (Bento Style) ---
interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string; // Opcional: para mostrar "+5%" etc
  color: "blue" | "amber" | "green" | "purple";
}

const StatCard = ({ title, value, subtitle, icon, color }: StatCardProps) => {
  const styles = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    green:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    purple:
      "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  };

  return (
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
            {subtitle && (
              <span className="text-xs font-medium text-gray-400">
                {subtitle}
              </span>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-xl ${styles[color]}`}>{icon}</div>
      </CardBody>
    </Card>
  );
};

export default function AutoevaluacionInicioPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"pendientes" | "finalizadas">("pendientes");
  const { pendientes, finalizadas, loading, error } = useAutoevaluaciones();

  // --- Lógica de Negocio (Intacta) ---
  const all = useMemo(
    () => [...pendientes, ...finalizadas],
    [pendientes, finalizadas],
  );

  const [yearFilter, setYearFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const years = useMemo(() => {
    const extractYear = (v: any) => {
      const s = String(v?.fecha_evaluacion ?? v?.periodo ?? "");
      const m = s.match(/(\d{4})/);

      return m ? m[1] : null;
    };
    const setYears = new Set<string>();

    all.forEach((ev: any) => {
      const y = extractYear(ev);

      if (y) setYears.add(y);
    });

    return Array.from(setYears).sort((a, b) => Number(b) - Number(a));
  }, [all]);

  const yearItems = useMemo(
    () => [
      { key: "all", label: "Todos los años" },
      ...years.map((y) => ({ key: y, label: y })),
    ],
    [years],
  );

  const sortByPeriodDesc = (arr: any[]) => {
    return [...arr].sort((a, b) =>
      String(b?.fecha_evaluacion ?? "").localeCompare(
        String(a?.fecha_evaluacion ?? ""),
      ),
    );
  };

  const filteredPendientes = useMemo(() => {
    const base =
      yearFilter === "all"
        ? pendientes
        : pendientes.filter((ev: any) =>
            String(ev?.fecha_evaluacion ?? ev?.periodo ?? "").includes(
              yearFilter,
            ),
          );

    return sortByPeriodDesc(base);
  }, [pendientes, yearFilter]);

  const filteredFinalizadas = useMemo(() => {
    const base =
      yearFilter === "all"
        ? finalizadas
        : finalizadas.filter((ev: any) =>
            String(ev?.fecha_evaluacion ?? ev?.periodo ?? "").includes(
              yearFilter,
            ),
          );

    return sortByPeriodDesc(base);
  }, [finalizadas, yearFilter]);

  const estadisticas = useMemo((): Estadisticas => {
    const total = pendientes.length + finalizadas.length;
    const completadas = finalizadas.length;
    const progresoGeneral = total > 0 ? (completadas / total) * 100 : 0;
    const promedioLogro =
      finalizadas.length > 0
        ? finalizadas.reduce(
            (acc: number, item: any) => acc + (item?.logro_obtenido || 0),
            0,
          ) / finalizadas.length
        : 0;

    return {
      total,
      completadas,
      pendientes: pendientes.length,
      progresoGeneral,
      promedioLogro,
    };
  }, [pendientes, finalizadas]);

  const openEvaluacion = useCallback(
    async (id: number | string, finalizada: boolean) => {
      if (!finalizada) {
        navigate("/autoevaluacion/inicio/formulario", {
          state: { id: String(id), from: "/autoevaluacion/inicio" },
        });

        return;
      }
      try {
        navigate("/autoevaluacion/inicio/detalle", {
          state: { id: String(id), from: "/autoevaluacion/inicio" },
        });
      } catch (error) {
        addToast({
          title: "Error",
          description: "No se pudo abrir el detalle.",
          color: "danger",
        });
      }
    },
    [navigate],
  );

  // --- Renderizado ---

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mis Autoevaluaciones
          </h1>
          <p className="text-gray-500 mt-1">
            Gestiona tu historial y tareas pendientes.
          </p>
        </div>
        {/* Aquí podrías poner un botón de "Descargar Reporte" si existiera la función */}
      </div>

      {/* 2. STATS GRID (Diseño Limpio) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          color="blue"
          icon={<ClipboardDocumentCheckIcon className="w-6 h-6" />}
          title="Total Asignadas"
          value={estadisticas.total}
        />
        <StatCard
          color="amber"
          icon={<ClockIcon className="w-6 h-6" />}
          subtitle="Requieren atención"
          title="Pendientes"
          value={estadisticas.pendientes}
        />
        <StatCard
          color="green"
          icon={<CheckCircleIcon className="w-6 h-6" />}
          title="Completadas"
          value={estadisticas.completadas}
        />
        <StatCard
          color="purple"
          icon={<ChartPieIcon className="w-6 h-6" />}
          title="Progreso Global"
          value={`${Math.round(estadisticas.progresoGeneral)}%`}
        />
      </div>

      {/* 3. CONTENIDO PRINCIPAL (Tabs + Filtros + Lista) */}
      <Card className="shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardHeader className="flex flex-col md:flex-row gap-4 justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          {/* Tabs */}
          <Tabs
            aria-label="Estado de evaluaciones"
            classNames={{
              tabList: "gap-4",
              cursor: "w-full bg-blue-50 dark:bg-blue-900/20",
              tabContent:
                "group-data-[selected=true]:text-blue-600 font-medium",
            }}
            color="primary"
            selectedKey={tab}
            variant="light"
            onSelectionChange={(k) => setTab(k as any)}
          >
            <Tab
              key="pendientes"
              title={
                <div className="flex items-center gap-2">
                  <span>Pendientes</span>
                  {estadisticas.pendientes > 0 && (
                    <Chip color="warning" size="sm" variant="flat">
                      {estadisticas.pendientes}
                    </Chip>
                  )}
                </div>
              }
            />
            <Tab
              key="finalizadas"
              title={
                <div className="flex items-center gap-2">
                  <span>Finalizadas</span>
                  {estadisticas.completadas > 0 && (
                    <Chip color="success" size="sm" variant="flat">
                      {estadisticas.completadas}
                    </Chip>
                  )}
                </div>
              }
            />
          </Tabs>

          {/* Toolbar (Filtros y Vista) */}
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
                  viewMode === "cards"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-500"
                }
                color={viewMode === "cards" ? "secondary" : "default"}
                size="sm"
                variant={viewMode === "cards" ? "solid" : "light"}
                onPress={() => setViewMode("cards")}
              >
                <Squares2X2Icon className="w-5 h-5" />
              </Button>
              <Button
                isIconOnly
                className={
                  viewMode === "table"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-500"
                }
                color={viewMode === "table" ? "secondary" : "default"}
                size="sm"
                variant={viewMode === "table" ? "solid" : "light"}
                onPress={() => setViewMode("table")}
              >
                <TableCellsIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardBody className="p-6 min-h-[400px]">
          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border p-4 rounded-xl space-y-3">
                  <Skeleton className="w-1/3 h-4 rounded-lg" />
                  <Skeleton className="w-full h-24 rounded-lg" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="text-center py-10 text-red-500">
              <p>Error: {error}</p>
              <Button
                className="mt-4"
                color="danger"
                size="sm"
                variant="flat"
                onPress={() => window.location.reload()}
              >
                Reintentar
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!loading &&
            !error &&
            ((tab === "pendientes" ? filteredPendientes : filteredFinalizadas)
              .length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <ClipboardDocumentCheckIcon className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">
                  No hay evaluaciones en esta sección
                </p>
                <p className="text-sm">Prueba cambiando el filtro de año.</p>
              </div>
            ) : // Content
            viewMode === "cards" ? (
              <EvaluacionGrid
                finalizada={tab === "finalizadas"}
                items={
                  tab === "pendientes"
                    ? filteredPendientes
                    : filteredFinalizadas
                }
                onOpen={(id) => openEvaluacion(id, tab === "finalizadas")}
              />
            ) : (
              <TableView
                isPendiente={tab === "pendientes"}
                items={
                  tab === "pendientes"
                    ? filteredPendientes
                    : filteredFinalizadas
                }
                onAction={openEvaluacion}
              />
            ))}
        </CardBody>
      </Card>
    </div>
  );
}

// --- Subcomponente Tabla para mantener limpio el principal ---
const TableView = ({
  items,
  isPendiente,
  onAction,
}: {
  items: any[];
  isPendiente: boolean;
  onAction: any;
}) => (
  <Table
    aria-label="Tabla de evaluaciones"
    classNames={{ wrapper: "p-0" }}
    shadow="none"
  >
    <TableHeader>
      <TableColumn>NOMBRE</TableColumn>
      <TableColumn>PERIODO</TableColumn>
      <TableColumn>ESTADO</TableColumn>
      <TableColumn align="end">ACCIÓN</TableColumn>
    </TableHeader>
    <TableBody>
      {items.map((ev: any) => (
        <TableRow key={ev.id}>
          <TableCell className="font-medium">
            {ev?.tipo_evaluacion?.n_tipo_evaluacion || "Autoevaluación"}
          </TableCell>
          <TableCell>{ev?.fecha_evaluacion || ev?.periodo}</TableCell>
          <TableCell>
            <Chip
              color={isPendiente ? "warning" : "success"}
              size="sm"
              variant="dot"
            >
              {isPendiente ? "Pendiente" : "Finalizada"}
            </Chip>
          </TableCell>
          <TableCell>
            <Button
              color="primary"
              size="sm"
              variant="flat"
              onPress={() =>
                onAction(String(ev.id).split("/")[0], !isPendiente)
              }
            >
              {isPendiente ? "Continuar" : "Ver Resultados"}
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
