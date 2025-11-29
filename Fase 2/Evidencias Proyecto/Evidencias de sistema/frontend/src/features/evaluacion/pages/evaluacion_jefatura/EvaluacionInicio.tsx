import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Progress } from "@heroui/progress";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { addToast } from "@heroui/toast";
import {
  CalendarDaysIcon,
  ArrowRightIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  UsersIcon,
  FunnelIcon,
  Squares2X2Icon,
  TableCellsIcon,
  ChatBubbleBottomCenterTextIcon,
  PencilSquareIcon,
  HandRaisedIcon,
} from "@heroicons/react/24/outline";

import axios from "@/services/google/axiosInstance";

// --- Tipos ---
type EvalAsignacion = {
  id: number;
  fecha_evaluacion: string;
  personas?: any[];
  tipo_evaluacion?: { id: number; n_tipo_evaluacion?: string };
  total_asignadas?: number;
  total_pendientes?: number;
  total_completadas?: number;
  total_pendientes_firma?: number;
  total_con_reunion?: number;
  total_con_retroalimentacion?: number;
  total_cerradas_firma?: number;
  total_firmadas?: number;
};

// --- Componente: Timeline de Proceso (El KPI que te gusta) ---
const ProcessTimeline = ({ stats }: { stats: any }) => {
  const steps = [
    {
      id: "pendientes",
      label: "Pendientes",
      count: stats.pendientes,
      icon: <ClockIcon className="w-5 h-5" />,
      color: "amber", // Tailwind color name base
      desc: "Sin iniciar",
    },
    {
      id: "gestion",
      label: "En Gestión",
      // Agrupamos retroalimentación y completadas (esperando reunión)
      count: stats.conRetroalimentacion + stats.completadas + stats.conReunion,
      icon: <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />,
      color: "blue",
      desc: "Retroalimentación",
    },
    {
      id: "firma",
      label: "Por Aceptar",
      count: stats.cerradasFirma,
      icon: <PencilSquareIcon className="w-5 h-5" />,
      color: "orange",
      desc: "Reunión OK",
    },
    {
      id: "finalizadas",
      label: "Finalizadas",
      count: stats.firmadas,
      icon: <HandRaisedIcon className="w-5 h-5" />,
      color: "emerald",
      desc: "Proceso cerrado",
    },
  ];

  return (
    <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 w-full overflow-visible">
      <CardBody className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-center relative gap-8 md:gap-0">
          {/* Línea conectora (Fondo) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 dark:bg-gray-800 -z-0 -translate-y-4" />

          {steps.map((step, idx) => {
            const isLast = idx === steps.length - 1;
            const hasData = step.count > 0;

            return (
              <div
                key={step.id}
                className="relative z-10 flex flex-col items-center text-center flex-1 w-full md:w-auto"
              >
                {/* Círculo del Icono */}
                <div
                  className={`
                                    w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-sm transition-all duration-300
                                    ${
                                      hasData
                                        ? `bg-${step.color}-500 text-white shadow-${step.color}-200 scale-105`
                                        : `bg-gray-50 text-gray-300 dark:bg-gray-800 dark:text-gray-600 border border-gray-100 dark:border-gray-700`
                                    }
                                `}
                >
                  {step.icon}
                </div>

                {/* Contenido */}
                <div className="flex flex-col gap-1">
                  <span
                    className={`text-2xl font-bold ${hasData ? `text-${step.color}-600` : "text-gray-300"}`}
                  >
                    {step.count}
                  </span>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    {step.label}
                  </span>
                  <span className="text-xs text-gray-400">{step.desc}</span>
                </div>

                {/* Flecha conectora para móvil (opcional) o desktop */}
                {!isLast && (
                  <div className="md:hidden mt-4 text-gray-300">↓</div>
                )}
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};

export default function EvaluacionInicioPage() {
  const [asignaciones, setAsignaciones] = useState<EvalAsignacion[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Filtros
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [tipoFilter, setTipoFilter] = useState<string>("all");
  const [estadoFilter, setEstadoFilter] = useState<
    "all" | "pendiente" | "retroalimentacion" | "reunion" | "firmada"
  >("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Helpers
  const fechaFormateada = useCallback(
    (ym: string) =>
      new Date(`${ym}-01T00:00:00`).toLocaleDateString("es-CL", {
        year: "numeric",
        month: "long",
      }),
    [],
  );

  const normalizePeriodo = useCallback((s?: string | null) => {
    if (!s) return "";
    const m = String(s).match(/(\d{4})-(\d{2})/);

    return m
      ? `${m[1]}-${m[2]}`
      : String(s).length >= 7
        ? String(s).slice(0, 7)
        : String(s);
  }, []);

  // Estadísticas para el Timeline
  const estadisticasGlobales = useMemo(() => {
    const totales = asignaciones.reduce(
      (acc, item) => {
        acc.total += item.total_asignadas || 0;
        acc.completadas += item.total_completadas || 0;
        acc.pendientes += item.total_pendientes || 0;
        acc.conReunion += item.total_con_reunion || 0;
        acc.conRetroalimentacion += item.total_con_retroalimentacion || 0;
        acc.cerradasFirma += item.total_cerradas_firma || 0;
        acc.firmadas += item.total_firmadas || 0;

        return acc;
      },
      {
        total: 0,
        completadas: 0,
        pendientes: 0,
        conReunion: 0,
        conRetroalimentacion: 0,
        cerradasFirma: 0,
        firmadas: 0,
      },
    );

    return totales;
  }, [asignaciones]);

  // Filtros Listas
  const years = useMemo(() => {
    const setYears = new Set<string>();

    asignaciones.forEach((a) => {
      const m = String(a?.fecha_evaluacion ?? "").match(/(\d{4})/);

      if (m) setYears.add(m[1]);
    });

    return Array.from(setYears).sort((a, b) => Number(b) - Number(a));
  }, [asignaciones]);

  const yearItems = useMemo(
    () => [
      { key: "all", label: "Todos los años" },
      ...years.map((y) => ({ key: y, label: y })),
    ],
    [years],
  );

  const tipoItems = useMemo(() => {
    const map = new Map<string, string>();

    asignaciones.forEach((a) => {
      const id = a?.tipo_evaluacion?.id;
      const name = a?.tipo_evaluacion?.n_tipo_evaluacion ?? "Evaluación";

      if (id !== undefined && id !== null) map.set(String(id), name);
    });
    const arr = Array.from(map.entries())
      .map(([key, label]) => ({ key, label }))
      .sort((x, y) => x.label.localeCompare(y.label));

    return [{ key: "all", label: "Todos los tipos" }, ...arr];
  }, [asignaciones]);

  // Filtrado de Datos
  const asignacionesFiltradas = useMemo(() => {
    let arr = asignaciones;

    if (yearFilter !== "all")
      arr = arr.filter((i) =>
        String(i.fecha_evaluacion ?? "").includes(yearFilter),
      );
    if (tipoFilter !== "all")
      arr = arr.filter(
        (i) => String(i?.tipo_evaluacion?.id ?? "") === tipoFilter,
      );
    if (estadoFilter !== "all") {
      arr = arr.filter((i) => {
        switch (estadoFilter) {
          case "firmada":
            return (i.total_firmadas ?? 0) > 0;
          case "reunion":
            return (i.total_cerradas_firma ?? 0) > 0;
          case "retroalimentacion":
            return (
              (i.total_con_retroalimentacion ?? 0) +
                (i.total_completadas ?? 0) >
              0
            );
          case "pendiente":
            return (i.total_pendientes ?? 0) + (i.total_con_reunion ?? 0) > 0;
          default:
            return true;
        }
      });
    }

    return [...arr].sort((a, b) =>
      String(b?.fecha_evaluacion ?? "").localeCompare(
        String(a?.fecha_evaluacion ?? ""),
      ),
    );
  }, [asignaciones, yearFilter, tipoFilter, estadoFilter]);

  // Carga de Datos
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [cardsRes, evalsRes] = await Promise.all([
          axios.get("/evaluacion/api/mostrar-asignacion"),
          axios.get("/evaluacion/api/evaluaciones-jefe"),
        ]);

        const cards = cardsRes.data || [];
        const evals = evalsRes.data || [];

        const stats: Record<string, any> = {};
        const ensureBucket = (key: string) => {
          if (!stats[key])
            stats[key] = {
              total: 0,
              completadas: 0,
              pendientes: 0,
              conReunion: 0,
              conRetroalimentacion: 0,
              cerradasFirma: 0,
              firmadas: 0,
            };
        };

        for (const e of evals) {
          const keyId = `${e?.tipo_evaluacion?.id}|${normalizePeriodo(e?.fecha_evaluacion)}`;
          const keyName = `${(e?.tipo_evaluacion?.n_tipo_evaluacion ?? "").toLowerCase()}|${normalizePeriodo(e?.fecha_evaluacion)}`;

          ensureBucket(keyId);
          ensureBucket(keyName);

          stats[keyId].total += 1;
          stats[keyName].total += 1;

          const firmada = !!(
            e?.firmado ||
            e?.firmado_obs ||
            e?.estado_firma === "firmado" ||
            e?.estado_firma === "firmado_obs"
          );
          const cerradaParaFirma = !!e?.cerrado_para_firma;
          const retro = !!(
            e?.retroalimentacion || e?.retroalimentacion_completada
          );
          const reunion = !!(e?.reunion_realizada || e?.reunion);
          const completada = !!e?.completado;

          if (firmada) {
            stats[keyId].firmadas += 1;
            stats[keyName].firmadas += 1;
          } else if (cerradaParaFirma) {
            stats[keyId].cerradasFirma += 1;
            stats[keyName].cerradasFirma += 1;
          } else if (retro) {
            stats[keyId].conRetroalimentacion += 1;
            stats[keyName].conRetroalimentacion += 1;
          } else if (reunion) {
            stats[keyId].conReunion += 1;
            stats[keyName].conReunion += 1;
          } else if (completada) {
            stats[keyId].completadas += 1;
            stats[keyName].completadas += 1;
          } else {
            stats[keyId].pendientes += 1;
            stats[keyName].pendientes += 1;
          }
        }

        const enriched = cards.map((c: any) => {
          const keyId = `${c?.tipo_evaluacion?.id}|${normalizePeriodo(c?.fecha_evaluacion)}`;
          const keyName = `${(c?.tipo_evaluacion?.n_tipo_evaluacion ?? "").toLowerCase()}|${normalizePeriodo(c?.fecha_evaluacion)}`;
          const s = stats[keyId] ?? stats[keyName];

          return {
            ...c,
            total_asignadas: s?.total ?? c.personas?.length ?? 0,
            total_completadas: s?.completadas ?? 0,
            total_pendientes: s?.pendientes ?? c.personas?.length ?? 0,
            total_con_reunion: s?.conReunion ?? 0,
            total_con_retroalimentacion: s?.conRetroalimentacion ?? 0,
            total_cerradas_firma: s?.cerradasFirma ?? 0,
            total_firmadas: s?.firmadas ?? 0,
          };
        });

        setAsignaciones(enriched);
      } catch (err) {
        addToast({
          title: "Error",
          description: "Error cargando asignaciones",
          color: "danger",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openTabla = (item: EvalAsignacion) => {
    navigate("/evaluacion-jefatura/tabla", {
      state: {
        id: item.id,
        fecha_evaluacion: item.fecha_evaluacion,
        personas: item.personas,
        tipo_evaluacion: item.tipo_evaluacion,
        data: item,
      },
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Panel de Evaluaciones
          </h1>
          <p className="text-gray-500 mt-1">
            Visión global del proceso y campañas activas.
          </p>
        </div>
        <Button
          className="font-medium shadow-md shadow-blue-500/20"
          color="primary"
          startContent={<UsersIcon className="w-5 h-5" />}
          onPress={() =>
            navigate("/evaluacion-jefatura/autoevaluaciones-equipo")
          }
        >
          Autoevaluaciones de mi equipo
        </Button>
      </div>

      {/* 2. Process Timeline KPI (La visualización que preferías) */}
      {!loading && asignaciones.length > 0 && (
        <ProcessTimeline stats={estadisticasGlobales} />
      )}

      {/* 3. Filtros y Contenido */}
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 min-h-[500px]">
        {/* Toolbar */}
        <CardHeader className="flex flex-col md:flex-row gap-4 justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Select
              className="w-40"
              selectedKeys={[yearFilter]}
              size="sm"
              startContent={<FunnelIcon className="w-4 h-4 text-gray-400" />}
              onSelectionChange={(k) =>
                setYearFilter(Array.from(k)[0] as string)
              }
            >
              {yearItems.map((item) => (
                <SelectItem key={item.key}>{item.label}</SelectItem>
              ))}
            </Select>
            <Select
              className="w-48"
              selectedKeys={[tipoFilter]}
              size="sm"
              onSelectionChange={(k) =>
                setTipoFilter(Array.from(k)[0] as string)
              }
            >
              {tipoItems.map((item) => (
                <SelectItem key={item.key}>{item.label}</SelectItem>
              ))}
            </Select>
            <Select
              className="w-40"
              selectedKeys={[estadoFilter]}
              size="sm"
              onSelectionChange={(k) =>
                setEstadoFilter(Array.from(k)[0] as any)
              }
            >
              {[
                { key: "all", label: "Todos los estados" },
                { key: "pendiente", label: "Pendiente" },
                { key: "retroalimentacion", label: "En Gestión" },
                { key: "firmada", label: "Firmada" },
              ].map((item) => (
                <SelectItem key={item.key}>{item.label}</SelectItem>
              ))}
            </Select>
          </div>

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
        </CardHeader>

        <CardBody className="p-6 bg-gray-50/50 dark:bg-transparent">
          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card
                  key={i}
                  className="h-64 border-none bg-gray-200 animate-pulse"
                >
                  <CardBody />
                </Card>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && asignacionesFiltradas.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <ClipboardDocumentListIcon className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">No se encontraron campañas</p>
            </div>
          )}

          {/* Grid */}
          {!loading &&
            asignacionesFiltradas.length > 0 &&
            (viewMode === "cards" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {asignacionesFiltradas.map((item) => (
                  <CampanaCard
                    key={item.id}
                    fechaFormateada={fechaFormateada}
                    item={item}
                    onClick={() => openTabla(item)}
                  />
                ))}
              </div>
            ) : (
              <TablaCampanas
                items={asignacionesFiltradas}
                onClick={openTabla}
              />
            ))}
        </CardBody>
      </Card>
    </div>
  );
}

// --- Componentes Auxiliares (Cards y Tablas) ---

const CampanaCard = ({ item, fechaFormateada, onClick }: any) => {
  const total = item.total_asignadas ?? 0;
  const firmadas = item.total_firmadas ?? 0;
  const progreso = total > 0 ? (firmadas / total) * 100 : 0;

  // Simplificamos métricas internas para que no compitan con el KPI principal
  const pendientes =
    (item.total_pendientes ?? 0) + (item.total_con_reunion ?? 0);
  const gestion =
    (item.total_con_retroalimentacion ?? 0) +
    (item.total_completadas ?? 0) +
    (item.total_cerradas_firma ?? 0);

  return (
    <Card
      isPressable
      className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-blue-300 transition-all bg-white dark:bg-gray-900 h-full"
      onPress={onClick}
    >
      <CardBody className="p-0">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-200 dark:shadow-none">
              <ClipboardDocumentListIcon className="w-6 h-6" />
            </div>
            <Chip
              color={progreso === 100 ? "success" : "primary"}
              size="sm"
              variant="flat"
            >
              {progreso === 100 ? "Completada" : "En Curso"}
            </Chip>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
            {item.tipo_evaluacion?.n_tipo_evaluacion ?? "Evaluación General"}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-gray-500 text-sm">
            <CalendarDaysIcon className="w-4 h-4" />
            <span className="capitalize">
              {fechaFormateada(item.fecha_evaluacion)}
            </span>
          </div>
        </div>

        {/* Mini Stats Internos */}
        <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-800 py-3">
          <div className="text-center">
            <p className="text-lg font-bold text-amber-600">{pendientes}</p>
            <p className="text-[10px] uppercase text-gray-400">Pend</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600">{gestion}</p>
            <p className="text-[10px] uppercase text-gray-400">Gestión</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-600">{firmadas}</p>
            <p className="text-[10px] uppercase text-gray-400">Fin</p>
          </div>
        </div>

        <div className="px-5 pb-5 pt-2">
          <Progress
            classNames={{ indicator: "rounded-full" }}
            color={progreso === 100 ? "success" : "primary"}
            size="sm"
            value={progreso}
          />
          <div className="flex justify-between text-xs mt-2 text-gray-400">
            <span>Progreso: {Math.round(progreso)}%</span>
            <span className="flex items-center gap-1 text-blue-600 font-medium group-hover:underline">
              Ver detalles <ArrowRightIcon className="w-3 h-3" />
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

const TablaCampanas = ({ items, onClick }: any) => (
  <Table
    aria-label="Tabla campañas"
    classNames={{ wrapper: "p-0" }}
    shadow="none"
  >
    <TableHeader>
      <TableColumn>NOMBRE</TableColumn>
      <TableColumn>PERIODO</TableColumn>
      <TableColumn>TOTAL</TableColumn>
      <TableColumn>PENDIENTES</TableColumn>
      <TableColumn>FINALIZADAS</TableColumn>
      <TableColumn align="end">ACCIÓN</TableColumn>
    </TableHeader>
    <TableBody>
      {items.map((item: any) => (
        <TableRow key={item.id}>
          <TableCell className="font-medium text-gray-900">
            {item.tipo_evaluacion?.n_tipo_evaluacion ?? "Evaluación"}
          </TableCell>
          <TableCell>{item.fecha_evaluacion}</TableCell>
          <TableCell>{item.total_asignadas}</TableCell>
          <TableCell>
            <span className="text-amber-600 font-medium">
              {(item.total_pendientes ?? 0) + (item.total_con_reunion ?? 0)}
            </span>
          </TableCell>
          <TableCell>
            <span className="text-emerald-600 font-medium">
              {item.total_firmadas}
            </span>
          </TableCell>
          <TableCell>
            <Button
              color="primary"
              size="sm"
              variant="solid"
              onPress={() => onClick(item)}
            >
              Gestionar
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
