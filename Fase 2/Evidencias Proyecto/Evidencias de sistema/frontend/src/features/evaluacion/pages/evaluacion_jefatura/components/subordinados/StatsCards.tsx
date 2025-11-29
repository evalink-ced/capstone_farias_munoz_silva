import { Card, CardBody } from "@heroui/card";
import { Progress } from "@heroui/progress";
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
  UsersIcon,
  ChartBarIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

export function StatsOverview({
  stats,
}: {
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
      description: "Autoevaluaciones registradas",
    },
    {
      title: "Completadas",
      value: stats.completadas,
      icon: <CheckCircleIcon className="w-6 h-6" />,
      color: "bg-emerald-500",
      bgGradient: "from-emerald-50 to-emerald-100",
      textColor: "text-emerald-600",
      description: "Evaluaciones finalizadas",
    },
    {
      title: "Pendientes",
      value: stats.pendientes,
      icon: <ClockIcon className="w-6 h-6" />,
      color: "bg-amber-500",
      bgGradient: "from-amber-50 to-amber-100",
      textColor: "text-amber-600",
      description: "Por completar",
    },
    {
      title: "Períodos Activos",
      value: stats.periodos,
      icon: <CalendarDaysIcon className="w-6 h-6" />,
      color: "bg-purple-500",
      bgGradient: "from-purple-50 to-purple-100",
      textColor: "text-purple-600",
      description: `En ${stats.años} año${stats.años !== 1 ? "s" : ""}`,
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
                <div className="text-white">{stat.icon}</div>
              </div>
            </div>
            <div className="space-y-1">
              <h3
                className={`text-2xl font-bold ${stat.textColor} dark:text-slate-200`}
              >
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

export function StatsDetailView({
  stats,
}: {
  stats: {
    total: number;
    completadas: number;
    pendientes: number;
    progresoPromedio: number;
  };
}) {
  const porcentajeCompletado =
    stats.total > 0 ? (stats.completadas / stats.total) * 100 : 0;

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
                className="w-full"
                color="success"
                size="sm"
                value={porcentajeCompletado}
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
