import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardBody } from "@heroui/card";
import { Tabs, Tab } from "@heroui/tabs";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import {
  ChartBarIcon,
  UserIcon,
  CalendarIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ScaleIcon,
  ArrowLeftIcon,
  Squares2X2Icon,
  CalculatorIcon,
} from "@heroicons/react/24/outline";

import {
  getEvaluacionMixta,
  type EvaluacionMixta,
  type AreaMixto,
  type IndicadorMixto,
} from "@/features/evaluacion/services/evaluacionMixta";

export default function EvaluacionMixtaPage() {
  const navigate = useNavigate();
  const { detalleId } = useParams();
  const parsedId = Number(detalleId);
  const idValido = !!detalleId && Number.isFinite(parsedId);

  const [data, setData] = useState<EvaluacionMixta | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>("0");

  // --- Lógica de Negocio ---
  const areas: AreaMixto[] = data?.areas ?? [];

  const activeIndex = useMemo(() => {
    const idx = Number(tab);

    if (Number.isNaN(idx) || idx < 0) return 0;
    if (idx >= areas.length) return Math.max(areas.length - 1, 0);

    return idx;
  }, [tab, areas.length]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        if (!idValido) {
          setData(null);

          return;
        }
        const res = await getEvaluacionMixta(parsedId);

        if (mounted) setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [detalleId, idValido, parsedId]);

  // --- Helpers de Navegación ---
  const nextTab = () => setTab(String((activeIndex + 1) % areas.length));
  const prevTab = () =>
    setTab(String(activeIndex === 0 ? areas.length - 1 : activeIndex - 1));

  // --- Renderizado ---

  if (!idValido) return <ErrorState message="ID de evaluación inválido" />;
  if (loading) return <LoadingState />;
  if (!data)
    return (
      <EmptyState message="No se encontraron datos para esta evaluación" />
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b1220] pb-16">
      {/* 1. Header Contextual Sticky */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 pt-6 pb-6 px-6 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4 text-gray-500 text-sm">
            <button
              className="hover:text-blue-600 flex items-center gap-1 transition-colors"
              onClick={() => navigate(-1)}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Volver al listado
            </button>
            <span>/</span>
            <span className="font-medium text-gray-900 dark:text-white">
              Detalle Comparativo
            </span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                {data.persona_nombre ?? "Colaborador"}
                <span className="hidden md:inline text-gray-300 dark:text-gray-600 font-light">
                  |
                </span>
                <span className="text-lg font-normal text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  {data.fecha_evaluacion}
                </span>
              </h1>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <UserIcon className="w-4 h-4" />
                <span>
                  Supervisor:{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {data.evaluador_nombre ?? "No asignado"}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* 2. KPIs Globales */}
        <div className="mb-12">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-6 ml-1">
            <Squares2X2Icon className="w-4 h-4" />
            Resumen Global
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScoreCard
              color="blue"
              icon={<UserIcon className="w-5 h-5" />}
              max={data.resumen?.max_pts}
              pct={data.resumen?.auto_pct}
              score={data.resumen?.auto_pts}
              title="Autoevaluación Global"
            />
            <ScoreCard
              color="indigo"
              icon={<ChartBarIcon className="w-5 h-5" />}
              max={data.resumen?.max_pts}
              pct={data.resumen?.jefe_pct}
              score={data.resumen?.jefe_pts}
              title="Evaluación Supervisor Global"
            />
            <DeltaCard
              deltaPct={data.resumen?.delta_pct ?? undefined}
              deltaPts={data.resumen?.delta_pts ?? undefined}
            />
          </div>
        </div>

        {/* Separador Visual */}
        {areas.length > 0 && (
          <div className="relative py-4 mb-8">
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center"
            >
              <div className="w-full border-t border-gray-200 dark:border-gray-800" />
            </div>
          </div>
        )}

        {/* 3. Sección de Áreas */}
        {areas.length > 0 && (
          <div className="space-y-8">
            {/* Navegación de Áreas (Tabs) */}
            <div className="border-b border-gray-200 dark:border-gray-800 pb-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <ChartBarIcon className="w-4 h-4" />
                  Detalle por Área
                </h3>
                {/* Controles Mobile */}
                <div className="lg:hidden flex gap-2">
                  <Button
                    isIconOnly
                    isDisabled={areas.length <= 1}
                    size="sm"
                    variant="light"
                    onPress={prevTab}
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    isIconOnly
                    isDisabled={areas.length <= 1}
                    size="sm"
                    variant="light"
                    onPress={nextTab}
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Tabs Desktop */}
              <div className="hidden lg:block overflow-x-auto">
                <Tabs
                  classNames={{
                    tabList: "gap-8",
                    cursor: "w-full bg-primary",
                    tab: "px-0 h-12 text-base",
                    tabContent:
                      "group-data-[selected=true]:text-primary font-medium text-gray-500",
                  }}
                  color="primary"
                  selectedKey={String(activeIndex)}
                  variant="underlined"
                  onSelectionChange={(k) => setTab(String(k))}
                >
                  {areas.map((area, i) => (
                    <Tab
                      key={String(i)}
                      title={
                        <div className="flex items-center gap-2 pb-1">
                          <span
                            className={`flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold transition-colors ${String(activeIndex) === String(i) ? "bg-primary text-white" : "bg-gray-100 text-gray-500 dark:bg-gray-800"}`}
                          >
                            {i + 1}
                          </span>
                          {area.nombre}
                        </div>
                      }
                    />
                  ))}
                </Tabs>
              </div>

              {/* Título Área Mobile */}
              <div className="lg:hidden pb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {areas[activeIndex]?.nombre}
                </h2>
              </div>
            </div>

            {/* Contenido del Área Activa */}
            <div className="animate-in fade-in slide-in-from-left-1 duration-300">
              {/* KPIs Específicos del Área */}
              <div className="mb-8">
                <AreaKpiGrid area={areas[activeIndex]} />
              </div>

              {/* Lista de Competencias */}
              <div className="space-y-6">
                {areas[activeIndex].competencias.map((comp, idx) => (
                  <CompetenciaCard key={comp.id ?? idx} competencia={comp} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- COMPONENTES AUXILIARES ---

function ScoreCard({ title, score, max, pct, color, icon }: any) {
  // SOLUCIÓN: Mapeo explícito de clases para evitar el "Tree-Shaking" de Tailwind
  const styles: any = {
    blue: {
      bgIcon: "bg-blue-50 text-blue-600 dark:bg-blue-900/20",
      text: "text-blue-600",
      bar: "bg-blue-500",
    },
    indigo: {
      bgIcon: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20",
      text: "text-indigo-600",
      bar: "bg-indigo-500",
    },
    emerald: {
      bgIcon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20",
      text: "text-emerald-600",
      bar: "bg-emerald-500",
    },
    amber: {
      bgIcon: "bg-amber-50 text-amber-600 dark:bg-amber-900/20",
      text: "text-amber-600",
      bar: "bg-amber-500",
    },
  };

  const currentStyle = styles[color] || styles.blue;

  return (
    <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
      <CardBody className="p-6">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {title}
          </p>
          <div className={`p-2 rounded-lg ${currentStyle.bgIcon}`}>{icon}</div>
        </div>

        <div className="flex items-end justify-between mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">
              {typeof score === "number" ? score.toFixed(1) : "—"}
            </span>
            <span className="text-sm text-gray-400 font-medium">
              / {max} pts
            </span>
          </div>
          {typeof pct === "number" && (
            <div className={`flex flex-col items-end`}>
              <span className={`text-xl font-bold ${currentStyle.text}`}>
                {pct.toFixed(1)}%
              </span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                Logro
              </span>
            </div>
          )}
        </div>

        {typeof pct === "number" && (
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
            <div
              className={`${currentStyle.bar} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function DeltaCard({
  deltaPts,
  deltaPct,
}: {
  deltaPts?: number;
  deltaPct?: number;
}) {
  // Determinar estilos explícitos también aquí
  const isNeutral = deltaPts === 0;
  const colorName = isNeutral ? "emerald" : "amber";

  // Mapeo manual para asegurar que Tailwind los incluye
  const styles = {
    emerald: {
      bgIcon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20",
      text: "text-emerald-600",
      bar: "bg-emerald-500",
    },
    amber: {
      bgIcon: "bg-amber-50 text-amber-600 dark:bg-amber-900/20",
      text: "text-amber-600",
      bar: "bg-amber-500",
    },
  };

  const currentStyle = styles[colorName];
  const Icon =
    (deltaPts ?? 0) >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;

  return (
    <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
      <CardBody className="p-6">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Discordancia Global
          </p>
          <div className={`p-2 rounded-lg ${currentStyle.bgIcon}`}>
            <ScaleIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-end justify-between mb-4">
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-bold ${currentStyle.text}`}>
              {typeof deltaPts === "number"
                ? (deltaPts > 0 ? "+" : "") + deltaPts.toFixed(1)
                : "—"}
            </span>
            <span className="text-sm text-gray-400 font-medium">pts</span>
          </div>
          {typeof deltaPct === "number" && (
            <div className="flex flex-col items-end">
              <div
                className={`flex items-center gap-1 ${currentStyle.text} font-bold text-xl`}
              >
                <Icon className="w-5 h-5" />
                <span>{Math.abs(deltaPct).toFixed(1)}%</span>
              </div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                Diferencia
              </span>
            </div>
          )}
        </div>

        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
          <div
            className={`${currentStyle.bar} h-2 rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(Math.abs(deltaPct ?? 0), 100)}%` }}
          />
        </div>
      </CardBody>
    </Card>
  );
}

function AreaKpiGrid({ area }: { area: AreaMixto }) {
  const indicadores = area.competencias.flatMap((c: any) => c.indicadores);

  const autoSum = indicadores.reduce(
    (s: number, i: any) => s + (i.puntaje_auto ?? 0),
    0,
  );
  const jefeSum = indicadores.reduce(
    (s: number, i: any) => s + (i.puntaje_jefe ?? 0),
    0,
  );

  const deltaPts = indicadores.reduce(
    (s: number, i: any) =>
      s +
      (i.puntaje_jefe != null && i.puntaje_auto != null
        ? i.puntaje_jefe - i.puntaje_auto
        : 0),
    0,
  );

  // Clases explícitas para los bordes y fondos de colores en los KPIs de área
  const kpiStyles = {
    auto: {
      border: "border-blue-100 dark:border-blue-900/30",
      bg: "bg-blue-50/40 dark:bg-blue-900/10",
      title: "text-blue-600 dark:text-blue-400",
      value: "text-blue-700 dark:text-blue-300",
      subtext: "text-blue-500",
      iconBg: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
    },
    jefe: {
      border: "border-indigo-100 dark:border-indigo-900/30",
      bg: "bg-indigo-50/40 dark:bg-indigo-900/10",
      title: "text-indigo-600 dark:text-indigo-400",
      value: "text-indigo-700 dark:text-indigo-300",
      subtext: "text-indigo-500",
      iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
    },
  };

  const deltaIsNeutral = Math.abs(deltaPts) < 1;
  const deltaStyle = deltaIsNeutral
    ? {
        border: "border-emerald-100 dark:border-emerald-900/30",
        bg: "bg-emerald-50/40 dark:bg-emerald-900/10",
        title: "text-emerald-600",
        value: "text-emerald-700 dark:text-emerald-400",
        iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30",
      }
    : {
        border: "border-amber-100 dark:border-amber-900/30",
        bg: "bg-amber-50/40 dark:bg-amber-900/10",
        title: "text-amber-600",
        value: "text-amber-700 dark:text-amber-400",
        iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-900/30",
      };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* KPI Auto */}
      <Card
        className={`border shadow-sm ${kpiStyles.auto.border} ${kpiStyles.auto.bg}`}
      >
        <CardBody className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-col">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${kpiStyles.auto.title}`}
              >
                Auto Área
              </span>
              <span
                className={`text-[10px] font-medium ${kpiStyles.auto.title} opacity-70`}
              >
                Puntaje Total
              </span>
            </div>
            <div className={`p-1.5 rounded ${kpiStyles.auto.iconBg}`}>
              <CalculatorIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className={`text-2xl font-bold ${kpiStyles.auto.value}`}>
              {autoSum.toFixed(1)}
            </p>
            <p className={`text-xs font-medium ${kpiStyles.auto.subtext}`}>
              {" "}
              pts
            </p>
          </div>
        </CardBody>
      </Card>

      {/* KPI Jefe */}
      <Card
        className={`border shadow-sm ${kpiStyles.jefe.border} ${kpiStyles.jefe.bg}`}
      >
        <CardBody className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-col">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${kpiStyles.jefe.title}`}
              >
                Supervisor Área
              </span>
              <span
                className={`text-[10px] font-medium ${kpiStyles.jefe.title} opacity-70`}
              >
                Puntaje Total
              </span>
            </div>
            <div className={`p-1.5 rounded ${kpiStyles.jefe.iconBg}`}>
              <CalculatorIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className={`text-2xl font-bold ${kpiStyles.jefe.value}`}>
              {jefeSum.toFixed(1)}
            </p>
            <p className={`text-xs font-medium ${kpiStyles.jefe.subtext}`}>
              {" "}
              pts
            </p>
          </div>
        </CardBody>
      </Card>

      {/* KPI Brecha */}
      <Card
        className={`border shadow-sm ${deltaStyle.border} ${deltaStyle.bg}`}
      >
        <CardBody className="p-4">
          <div className="flex justify-between items-start mb-2">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${deltaStyle.title}`}
            >
              Brecha Total Área
            </span>
            <div className={`p-1.5 rounded ${deltaStyle.iconBg}`}>
              <ScaleIcon className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${deltaStyle.value}`}>
            {deltaPts > 0 ? "+" : ""}
            {deltaPts.toFixed(1)}
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

function CompetenciaCard({ competencia }: { competencia: any }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 overflow-hidden">
      <button
        aria-expanded={isExpanded}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800 text-left"
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setIsExpanded(!isExpanded);
        }}
      >
        <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm uppercase tracking-wide">
          {competencia.nombre}
        </h3>
        <ChevronDownIcon
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      {isExpanded && (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {/* Header de Tabla */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50/50 dark:bg-gray-800/30 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-6">Indicador</div>
            <div className="col-span-2 text-center">Auto</div>
            <div className="col-span-2 text-center">Jefe</div>
            <div className="col-span-2 text-center">Dif</div>
          </div>

          {/* Filas */}
          {competencia.indicadores.map((ind: IndicadorMixto, i: number) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
            >
              <div className="col-span-6 text-sm text-gray-700 dark:text-gray-300 font-medium flex items-start gap-2">
                {ind.popover && (
                  <Popover>
                    <PopoverTrigger>
                      <InformationCircleIcon className="w-4 h-4 text-gray-400 cursor-help mt-0.5 flex-shrink-0" />
                    </PopoverTrigger>
                    <PopoverContent className="p-3 max-w-xs text-xs">
                      {ind.popover}
                    </PopoverContent>
                  </Popover>
                )}
                <span>{ind.nombre}</span>
              </div>
              <div className="col-span-2 flex justify-center">
                <BadgeScore
                  color="blue"
                  score={ind.puntaje_auto ?? undefined}
                />
              </div>
              <div className="col-span-2 flex justify-center">
                <BadgeScore
                  color="indigo"
                  score={ind.puntaje_jefe ?? undefined}
                />
              </div>
              <div className="col-span-2 flex justify-center">
                <BadgeDelta delta={ind.delta} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// Pequeños componentes de UI para la tabla
const BadgeScore = ({ score, color }: { score?: number; color: string }) => {
  // Mapas de color seguros para los badges también
  const colors: any = {
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    indigo:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  };
  const style = colors[color] || "bg-gray-100 text-gray-400";

  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${score != null ? style : "bg-gray-100 text-gray-400"}`}
    >
      {score ?? "-"}
    </div>
  );
};

const BadgeDelta = ({ delta }: { delta?: number | null }) => {
  if (delta == null) return <span className="text-gray-300">—</span>;
  const color = delta === 0 ? "emerald" : "amber";
  const styles: any = {
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-900/30",
  };

  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-md ${styles[color]}`}>
      {delta > 0 ? "+" : ""}
      {delta}
    </span>
  );
};

// Estados de carga
const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b1220]">
    <Spinner color="primary" size="lg" />
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b1220] p-4">
    <Card className="max-w-md border-danger-200 bg-danger-50">
      <CardBody className="text-center p-6 text-danger-700">
        <p className="font-bold">Error</p>
        <p className="text-sm">{message}</p>
      </CardBody>
    </Card>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b1220] p-4">
    <div className="text-center text-gray-400">
      <InformationCircleIcon className="w-12 h-12 mx-auto mb-2" />
      <p>{message}</p>
    </div>
  </div>
);
