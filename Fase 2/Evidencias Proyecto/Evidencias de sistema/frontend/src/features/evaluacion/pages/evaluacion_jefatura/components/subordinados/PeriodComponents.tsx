import { Card, CardHeader, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import {
  CalendarDaysIcon,
  DocumentTextIcon,
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export interface GrupoAutoevaluaciones {
  tipo_evaluacion: { id: number; n_tipo_evaluacion: string };
  fecha_evaluacion: string;
  total_autoevaluaciones: number;
  completadas: number;
  pendientes: number;
}

export interface PeriodoPorAno {
  año: number;
  periodos: GrupoAutoevaluaciones[];
  totalAutoevaluaciones: number;
  completadas: number;
  pendientes: number;
}

export function YearSection({
  periodoPorAno,
  onOpenGrupo,
}: {
  periodoPorAno: PeriodoPorAno;
  onOpenGrupo: (grupo: GrupoAutoevaluaciones) => void;
}) {
  const porcentajeCompletado =
    periodoPorAno.totalAutoevaluaciones > 0
      ? (periodoPorAno.completadas / periodoPorAno.totalAutoevaluaciones) * 100
      : 0;

  return (
    <div className="space-y-6">
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
                  {periodoPorAno.periodos.length} período
                  {periodoPorAno.periodos.length !== 1 ? "s" : ""} de evaluación
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
                  color="primary"
                  size="sm"
                  value={porcentajeCompletado}
                />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

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

export function EnhancedPeriodCard({
  grupo,
  onOpen,
}: {
  grupo: GrupoAutoevaluaciones;
  onOpen: () => void;
}) {
  const fecha = new Date(`${grupo.fecha_evaluacion}-01`);
  const mesFormateado = fecha.toLocaleDateString("es-CL", { month: "long" });
  const porcentajeCompletado =
    grupo.total_autoevaluaciones > 0
      ? (grupo.completadas / grupo.total_autoevaluaciones) * 100
      : 0;

  const getStatusColor = () => {
    if (porcentajeCompletado === 100) return "success" as const;
    if (porcentajeCompletado >= 70) return "primary" as const;
    if (porcentajeCompletado >= 30) return "warning" as const;

    return "danger" as const;
  };

  return (
    <Card
      isPressable
      className="group border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 cursor-pointer dark:bg-slate-800/80 dark:hover:bg-slate-800"
      onPress={onOpen}
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
                  className="font-semibold"
                  color={getStatusColor()}
                  size="sm"
                  variant="flat"
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
          <div className="space-y-2">
            <Progress
              className="w-full"
              color={getStatusColor()}
              size="sm"
              value={porcentajeCompletado}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <UsersIcon className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600 dark:text-slate-300">
                {grupo.total_autoevaluaciones} persona
                {grupo.total_autoevaluaciones !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 font-medium">
                  {grupo.completadas}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4 text-amber-500" />
                <span className="text-amber-600 font-medium">
                  {grupo.pendientes}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
