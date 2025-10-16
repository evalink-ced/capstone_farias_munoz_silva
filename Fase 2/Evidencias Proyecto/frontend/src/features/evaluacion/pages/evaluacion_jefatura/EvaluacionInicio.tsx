import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import {
  CalendarDaysIcon,
  ArrowRightIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  PencilSquareIcon,
  HandRaisedIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

import axios from "@/services/google/axiosInstance";

type EvalAsignacion = {
  id: number;
  fecha_evaluacion: string; // "YYYY-MM"
  personas?: any[];
  tipo_evaluacion?: { id: number; n_tipo_evaluacion?: string };
  total_asignadas?: number;
  total_pendientes?: number;
  total_completadas?: number;
  total_pendientes_firma?: number; // Nueva propiedad
  // Nuevos campos para el flujo de estados
  total_con_reunion?: number;
  total_con_retroalimentacion?: number;
  total_cerradas_firma?: number;
  total_firmadas?: number;
};

export default function EvaluacionInicioPage() {
  const [asignaciones, setAsignaciones] = useState<EvalAsignacion[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fechaFormateada = useCallback(
    (ym: string) =>
      new Date(`${ym}-01T00:00:00`).toLocaleDateString("es-CL", {
        year: "numeric",
        month: "long",
      }),
    [],
  );

  // Estadísticas globales calculadas
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
        firmadas: 0
      }
    );

    const progresoGlobal = totales.total > 0 ? (totales.completadas / totales.total) * 100 : 0;
    const progresoFinal = totales.total > 0 ? (totales.firmadas / totales.total) * 100 : 0;

    return {
      ...totales,
      progresoGlobal,
      progresoFinal,
      tiposEvaluacion: asignaciones.length,
      evaluacionesAtrasadas: asignaciones.filter(a => (a.total_pendientes || 0) > 0).length,
    };
  }, [asignaciones]);

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

        // Actualizar la lógica de cálculo de estadísticas
        const stats: Record<string, {
          total: number;
          completadas: number;
          pendientes: number;
          conReunion: number;
          conRetroalimentacion: number;
          cerradasFirma: number;
          firmadas: number;
        }> = {};

        for (const e of evals) {
          const key = `${e?.tipo_evaluacion?.id}|${e?.fecha_evaluacion}`;
          if (!stats[key]) {
            stats[key] = {
              total: 0,
              completadas: 0,
              pendientes: 0,
              conReunion: 0,
              conRetroalimentacion: 0,
              cerradasFirma: 0,
              firmadas: 0
            };
          }

          stats[key].total += 1;

          // Consider both firmado and denegado as completed processes
          if (e?.estado_firma === 'firmado' || e?.estado_firma === 'firmado_obs') {
            stats[key].firmadas += 1;
          } else if (e?.cerrado_para_firma) {
            stats[key].cerradasFirma += 1;
          } else if (e?.retroalimentacion_completada) {
            stats[key].conRetroalimentacion += 1;
          } else if (e?.reunion_realizada) {
            stats[key].conReunion += 1;
          } else if (e?.completado) {
            stats[key].completadas += 1;
          } else {
            stats[key].pendientes += 1;
          }
        }

        // Actualizar el mapeo de cards
        const enriched = cards.map((c: any) => {
          const key = `${c?.tipo_evaluacion?.id}|${c?.fecha_evaluacion}`;
          const s = stats[key];
          return {
            ...c,
            total_asignadas: s?.total ?? (c.personas?.length ?? 0),
            total_completadas: s?.completadas ?? 0,
            total_pendientes: s?.pendientes ?? (c.personas?.length ?? 0),
            total_con_reunion: s?.conReunion ?? 0,
            total_con_retroalimentacion: s?.conRetroalimentacion ?? 0,
            total_cerradas_firma: s?.cerradasFirma ?? 0,
            total_firmadas: s?.firmadas ?? 0,
          };
        });

        setAsignaciones(enriched);
      } catch (err) {
        console.error(err);
        addToast({
          title: "Error al cargar",
          description: "No se pudieron obtener tus evaluaciones asignadas.",
          color: "danger",
          variant: "solid",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-blue-950/20 dark:to-indigo-950/30">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Header />
          <StatsSkeletonCards />
          <SkeletonGrid />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-blue-950/20 dark:to-indigo-950/30">
      {/* Elementos decorativos de fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <Header />

        {asignaciones.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Dashboard de estadísticas globales
            <StatsOverview stats={estadisticasGlobales} /> */}

            {/* Timeline del proceso de evaluación */}
            <EvaluationTimeline stats={estadisticasGlobales} />

            <Divider className="my-8" />

            {/* Grid de evaluaciones */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  Evaluaciones por Período
                </h2>
                <Chip
                  color="primary"
                  variant="flat"
                  className="font-semibold"
                >
                  {asignaciones.length} período{asignaciones.length !== 1 ? 's' : ''}
                </Chip>
              </div>

              <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {asignaciones.map((item) => (
                  <EvaluationCard
                    key={item.id}
                    item={item}
                    fechaFormateada={fechaFormateada}
                    onOpen={() => openTabla(item)}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ────────────────── Componente Timeline de Evaluación ────────────────── */

interface EvaluationTimelineProps {
  stats: {
    total: number;
    pendientes: number;
    completadas: number;
    conReunion: number;
    conRetroalimentacion: number;
    cerradasFirma: number;
    firmadas: number;
  };
}

function EvaluationTimeline({ stats }: EvaluationTimelineProps) {
  const timelineSteps = [
    {
      id: 'pendientes',
      title: 'Pendientes',
      description: 'Debes completar las evaluaciones pendientes',
      count: stats.pendientes,
      icon: <ClockIcon className="w-5 h-5" />,
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      isActive: stats.pendientes > 0
    },
    {
      id: 'completadas',
      title: 'Retroalimentación',
      description: 'Falta realizar Retroalimentación',
      count: stats.completadas,
      icon: <CheckCircleIcon className="w-5 h-5" />,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      isActive: stats.completadas > 0
    },
    {
      id: 'cerradas',
      title: 'Reunión Finalizada',
      description: 'Falta firma del trabajador',
      count: stats.cerradasFirma,
      icon: <PencilSquareIcon className="w-5 h-5" />,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      isActive: stats.cerradasFirma > 0
    },
    {
      id: 'firmadas',
      title: 'Firmadas',
      description: 'Proceso completado',
      count: stats.firmadas,
      icon: <HandRaisedIcon className="w-5 h-5" />,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      isActive: stats.firmadas > 0
    }
  ];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg dark:bg-slate-800/80 mt-8">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <ChartBarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
              Flujo del Proceso de Evaluación
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Estado actual de todas las evaluaciones
            </p>
          </div>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        <div className="relative">
          {/* Línea de conexión */}
          <div className="absolute top-8 left-8 right-8 h-0.5 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-600 dark:via-slate-500 dark:to-slate-600" />

          {/* Steps */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {timelineSteps.map((step) => (
              <div key={step.id} className="relative">
                {/* Círculo del step */}
                <div className={`relative z-10 w-16 h-16 mx-auto mb-4 rounded-full ${step.color} shadow-lg flex items-center justify-center transition-all duration-300 ${step.isActive ? 'scale-110 shadow-xl' : 'opacity-60'
                  }`}>
                  <div className="text-white">
                    {step.icon}
                  </div>
                  {step.isActive && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-current to-current rounded-full opacity-20 animate-pulse" />
                  )}
                </div>

                {/* Contenido del step */}
                <div className={`text-center p-3 rounded-xl ${step.bgColor} transition-all duration-300 ${step.isActive ? 'shadow-md' : 'opacity-60'
                  }`}>
                  <div className={`text-2xl font-bold ${step.textColor} dark:text-slate-200`}>
                    {step.count}
                  </div>
                  <div className={`text-sm font-semibold ${step.textColor} dark:text-slate-300 mb-1`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {step.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

/* ────────────────── Componente de Estadísticas Globales Actualizado ────────────────── */

// interface StatsOverviewProps {
//   stats: {
//     total: number;
//     completadas: number;
//     conReunion: number;
//     conRetroalimentacion: number;
//     cerradasFirma: number;

//     // Estados finales:
//     firmadas: number;

//     // Métricas calculadas:
//     progresoGlobal: number;
//     progresoFinal: number;
//     tiposEvaluacion: number;
//     evaluacionesAtrasadas: number;
//   };
// }

// function StatsOverview({ stats }: StatsOverviewProps) {
//   const statsCards = [
//     {
//       title: "Total Asignadas",
//       value: stats.total,
//       icon: <UsersIcon className="w-6 h-6" />,
//       color: "bg-blue-500",
//       bgGradient: "from-blue-50 to-blue-100",
//       textColor: "text-blue-600",
//       description: "Evaluaciones totales"
//     },
//     {
//       title: "Tipos de Evaluación",
//       value: stats.tiposEvaluacion,
//       icon: <ChartBarIcon className="w-6 h-6" />,
//       color: "bg-purple-500",
//       bgGradient: "from-purple-50 to-purple-100",
//       textColor: "text-purple-600",
//       description: "Diferentes tipos"
//     },
//     {
//       title: "Pendientes",
//       value: stats.conRetroalimentacion + stats.cerradasFirma + stats.completadas + stats.conReunion,
//       icon: <ClockIcon className="w-6 h-6" />,
//       color: "bg-amber-500",
//       bgGradient: "from-amber-50 to-amber-100",
//       textColor: "text-amber-600",
//       description: "En proceso"
//     },

//     {
//       title: "Finalizadas",
//       value: stats.firmadas,
//       icon: <HandRaisedIcon className="w-6 h-6" />,
//       color: "bg-emerald-500",
//       bgGradient: "from-emerald-50 to-emerald-100",
//       textColor: "text-emerald-600",
//       description: "Proceso finalizado"
//     },

//   ];

//   return (
//     <div className="space-y-6">
//       {/* Cards de estadísticas */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {statsCards.map((stat, index) => (
//           <Card
//             key={index}
//             className={`bg-gradient-to-br ${stat.bgGradient} border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 dark:from-slate-800 dark:to-slate-700`}
//           >
//             <CardBody className="p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <div className={`p-3 rounded-xl ${stat.color} shadow-lg`}>
//                   <div className="text-white">
//                     {stat.icon}
//                   </div>
//                 </div>
//                 {((stat.title === "Pendientes" && stat.value > 0)) && (
//                   <Chip size="sm" color="warning" variant="flat">
//                     Acción requerida
//                   </Chip>
//                 )}
//               </div>
//               <div className="space-y-1">
//                 <h3 className={`text-2xl font-bold ${stat.textColor} dark:text-slate-200`}>
//                   {stat.value}
//                 </h3>
//                 <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
//                   {stat.title}
//                 </p>
//                 <p className="text-xs text-slate-500 dark:text-slate-400">
//                   {stat.description}
//                 </p>
//               </div>
//             </CardBody>
//           </Card>
//         ))}
//       </div>

//     </div>
//   );
// }

/* ────────────────── Componente Tarjeta de Evaluación Actualizada ────────────────── */

type EvaluationCardProps = {
  item: EvalAsignacion;
  fechaFormateada: (s: string) => string;
  onOpen: () => void;
};

function EvaluationCard({ item, fechaFormateada, onOpen }: EvaluationCardProps) {
  const titulo = item.tipo_evaluacion?.n_tipo_evaluacion ?? "Evaluación";
  const total = item.total_asignadas ?? item.personas?.length ?? 0;
  const pendientes = (item.total_pendientes_firma ?? 0) + (item.total_con_reunion ?? 0) + (item.total_con_retroalimentacion ?? 0)
    + (item.total_cerradas_firma ?? 0) + (item.total_pendientes || 0);
  const completadas = item.total_completadas ?? 0;
  const firmadas = item.total_firmadas ?? 0;
  const progreso = total > 0 ? (completadas / total) * 100 : 0;
  const progresoFinal = total > 0 ? (firmadas / total) * 100 : 0;

  const getStatusColor = () => {
    if (progresoFinal === 100) return "success";
    if (progreso === 100) return "primary";
    if (progreso > 70) return "warning";
    if (progreso > 30) return "warning";
    return "danger";
  };

  const getStatusText = () => {
    if (progresoFinal === 100) return "Finalizado";
    if (progreso === 100) return "Completado";
    if (progreso > 70) return "Casi completo";
    if (progreso > 30) return "En progreso";
    if (progreso > 0) return "Iniciado";
    return "Pendiente";
  };

  return (
    <Card
      isPressable
      onPress={onOpen}
      className="group relative border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:bg-white transition-all duration-300 cursor-pointer overflow-hidden dark:bg-slate-800/80 dark:hover:bg-slate-800"
    >
      {/* Barra de estado superior */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-default-100 dark:bg-slate-700">
        <div
          className={`h-full transition-all duration-700 ${progresoFinal === 100
            ? "bg-gradient-to-r from-success-400 to-success-600"
            : progreso === 100
              ? "bg-gradient-to-r from-primary-400 to-primary-600"
              : progreso > 70
                ? "bg-gradient-to-r from-warning-400 to-warning-600"
                : "bg-gradient-to-r from-danger-400 to-danger-600"
            }`}
          style={{ width: `${Math.max(progreso, progresoFinal)}%` }}
        />
      </div>

      <CardHeader className="flex-col items-start gap-4 p-6 pb-3">
        <div className="flex items-start justify-between w-full">
          <div className="flex items-start gap-4 flex-1">
            <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <ClipboardDocumentListIcon className="w-7 h-7 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-primary-600 transition-colors leading-tight mb-2">
                {titulo}
              </h3>

              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-3">
                <CalendarDaysIcon className="w-4 h-4 flex-shrink-0" />
                <span className="capitalize font-medium">
                  {fechaFormateada(item.fecha_evaluacion)}
                </span>
              </div>

              <Chip
                size="sm"
                color={getStatusColor()}
                variant="flat"
                className="font-semibold"
              >
                {getStatusText()}
              </Chip>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pendientes > 0 && (
              <div className="w-2 h-2 bg-warning-400 rounded-full animate-pulse" />
            )}
            <ArrowRightIcon className="w-5 h-5 text-slate-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
        </div>
      </CardHeader>

      <CardBody className="px-6 pb-6 pt-0">
        {/* Estadísticas actualizadas */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-700 transition-colors">
            <div className="text-lg font-bold text-slate-700 dark:text-slate-200">{total}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 transition-colors">
            <div className="text-lg font-bold text-amber-700 dark:text-amber-300">{pendientes}</div>
            <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">Pendientes</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-900/20 transition-colors">
            <div className="text-lg font-bold text-green-700 dark:text-green-300">{firmadas}</div>
            <div className="text-xs text-green-600 dark:text-green-400 font-medium">Firmadas</div>
          </div>
        </div>

        {/* Progreso dual */}
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Evaluación</span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{Math.round(progreso)}%</span>
            </div>
            <Progress
              value={progreso}
              color={progreso === 100 ? "success" : progreso > 70 ? "primary" : "warning"}
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Finalizado</span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{Math.round(progresoFinal)}%</span>
            </div>
            <Progress
              value={progresoFinal}
              color={progresoFinal === 100 ? "success" : progresoFinal > 70 ? "primary" : "danger"}
              className="h-2"
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

/* ────────────────── Header Mejorado ────────────────── */

function Header() {
  const navigate = useNavigate();

  const navigateToAutoevaluaciones = () => {
    navigate('/evaluacion-jefatura/autoevaluaciones-subordinados');
  };

  return (
    <div className="text-center mb-10">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl mb-6 shadow-2xl shadow-blue-500/25 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
        <ClipboardDocumentListIcon className="w-10 h-10 text-white relative z-10" />
      </div>

      <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
        Panel de Evaluaciones
      </h1>

      <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
        Gestiona y supervisa las evaluaciones de desempeño asignadas a tu equipo con herramientas avanzadas de seguimiento
      </p>

      {/* Botón de navegación a autoevaluaciones de subordinados */}
      <div className="flex justify-center">
        <Button
          color="primary"
          variant="flat"
          size="lg"
          startContent={<UserGroupIcon className="w-5 h-5" />}
          onPress={navigateToAutoevaluaciones}
          className="font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Ver Autoevaluaciones de Subordinados
        </Button>
      </div>
    </div>
  );
}

/* ────────────────── Skeleton Loading Mejorado ────────────────── */

function StatsSkeletonCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="bg-white/80 backdrop-blur-sm border-0">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              {i === 2 && <Skeleton className="w-16 h-5 rounded-full" />}
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-16 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48 rounded" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-0 bg-white/80 backdrop-blur-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-default-100">
              <Skeleton className="h-full w-3/4" />
            </div>

            <CardHeader className="p-6 pb-3">
              <div className="flex items-start justify-between w-full">
                <div className="flex items-start gap-4 flex-1">
                  <Skeleton className="w-14 h-14 rounded-2xl" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-32 rounded" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-4 h-4 rounded" />
                      <Skeleton className="h-4 w-24 rounded" />
                    </div>
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
                <Skeleton className="w-5 h-5 rounded" />
              </div>
            </CardHeader>

            <CardBody className="px-6 pb-6 pt-0">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="text-center p-3 rounded-xl bg-slate-50 space-y-2">
                    <Skeleton className="h-5 w-8 mx-auto rounded" />
                    <Skeleton className="h-3 w-12 mx-auto rounded" />
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-16 rounded" />
                    <Skeleton className="h-3 w-8 rounded" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ────────────────── Empty State Mejorado ────────────────── */

function EmptyState() {
  return (
    <div className="max-w-lg mx-auto text-center">
      <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl dark:bg-slate-800/90">
        <CardBody className="p-12">
          <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
            <ClipboardDocumentListIcon className="w-12 h-12 text-slate-400 dark:text-slate-500" />
          </div>

          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
            Sin Evaluaciones Asignadas
          </h3>

          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            Las evaluaciones de desempeño aparecerán automáticamente cuando el área de Recursos Humanos las asigne a tu equipo de trabajo.
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <ClockIcon className="w-4 h-4" />
            <span>Se notificará por email cuando estén disponibles</span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
