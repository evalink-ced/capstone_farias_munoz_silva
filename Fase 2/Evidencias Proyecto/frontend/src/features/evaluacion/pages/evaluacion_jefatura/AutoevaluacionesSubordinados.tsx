import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { Progress } from "@heroui/progress";
import { addToast } from "@heroui/toast";
import {
    CalendarDaysIcon,
    ArrowRightIcon,
    ClipboardDocumentListIcon,
    UserIcon,
    EyeIcon,
    ArrowLeftIcon,
    HomeIcon,
    CheckCircleIcon,
    ClockIcon,
    ChartBarIcon,
    UsersIcon,
    DocumentTextIcon,
    StarIcon,
} from "@heroicons/react/24/outline";

import axios from "@/services/google/axiosInstance";
import { Autoevaluacion } from "@/features/evaluacion/types/evaluacion";
import { EvaluationUtils } from "@/features/evaluacion/constants/defaults";

// Extender la interfaz Autoevaluacion para incluir campos específicos de subordinados
interface AutoevaluacionSubordinado extends Omit<Autoevaluacion, 'tipo_evaluacion'> {
    persona: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
    };
    tipo_evaluacion: {
        id: number;
        n_tipo_evaluacion: string;
    };
    completado: boolean;
    logro_obtenido: number;
    fecha_inicio: string;
    fecha_ultima_modificacion: string;
}

interface GrupoAutoevaluaciones {
    tipo_evaluacion: {
        id: number;
        n_tipo_evaluacion: string;
    };
    fecha_evaluacion: string;
    total_autoevaluaciones: number;
    completadas: number;
    pendientes: number;
    autoevaluaciones: AutoevaluacionSubordinado[];
}

// Nueva interfaz para organizar por años
interface PeriodoPorAno {
    año: number;
    periodos: GrupoAutoevaluaciones[];
    totalAutoevaluaciones: number;
    completadas: number;
    pendientes: number;
}

