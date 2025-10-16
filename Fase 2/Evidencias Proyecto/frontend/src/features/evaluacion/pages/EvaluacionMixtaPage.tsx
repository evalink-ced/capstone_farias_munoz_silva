// features/evaluacion/pages/EvaluacionMixtaPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Tabs, Tab } from "@heroui/tabs";
import { Chip } from "@heroui/chip";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Progress } from "@heroui/progress";
import {
    getEvaluacionMixta,
    type EvaluacionMixta,
    type AreaMixto,
    type IndicadorMixto,
} from "@/features/evaluacion/services/evaluacionMixta";
import {
    ChartBarIcon,
    UserIcon,
    CalendarIcon,
    MinusIcon,
    InformationCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from "@heroicons/react/24/outline";
import { TrendingDownIcon } from "lucide-react";
import { TrendingUpIcon } from "lucide-react";



export default function EvaluacionMixtaPage() {
    const { detalleId } = useParams();
    const parsedId = Number(detalleId);
    const idValido = !!detalleId && Number.isFinite(parsedId);

    const [data, setData] = useState<EvaluacionMixta | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<string>("0");

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
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [detalleId, idValido, parsedId]);

    // Estados de carga y error mejorados
    if (!idValido) {
        return <ErrorState message="ID de evaluación inválido" />;
    }

    if (loading) {
        return <LoadingState />;
    }

    if (!data) {
        return <EmptyState message="No se encontraron datos para esta evaluación" />;
    }

    const nextTab = () => {
        const next = (activeIndex + 1) % areas.length;
        setTab(String(next));
    };

    const prevTab = () => {
        const prev = activeIndex === 0 ? areas.length - 1 : activeIndex - 1;
        setTab(String(prev));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-default-50/30 dark:to-default-900/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                {/* Header mejorado */}
                <div className="mb-8">
                    <HeaderSection data={data} />
                </div>

                {/* Navegación de áreas mejorada */}
                <Card className="mb-6 shadow-lg border-0 bg-background/60 backdrop-blur-md">
                    <CardBody className="p-0">
                        <div className="flex items-center justify-between p-4 lg:p-6">
                            <div className="flex items-center gap-3">
                                <Button
                                    isIconOnly
                                    variant="light"
                                    size="sm"
                                    onPress={prevTab}
                                    isDisabled={areas.length <= 1}
                                    className="hidden sm:flex"
                                >
                                    <ChevronLeftIcon className="w-4 h-4" />
                                </Button>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <span className="text-sm font-medium text-default-600">
                                        Área {activeIndex + 1} de {areas.length}
                                    </span>
                                    {areas.length > 0 && (
                                        <h2 className="text-lg lg:text-xl font-semibold text-foreground">
                                            {areas[activeIndex]?.nombre}
                                        </h2>
                                    )}
                                </div>

                                <Button
                                    isIconOnly
                                    variant="light"
                                    size="sm"
                                    onPress={nextTab}
                                    isDisabled={areas.length <= 1}
                                    className="hidden sm:flex"
                                >
                                    <ChevronRightIcon className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Progress indicator */}
                            <div className="hidden lg:flex items-center gap-3 min-w-[200px]">
                                <Progress
                                    value={((activeIndex + 1) / areas.length) * 100}
                                    size="sm"
                                    className="flex-1"
                                    color="primary"
                                />
                                <span className="text-xs text-default-500 whitespace-nowrap">
                                    {activeIndex + 1}/{areas.length}
                                </span>
                            </div>
                        </div>

                        {/* Tabs para desktop, selector para mobile */}
                        <div className="border-t border-divider">
                            <div className="block lg:hidden p-4">
                                <select
                                    value={activeIndex}
                                    onChange={(e) => setTab(e.target.value)}
                                    className="w-full p-3 rounded-lg border border-divider bg-background text-foreground"
                                >
                                    {areas.map((area, i) => (
                                        <option key={i} value={i}>
                                            {area.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="hidden lg:block overflow-x-auto">
                                <Tabs
                                    selectedKey={String(activeIndex)}
                                    onSelectionChange={(k) => setTab(String(k))}
                                    variant="underlined"
                                    className="px-6"
                                    classNames={{
                                        tabList: "gap-6",
                                        tab: "px-4 py-3",
                                        cursor: "bg-primary",
                                        tabContent: "text-default-600 group-data-[selected=true]:text-primary font-medium"
                                    }}
                                >
                                    {areas.map((area, i) => (
                                        <Tab key={String(i)} title={area.nombre} />
                                    ))}
                                </Tabs>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Contenido del área */}
                {areas.length > 0 && (
                    <AreaView area={areas[activeIndex]} />
                )}
            </div>
        </div>
    );
}

function HeaderSection({ data }: { data: EvaluacionMixta }) {
    const pct = (v?: number | null) =>
        typeof v === "number" ? `${v.toFixed(1)}%` : "—";

    const deltaValue = data.resumen?.delta_pts;
    const getDeltaIcon = () => {
        if (typeof deltaValue !== "number") return MinusIcon;
        return deltaValue >= 0 ? TrendingUpIcon : TrendingDownIcon;
    };
    const DeltaIcon = getDeltaIcon();
    return (
        <Card className="shadow-lg border-0 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-950/30 dark:to-secondary-950/30 backdrop-blur-md">
            <CardBody className="p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                                <ChartBarIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                                    Evaluación Comparativa
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <CalendarIcon className="w-4 h-4 text-default-500" />
                                    <span className="text-default-600 font-medium">
                                        {data.fecha_evaluacion &&
                                            new Date(data.fecha_evaluacion + "-04").toLocaleDateString("es-CL", {
                                                month: "numeric",
                                                year: "numeric",
                                            })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 backdrop-blur-sm">
                                <UserIcon className="w-5 h-5 text-default-500 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-sm text-default-500">Evaluado</p>
                                    <p className="font-semibold text-foreground truncate">
                                        {data.persona_nombre ?? data.persona_id}
                                    </p>
                                </div>
                            </div>

                            {data.evaluador_nombre && (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 backdrop-blur-sm">
                                    <UserIcon className="w-5 h-5 text-default-500 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm text-default-500">Supervisor</p>
                                        <p className="font-semibold text-foreground truncate">
                                            {data.evaluador_nombre}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2 text-sm">
                            <span className="px-3 py-1 rounded-full bg-default-100 dark:bg-default-800 text-default-700 dark:text-default-300">
                                <span className="font-medium">Evaluación Desempeño:</span> {data.evaluacion_jefe_nombre ?? "No asignada"}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-default-100 dark:bg-default-800 text-default-700 dark:text-default-300">
                                <span className="font-medium">Autoevaluación:</span> {data.evaluacion_auto_nombre ?? "No asignada"}
                            </span>
                        </div>
                    </div>

                    {/* Métricas mejoradas */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:min-w-[280px]">
                        <MetricCard
                            label="Autoevaluación"
                            value={
                                <>
                                    <span className="font-bold">{data.resumen?.auto_pts ?? "—"}</span>
                                    <span className="text-default-500">&nbsp;/&nbsp;{data.resumen?.max_pts ?? "—"} pts</span>
                                    <span className="ml-2 text-default-700">· {pct(data.resumen?.auto_pct)}</span>
                                </>
                            }
                            color="primary"
                            variant="flat"
                        />

                        <MetricCard
                            label="Evaluación Desempeño"
                            value={
                                <>
                                    <span className="font-bold">{data.resumen?.jefe_pts ?? "—"}</span>
                                    <span className="text-default-500">&nbsp;/&nbsp;{data.resumen?.max_pts ?? "—"} pts</span>
                                    <span className="ml-2 text-default-700">· {pct(data.resumen?.jefe_pct)}</span>
                                </>
                            }
                            color="secondary"
                            variant="flat"
                        />

                        <MetricCard
                            label="Discordancia Total"
                            value={
                                <>
                                    <span className="font-bold">
                                        {typeof data.resumen?.delta_pts === "number"
                                            ? (data.resumen!.delta_pts > 0 ? "+" : "") + data.resumen!.delta_pts
                                            : "—"}
                                    </span>
                                    <span className="ml-2 text-default-700">
                                        · {typeof data.resumen?.delta_pct === "number"
                                            ? (data.resumen!.delta_pct > 0 ? "+" : "") + data.resumen!.delta_pct.toFixed(1) + "%"
                                            : "—"}
                                    </span>
                                </>
                            }
                            color={
                                typeof data.resumen?.delta_pct === "number"
                                    ? data.resumen!.delta_pct >= 0 ? "success" : "danger"
                                    : "default"
                            }
                            variant="solid"
                            icon={<DeltaIcon className="w-4 h-4" />}
                        />
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}

function MetricCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: React.ReactNode;  // ⬅ antes era 'any'
    color?: "primary" | "secondary" | "success" | "danger" | "default";
    variant?: "flat" | "solid";
    icon?: React.ReactNode;
    prefix?: string;
}) {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-background/60 backdrop-blur-sm border border-divider">
            <div>
                <p className="text-sm font-medium text-default-600">{label}</p>
                <div className="flex items-center gap-2 mt-1">
                    {icon}
                    <span className="text-lg text-foreground">{value}</span>
                </div>
            </div>
        </div>
    );
}

function AreaView({ area }: { area: AreaMixto }) {
    if (area.competencias.length === 0) {
        return (
            <EmptyState
                message="Esta área no tiene competencias configuradas"
                showIcon={false}
            />
        );
    }

    return (
        <div className="space-y-6">
            {area.competencias.map((competencia, index) => (
                <CompetenciaCard
                    key={competencia.id ?? `comp-${competencia.nombre}`}
                    competencia={competencia}
                    index={index}
                />
            ))}
        </div>
    );
}

function CompetenciaCard({
    competencia,
    index
}: {
    competencia: any;
    index: number;
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Card className="shadow-md border-0 bg-background/80 backdrop-blur-md overflow-hidden">
            <CardHeader
                className="pb-4 cursor-pointer hover:bg-default-50 dark:hover:bg-default-900/20 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-semibold text-sm">
                            {index + 1}
                        </div>
                        <div>
                            <h3 className="text-lg lg:text-xl font-semibold text-foreground">
                                {competencia.nombre}
                            </h3>
                            <p className="text-sm text-default-500">
                                {competencia.indicadores.length} indicador{competencia.indicadores.length !== 1 ? 'es' : ''}
                            </p>
                        </div>
                    </div>

                    <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        className="transition-transform duration-200"
                        style={{
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}
                    >
                        <ChevronDownIcon className="w-5 h-5" />
                    </Button>
                </div>
            </CardHeader>

            {isExpanded && (
                <CardBody className="pt-0">
                    {competencia.indicadores.length === 0 ? (
                        <div className="py-8 text-center text-default-400">
                            <InformationCircleIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No hay indicadores configurados para esta competencia</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {/* Header para desktop */}
                            <div className="hidden lg:grid grid-cols-12 gap-4 pb-3 px-4 text-sm font-medium text-default-500 border-b border-divider">
                                <div className="col-span-6">Indicador</div>
                                <div className="col-span-2 text-center">Autoevaluación</div>
                                <div className="col-span-2 text-center">Supervisor</div>
                                <div className="col-span-2 text-center">Ptos de Discordancia</div>
                            </div>

                            {competencia.indicadores.map((indicador: IndicadorMixto) => (
                                <IndicadorRow
                                    key={indicador.id ?? indicador.nombre}
                                    indicador={indicador}
                                />
                            ))}
                        </div>
                    )}
                </CardBody>
            )}
        </Card>
    );
}

function IndicadorRow({ indicador }: { indicador: IndicadorMixto }) {
    const getDeltaColor = (delta: number | null) => {
        if (delta == null) return "default";
        if (delta > 0) return "success";
        if (delta < 0) return "danger";
        return "warning";
    };

    const getDeltaText = (delta: number | null) => {
        if (delta == null) return "—";
        if (delta > 0) return `+${delta}`;
        return String(delta);
    };

    return (
        <>
            {/* Vista móvil */}
            <div className="lg:hidden p-4 rounded-lg border border-divider bg-background/50 space-y-3">
                <div className="flex items-start gap-3">
                    <Popover placement="top" showArrow>
                        <PopoverTrigger>
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                className="flex-shrink-0 mt-0.5"
                            >
                                <InformationCircleIcon className="w-4 h-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="max-w-[320px] p-4">
                            <div className="text-sm text-foreground whitespace-pre-wrap">
                                {indicador.nombre}
                            </div>
                        </PopoverContent>
                    </Popover>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground text-sm leading-snug">
                            {indicador.nombre}
                        </h4>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                        <p className="text-xs text-default-500 mb-1">Auto</p>
                        <Chip size="sm" variant="flat" color="primary">
                            {indicador.puntaje_auto ?? "—"}
                        </Chip>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-default-500 mb-1">Supervisor</p>
                        <Chip size="sm" variant="flat" color="secondary">
                            {indicador.puntaje_jefe ?? "—"}
                        </Chip>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-default-500 mb-1">Ptos Diferencia</p>
                        <Chip
                            size="sm"
                            variant="flat"
                            color={getDeltaColor(indicador.delta)}
                        >
                            {getDeltaText(indicador.delta)}
                        </Chip>
                    </div>
                </div>
            </div>

            {/* Vista desktop */}
            <div className="hidden lg:grid grid-cols-12 gap-4 items-center p-4 rounded-lg hover:bg-default-50 dark:hover:bg-default-900/20 transition-colors">
                <div className="col-span-6 flex items-center gap-3">
                    <Popover placement="right" showArrow>
                        <PopoverTrigger>
                            <span className="font-medium cursor-help text-foreground hover:text-primary transition-colors line-clamp-2">
                                {indicador.nombre}
                            </span>
                        </PopoverTrigger>
                        <PopoverContent className="max-w-[480px] p-4">
                            <div className="text-sm text-foreground whitespace-pre-wrap">
                                {indicador.nombre}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="col-span-2 text-center">
                    <Chip variant="flat" color="primary" size="sm">
                        {indicador.puntaje_auto ?? "—"}
                    </Chip>
                </div>

                <div className="col-span-2 text-center">
                    <Chip variant="flat" color="secondary" size="sm">
                        {indicador.puntaje_jefe ?? "—"}
                    </Chip>
                </div>

                <div className="col-span-2 text-center">
                    <Chip
                        variant="flat"
                        color={getDeltaColor(indicador.delta)}
                        size="sm"
                    >
                        {getDeltaText(indicador.delta)}
                    </Chip>
                </div>
            </div>
        </>
    );
}

// Estados mejorados
function LoadingState() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-default-50/30 dark:to-default-900/20 flex items-center justify-center">
            <Card className="w-full max-w-md shadow-lg border-0 bg-background/80 backdrop-blur-md">
                <CardBody className="p-8 text-center space-y-4">
                    <Spinner size="lg" color="primary" />
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">
                            Cargando evaluación
                        </h3>
                        <p className="text-default-500 mt-1">
                            Obteniendo datos comparativos...
                        </p>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}

function ErrorState({ message }: { message: string }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-default-50/30 dark:to-default-900/20 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg border-0 bg-danger-50/50 dark:bg-danger-950/30 backdrop-blur-md">
                <CardBody className="p-8 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center">
                        <InformationCircleIcon className="w-8 h-8 text-danger-600 dark:text-danger-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">
                            Error
                        </h3>
                        <p className="text-danger-600 dark:text-danger-400 mt-1">
                            {message}
                        </p>
                    </div>
                    <Button
                        color="danger"
                        variant="flat"
                        onPress={() => window.location.reload()}
                    >
                        Intentar nuevamente
                    </Button>
                </CardBody>
            </Card>
        </div>
    );
}

function EmptyState({
    message,
    showIcon = true
}: {
    message: string;
    showIcon?: boolean;
}) {
    return (
        <Card className="shadow-md border-0 bg-background/60 backdrop-blur-md">
            <CardBody className="p-8 lg:p-12 text-center space-y-4">
                {showIcon && (
                    <div className="w-16 h-16 mx-auto rounded-full bg-default-100 dark:bg-default-800 flex items-center justify-center">
                        <ChartBarIcon className="w-8 h-8 text-default-400" />
                    </div>
                )}
                <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                        No hay información disponible
                    </h3>
                    <p className="text-default-500">{message}</p>
                </div>
            </CardBody>
        </Card>
    );
}

// Iconos faltantes - reemplaza con los de tu biblioteca de iconos
function ChevronDownIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    );
}