export default function AutoevaluacionesSubordinadosPage() {
    const [grupos, setGrupos] = useState<GrupoAutoevaluaciones[]>([]);
    const [autoevaluaciones, setAutoevaluaciones] = useState<AutoevaluacionSubordinado[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Parámetros de URL para filtros específicos
    const tipoEvaluacion = searchParams.get('tipo_evaluacion');
    const fechaEvaluacion = searchParams.get('fecha_evaluacion');
    const isDetailView = Boolean(tipoEvaluacion && fechaEvaluacion);

    const nombreCompleto = useCallback(
        (persona: { first_name: string; last_name: string }) =>
            `${persona.first_name} ${persona.last_name}`.trim(),
        [],
    );

    // Organizar grupos por año con estadísticas
    const periodosPorAno = useMemo(() => {
        const anosMap = new Map<number, GrupoAutoevaluaciones[]>();

        grupos.forEach(grupo => {
            const año = new Date(`${grupo.fecha_evaluacion}-01`).getFullYear();
            if (!anosMap.has(año)) {
                anosMap.set(año, []);
            }
            anosMap.get(año)!.push(grupo);
        });

        const periodos: PeriodoPorAno[] = Array.from(anosMap.entries())
            .map(([año, periodos]) => {
                const totalAutoevaluaciones = periodos.reduce((sum, p) => sum + p.total_autoevaluaciones, 0);
                const completadas = periodos.reduce((sum, p) => sum + p.completadas, 0);
                const pendientes = periodos.reduce((sum, p) => sum + p.pendientes, 0);

                return {
                    año,
                    periodos: periodos.sort((a, b) =>
                        new Date(`${b.fecha_evaluacion}-01`).getTime() -
                        new Date(`${a.fecha_evaluacion}-01`).getTime()
                    ),
                    totalAutoevaluaciones,
                    completadas,
                    pendientes
                };
            })
            .sort((a, b) => b.año - a.año);

        return periodos;
    }, [grupos]);

    // Estadísticas globales
    const estadisticasGlobales = useMemo(() => {
        if (isDetailView) {
            const completadas = autoevaluaciones.filter(a => a.completado).length;
            const pendientes = autoevaluaciones.length - completadas;
            const progresoPromedio = autoevaluaciones.length > 0
                ? autoevaluaciones.reduce((sum, a) => sum + (a.logro_obtenido || 0), 0) / autoevaluaciones.length
                : 0;

            return {
                total: autoevaluaciones.length,
                completadas,
                pendientes,
                progresoPromedio
            };
        } else {
            const totales = periodosPorAno.reduce(
                (acc, periodo) => {
                    acc.total += periodo.totalAutoevaluaciones;
                    acc.completadas += periodo.completadas;
                    acc.pendientes += periodo.pendientes;
                    return acc;
                },
                { total: 0, completadas: 0, pendientes: 0 }
            );

            return {
                ...totales,
                años: periodosPorAno.length,
                periodos: periodosPorAno.reduce((sum, p) => sum + p.periodos.length, 0)
            };
        }
    }, [periodosPorAno, autoevaluaciones, isDetailView]);

    // Create properly typed stats objects for each component
    const statsForDetailView = useMemo(() => {
        if (!isDetailView) return { total: 0, completadas: 0, pendientes: 0, progresoPromedio: 0 };
        
        return {
            total: estadisticasGlobales.total,
            completadas: estadisticasGlobales.completadas,
            pendientes: estadisticasGlobales.pendientes,
            progresoPromedio: (estadisticasGlobales as any).progresoPromedio
        };
    }, [estadisticasGlobales, isDetailView]);

    const statsForOverview = useMemo(() => {
        if (isDetailView) return { total: 0, completadas: 0, pendientes: 0, años: 0, periodos: 0 };
        
        return {
            total: estadisticasGlobales.total,
            completadas: estadisticasGlobales.completadas,
            pendientes: estadisticasGlobales.pendientes,
            años: (estadisticasGlobales as any).años,
            periodos: (estadisticasGlobales as any).periodos
        };
    }, [estadisticasGlobales, isDetailView]);

    // Obtener información del período actual para la vista de detalle
    const periodoActual = useMemo(() => {
        if (!isDetailView || !fechaEvaluacion) return null;

        const grupo = grupos.find(g => g.fecha_evaluacion === fechaEvaluacion);
        if (!grupo) return null;

        const fecha = new Date(`${fechaEvaluacion}-01`);
        return {
            año: fecha.getFullYear(),
            mes: fecha.toLocaleDateString("es-CL", { month: "long" }),
            tipoEvaluacion: grupo.tipo_evaluacion.n_tipo_evaluacion,
            grupo
        };
    }, [isDetailView, fechaEvaluacion, grupos]);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (tipoEvaluacion) params.append('tipo_evaluacion', tipoEvaluacion);
                if (fechaEvaluacion) params.append('fecha_evaluacion', fechaEvaluacion);

                const response = await axios.get(`/evaluacion/api/autoevaluaciones-subordinados/?${params.toString()}`);

                if (isDetailView) {
                    setAutoevaluaciones(response.data);
                } else {
                    setGrupos(response.data);
                }
            } catch (err) {
                console.error(err);
                addToast({
                    title: "Error al cargar",
                    description: "No se pudieron obtener las autoevaluaciones de tus subordinados.",
                    color: "danger",
                    variant: "solid",
                });
            } finally {
                setLoading(false);
            }
        })();
    }, [tipoEvaluacion, fechaEvaluacion, isDetailView]);

    const openGrupo = (grupo: GrupoAutoevaluaciones) => {
        navigate(`/evaluacion-jefatura/autoevaluaciones-subordinados?tipo_evaluacion=${grupo.tipo_evaluacion.id}&fecha_evaluacion=${grupo.fecha_evaluacion}`);
    };

    const verAutoevaluacion = (autoevaluacion: AutoevaluacionSubordinado) => {
        navigate('/evaluacion-jefatura/autoevaluacion-detalle', {
            state: {
                id: autoevaluacion.id,
                autoevaluacion,
                backUrl: `/evaluacion-jefatura/autoevaluaciones-subordinados?tipo_evaluacion=${tipoEvaluacion}&fecha_evaluacion=${fechaEvaluacion}`
            }
        });
    };

    const volverAResumen = () => {
        navigate('/evaluacion-jefatura/autoevaluaciones-subordinados');
    };

    const volverAInicio = () => {
        navigate('/evaluacion-jefatura');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/20">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <HeaderSkeleton />
                    <SkeletonGrid />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/20">
            {/* Elementos decorativos de fondo */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-emerald-400/5 to-cyan-600/5 rounded-full blur-3xl animate-pulse delay-500" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
                <Header
                    isDetailView={isDetailView}
                    periodoActual={periodoActual}
                    onVolverAResumen={volverAResumen}
                    onVolverAInicio={volverAInicio}
                />

                {isDetailView ? (
                    // Vista de detalle: lista de usuarios con estadísticas
                    <div className="space-y-8">
                        {/* Estadísticas del período */}
                        <StatsDetailView stats={statsForDetailView} />

                        <Divider className="my-8" />
                        {autoevaluaciones.length === 0 ? (
                            <EmptyStateDetail />
                        ) : (
                            <>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                                            Equipo de trabajo
                                        </h2>
                                        <p className="text-slate-600 dark:text-slate-400">
                                            Revisa el progreso de cada miembro de tu equipo
                                        </p>
                                    </div>
                                    <Chip color="primary" variant="flat" size="lg" className="font-semibold">
                                        {autoevaluaciones.length} persona{autoevaluaciones.length !== 1 ? 's' : ''}
                                    </Chip>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {autoevaluaciones.map((autoevaluacion) => (
                                        <EnhancedUserCard
                                            key={autoevaluacion.id}
                                            autoevaluacion={autoevaluacion}
                                            nombreCompleto={nombreCompleto}
                                            onVer={() => verAutoevaluacion(autoevaluacion)}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    // Vista de resumen: organizada por años con estadísticas
                    <div className="space-y-8">
                        {/* Estadísticas globales */}
                        <StatsOverview stats={statsForOverview} />

                        <Divider className="my-8" />

                        {periodosPorAno.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <div className="space-y-10">
                                {periodosPorAno.map((periodoPorAno) => (
                                    <YearSection
                                        key={periodoPorAno.año}
                                        periodoPorAno={periodoPorAno}
                                        onOpenGrupo={openGrupo}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ────────────────── Componentes ────────────────── */

function Header({
    isDetailView,
    periodoActual,
    onVolverAResumen,
    onVolverAInicio
}: {
    isDetailView: boolean;
    periodoActual: { año: number; mes: string; tipoEvaluacion: string; grupo: GrupoAutoevaluaciones } | null;
    onVolverAResumen: () => void;
    onVolverAInicio: () => void;
}) {
    return (
        <div className="mb-8">
            {/* Navegación */}
            {isDetailView && (
                <div className="flex items-center gap-2 mb-6">
                    <Button
                        variant="light"
                        size="sm"
                        onPress={onVolverAInicio}
                        startContent={<HomeIcon className="w-4 h-4" />}
                        className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                        Inicio
                    </Button>
                    <span className="text-slate-400">/</span>
                    <Button
                        variant="light"
                        size="sm"
                        onPress={onVolverAResumen}
                        startContent={<ArrowLeftIcon className="w-4 h-4" />}
                        className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                        Autoevaluaciones
                    </Button>
                </div>
            )}

            {/* Título principal */}
            <div className="flex items-start gap-6">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl">
                    <ClipboardDocumentListIcon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                        {isDetailView && periodoActual
                            ? `${periodoActual.tipoEvaluacion}`
                            : "Autoevaluaciones del Equipo"
                        }
                    </h1>
                    {isDetailView && periodoActual ? (
                        <div className="space-y-1">
                            <p className="text-lg text-slate-600 dark:text-slate-400 capitalize">
                                {periodoActual.mes} {periodoActual.año}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-500">
                                Revisa las autoevaluaciones de tu equipo para este período
                            </p>
                        </div>
                    ) : (
                        <p className="text-slate-600 dark:text-slate-400">
                            Gestiona y revisa las autoevaluaciones organizadas por períodos
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatsOverview({ stats }: {
    stats: {
        total: number;
        completadas: number;
        pendientes: number;
        años: number;
        periodos: number;
    };
}) {
    const statsCards = [
        {
            title: "Total Evaluaciones",
            value: stats.total,
            icon: <ClipboardDocumentListIcon className="w-6 h-6" />,
            color: "bg-blue-500",
            bgGradient: "from-blue-50 to-blue-100",
            textColor: "text-blue-600",
            description: "Autoevaluaciones registradas"
        },
        {
            title: "Completadas",
            value: stats.completadas,
            icon: <CheckCircleIcon className="w-6 h-6" />,
            color: "bg-emerald-500",
            bgGradient: "from-emerald-50 to-emerald-100",
            textColor: "text-emerald-600",
            description: "Evaluaciones finalizadas"
        },
        {
            title: "Pendientes",
            value: stats.pendientes,
            icon: <ClockIcon className="w-6 h-6" />,
            color: "bg-amber-500",
            bgGradient: "from-amber-50 to-amber-100",
            textColor: "text-amber-600",
            description: "Por completar"
        },
        {
            title: "Períodos Activos",
            value: stats.periodos,
            icon: <CalendarDaysIcon className="w-6 h-6" />,
            color: "bg-purple-500",
            bgGradient: "from-purple-50 to-purple-100",
            textColor: "text-purple-600",
            description: `En ${stats.años} año${stats.años !== 1 ? 's' : ''}`
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, index) => (
                <Card
                    key={index}
                    className={`bg-gradient-to-br ${stat.bgGradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300 dark:from-slate-800 dark:to-slate-700`}
                >
                    <CardBody className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.color} shadow-lg`}>
                                <div className="text-white">
                                    {stat.icon}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className={`text-2xl font-bold ${stat.textColor} dark:text-slate-200`}>
                                {stat.value}
                            </h3>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                {stat.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {stat.description}
                            </p>
                        </div>
                    </CardBody>
                </Card>
            ))}
        </div>
    );
}

function StatsDetailView({ stats }: {
    stats: {
        total: number;
        completadas: number;
        pendientes: number;
        progresoPromedio: number;
    };
}) {
    const porcentajeCompletado = stats.total > 0 ? (stats.completadas / stats.total) * 100 : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg dark:from-slate-800 dark:to-slate-700">
                <CardBody className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-500 shadow-lg">
                            <UsersIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-blue-600 dark:text-slate-200">
                                {stats.total}
                            </h3>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                Personas en el equipo
                            </p>
                        </div>
                    </div>
                </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-0 shadow-lg dark:from-slate-800 dark:to-slate-700">
                <CardBody className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-emerald-500 shadow-lg">
                            <ChartBarIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-emerald-600 dark:text-slate-200">
                                {porcentajeCompletado.toFixed(0)}%
                            </h3>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                                Progreso del período
                            </p>
                            <Progress
                                value={porcentajeCompletado}
                                color="success"
                                size="sm"
                                className="w-full"
                            />
                        </div>
                    </div>
                </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-lg dark:from-slate-800 dark:to-slate-700">
                <CardBody className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-purple-500 shadow-lg">
                            <StarIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-purple-600 dark:text-slate-200">
                                {stats.progresoPromedio.toFixed(1)}%
                            </h3>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                Promedio de logro
                            </p>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}

function YearSection({
    periodoPorAno,
    onOpenGrupo
}: {
    periodoPorAno: PeriodoPorAno;
    onOpenGrupo: (grupo: GrupoAutoevaluaciones) => void;
}) {
    const porcentajeCompletado = periodoPorAno.totalAutoevaluaciones > 0
        ? (periodoPorAno.completadas / periodoPorAno.totalAutoevaluaciones) * 100
        : 0;

    return (
        <div className="space-y-6">
            {/* Encabezado del año con estadísticas */}
            <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-0 shadow-lg dark:from-slate-800 dark:to-slate-700">
                <CardBody className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                                <CalendarDaysIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                                    {periodoPorAno.año}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400">
                                    {periodoPorAno.periodos.length} período{periodoPorAno.periodos.length !== 1 ? 's' : ''} de evaluación
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="flex items-center gap-4 mb-2">
                                <Chip color="primary" variant="flat">
                                    {periodoPorAno.totalAutoevaluaciones} evaluaciones
                                </Chip>
                                <Chip color="success" variant="flat">
                                    {periodoPorAno.completadas} completadas
                                </Chip>
                            </div>
                            <div className="w-48">
                                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-1">
                                    <span>Progreso anual</span>
                                    <span>{porcentajeCompletado.toFixed(1)}%</span>
                                </div>
                                <Progress
                                    value={porcentajeCompletado}
                                    color="primary"
                                    size="sm"
                                />
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Períodos del año */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {periodoPorAno.periodos.map((grupo) => (
                    <EnhancedPeriodCard
                        key={`${grupo.tipo_evaluacion.id}-${grupo.fecha_evaluacion}`}
                        grupo={grupo}
                        onOpen={() => onOpenGrupo(grupo)}
                    />
                ))}
            </div>
        </div>
    );
}

function EnhancedPeriodCard({
    grupo,
    onOpen
}: {
    grupo: GrupoAutoevaluaciones;
    onOpen: () => void;
}) {
    const fecha = new Date(`${grupo.fecha_evaluacion}-01`);
    const mesFormateado = fecha.toLocaleDateString("es-CL", { month: "long" });
    const porcentajeCompletado = grupo.total_autoevaluaciones > 0
        ? (grupo.completadas / grupo.total_autoevaluaciones) * 100
        : 0;

    const getStatusColor = () => {
        if (porcentajeCompletado === 100) return "success";
        if (porcentajeCompletado >= 70) return "primary";
        if (porcentajeCompletado >= 30) return "warning";
        return "danger";
    };

    return (
        <Card
            isPressable
            onPress={onOpen}
            className="group border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 cursor-pointer dark:bg-slate-800/80 dark:hover:bg-slate-800"
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between w-full">
                    <div className="flex items-start gap-4 flex-1">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                            <DocumentTextIcon className="w-6 h-6 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors leading-tight mb-1">
                                {grupo.tipo_evaluacion.n_tipo_evaluacion}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 capitalize mb-3">
                                {mesFormateado}
                            </p>

                            <div className="flex items-center gap-2">
                                <Chip
                                    size="sm"
                                    color={getStatusColor()}
                                    variant="flat"
                                    className="font-semibold"
                                >
                                    {porcentajeCompletado.toFixed(0)}% completado
                                </Chip>
                            </div>
                        </div>
                    </div>

                    <ArrowRightIcon className="w-5 h-5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
            </CardHeader>

            <CardBody className="pt-0">
                <div className="space-y-4">
                    {/* Progreso visual */}
                    <div className="space-y-2">
                        <Progress
                            value={porcentajeCompletado}
                            color={getStatusColor()}
                            size="sm"
                            className="w-full"
                        />
                    </div>

                    {/* Estadísticas */}
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <UsersIcon className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600 dark:text-slate-300">
                                {grupo.total_autoevaluaciones} persona{grupo.total_autoevaluaciones !== 1 ? 's' : ''}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                                <span className="text-emerald-600 font-medium">{grupo.completadas}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <ClockIcon className="w-4 h-4 text-amber-500" />
                                <span className="text-amber-600 font-medium">{grupo.pendientes}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}

function EnhancedUserCard({
    autoevaluacion,
    nombreCompleto,
    onVer
}: {
    autoevaluacion: AutoevaluacionSubordinado;
    nombreCompleto: (persona: { first_name: string; last_name: string }) => string;
    onVer: () => void;
}) {
    const fechaInicio = new Date(autoevaluacion.fecha_inicio);
    const fechaModificacion = autoevaluacion.fecha_ultima_modificacion
        ? new Date(autoevaluacion.fecha_ultima_modificacion)
        : null;

    const getInitials = (persona: { first_name: string; last_name: string }) => {
        return `${persona.first_name.charAt(0)}${persona.last_name.charAt(0)}`.toUpperCase();
    };

    // Normaliza el valor de logro_obtenido (maneja string/number)
    const logroObtenido = (() => {
        const valor: any = autoevaluacion.logro_obtenido as any;
        if (typeof valor === "number") return valor;
        if (typeof valor === "string") {
            const parsed = parseFloat(valor.replace?.(",", ".") ?? valor);
            return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    })();

    const getStatusInfo = (autoevaluacion: AutoevaluacionSubordinado) => {
        if (autoevaluacion.completado) {
            const evaluationInfo = EvaluationUtils.getEvaluationInfo(logroObtenido);
            return {
                color: evaluationInfo.color,
                text: evaluationInfo.text,
                bgColor: evaluationInfo.bgColor
            };
        }
        return { color: "warning" as const, text: "Pendiente", bgColor: "bg-amber-500" };
    };

    const statusInfo = getStatusInfo(autoevaluacion);

    return (
        <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-slate-800/90">
            <CardHeader className="pb-3">
                <div className="flex items-start gap-4 w-full">
                    {/* Avatar mejorado */}
                    <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">
                                {getInitials(autoevaluacion.persona)}
                            </span>
                        </div>
                        {/* Indicador de estado */}
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${statusInfo.bgColor} flex items-center justify-center`}>
                            {autoevaluacion.completado ? (
                                <CheckCircleIcon className="w-3 h-3 text-white" />
                            ) : (
                                <ClockIcon className="w-3 h-3 text-white" />
                            )}
                        </div>
                    </div>

                    {/* Información del usuario */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 dark:text-white text-lg truncate">
                            {nombreCompleto(autoevaluacion.persona)}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                            {autoevaluacion.persona.email}
                        </p>
                        
                        {/* Estado con chip mejorado */}
                        <div className="mt-2">
                            <Chip
                                color={statusInfo.color}
                                variant="flat"
                                size="sm"
                                className="font-medium"
                            >
                                {statusInfo.text}
                            </Chip>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardBody className="pt-0">
                {/* Progreso de logro (solo si está completado) */}
                {autoevaluacion.completado && logroObtenido > 0 && (
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                Logro obtenido
                            </span>
                            <span className="text-sm font-bold text-slate-800 dark:text-white">
                                {logroObtenido.toFixed(1)}%
                            </span>
                        </div>
                        <Progress
                            value={logroObtenido}
                            color={statusInfo.color}
                            size="sm"
                            className="mb-1"
                        />
                    </div>
                )}

                {/* Información de fechas */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <CalendarDaysIcon className="w-4 h-4" />
                        <span>Iniciado: {fechaInicio.toLocaleDateString("es-CL")}</span>
                    </div>
                    {fechaModificacion && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <ClockIcon className="w-4 h-4" />
                            <span>Última modificación: {fechaModificacion.toLocaleDateString("es-CL")}</span>
                        </div>
                    )}
                </div>

                {/* Botón de acción */}
                <Button
                    onPress={onVer}
                    color="primary"
                    variant="flat"
                    size="sm"
                    className="w-full font-medium"
                    endContent={<EyeIcon className="w-4 h-4" />}
                >
                    {autoevaluacion.completado ? "Ver evaluación" : "Revisar progreso"}
                </Button>
            </CardBody>
        </Card>
    );
}

function EmptyState() {
    return (
        <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <ClipboardDocumentListIcon className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-3">
                No hay autoevaluaciones disponibles
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Aún no se han creado autoevaluaciones para tu equipo. Las evaluaciones aparecerán aquí una vez que sean asignadas.
            </p>
        </div>
    );
}

function EmptyStateDetail() {
    return (
        <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <UserIcon className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-3">
                No hay personas en este período
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                No se encontraron autoevaluaciones para este período específico. Verifica que las evaluaciones hayan sido asignadas correctamente.
            </p>
        </div>
    );
}

function HeaderSkeleton() {
    return (
        <div className="mb-8">
            <div className="flex items-center gap-6">
                <Skeleton className="w-20 h-20 rounded-2xl" />
                <div className="space-y-3 flex-1">
                    <Skeleton className="w-80 h-8 rounded" />
                    <Skeleton className="w-64 h-5 rounded" />
                </div>
            </div>
        </div>
    );
}

function SkeletonGrid() {
    return (
        <div className="space-y-10">
            {/* Skeleton para estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((item) => (
                    <Skeleton key={item} className="w-full h-32 rounded-lg" />
                ))}
            </div>

            {/* Skeleton para secciones de años */}
            {[1, 2].map((year) => (
                <div key={year} className="space-y-6">
                    <Skeleton className="w-full h-24 rounded-lg" />
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((item) => (
                            <Skeleton key={item} className="w-full h-48 rounded-lg" />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}