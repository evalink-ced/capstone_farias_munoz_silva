// features/evaluacion/autoevaluacion/pages/AutoevaluacionInicioPage.tsx
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Tabs, Tab } from "@heroui/tabs";
import { Progress } from "@heroui/progress";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import "@/features/evaluacion/styles/animations.css";
import { EvaluacionGrid, GridSkeleton } from "@/features/evaluacion/components/autoevaluacion/PageInicio";
import { useAutoevaluaciones } from "@/features/evaluacion/hooks/useAutoevaluaciones";
import { EvaluationUtils } from "@/features/evaluacion/constants/defaults";
import axios from "axios";
import { addToast } from "@heroui/toast";
import { Button } from "@heroui/button";

// Tipos para mejor tipado
interface Estadisticas {
  total: number;
  completadas: number;
  pendientes: number;
  progresoGeneral: number;
  promedioLogro: number;
}

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: 'blue' | 'amber' | 'green' | 'purple';
  percentage?: number;
}

// Componente reutilizable para tarjetas de estadísticas
const StatCard = ({ value, subtitle, description, icon, color, percentage }: StatCardProps) => {
  const colorClasses = {
    blue: {
      bg: 'from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50',
      iconBg: 'bg-blue-500',
      textPrimary: 'text-blue-700 dark:text-blue-300',
      textSecondary: 'text-blue-600 dark:text-blue-400',
      textTertiary: 'text-blue-500 dark:text-blue-500'
    },
    amber: {
      bg: 'from-amber-50 to-orange-100 dark:from-amber-950/50 dark:to-orange-900/50',
      iconBg: 'bg-amber-500',
      textPrimary: 'text-amber-700 dark:text-amber-300',
      textSecondary: 'text-amber-600 dark:text-amber-400',
      textTertiary: 'text-amber-500 dark:text-amber-500'
    },
    green: {
      bg: 'from-green-50 to-emerald-100 dark:from-green-950/50 dark:to-emerald-900/50',
      iconBg: 'bg-green-500',
      textPrimary: 'text-green-700 dark:text-green-300',
      textSecondary: 'text-green-600 dark:text-green-400',
      textTertiary: 'text-green-500 dark:text-green-500'
    },
    purple: {
      bg: 'from-purple-50 to-violet-100 dark:from-purple-950/50 dark:to-violet-900/50',
      iconBg: 'bg-purple-500',
      textPrimary: 'text-purple-700 dark:text-purple-300',
      textSecondary: 'text-purple-600 dark:text-purple-400',
      textTertiary: 'text-purple-500 dark:text-purple-500'
    }
  };

  const classes = colorClasses[color];

  return (
    <Card className={`bg-gradient-to-br ${classes.bg} border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
      <CardBody className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`inline-flex items-center justify-center w-12 h-12 ${classes.iconBg} rounded-xl shadow-lg`}>
            {icon}
          </div>
          {percentage !== undefined && (
            <Chip
              color={color === 'blue' ? 'primary' : color === 'amber' ? 'warning' : color === 'green' ? 'success' : 'secondary'}
              variant="flat"
              size="sm"
              className="font-bold"
            >
              {percentage}%
            </Chip>
          )}
        </div>

        <div className="space-y-2">
          <h3 className={`text-3xl font-bold ${classes.textPrimary}`}>
            {value}
          </h3>
          <p className={`font-semibold ${classes.textSecondary}`}>
            {subtitle}
          </p>
          <p className={`text-sm ${classes.textTertiary}`}>
            {description}
          </p>
        </div>
      </CardBody>
    </Card>
  );
};

// Iconos como componentes para mejor rendimiento
const Icons = {
  clipboard: (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  clock: (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  check: (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  target: (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
};

export default function AutoevaluacionInicioPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"pendientes" | "finalizadas">("pendientes");

  const { pendientes, finalizadas, loading, error, showLoadingUI } = useAutoevaluaciones();
  const all = useMemo(() => [...pendientes, ...finalizadas], [pendientes, finalizadas]);

  // Estadísticas calculadas con promedio de logro
  const estadisticas = useMemo((): Estadisticas => {
    const total = pendientes.length + finalizadas.length;
    const completadas = finalizadas.length;
    const progresoGeneral = total > 0 ? (completadas / total) * 100 : 0;

    const promedioLogro = finalizadas.length > 0
      ? finalizadas.reduce((acc: number, item: any) => {
        const logro = item?.logro_obtenido || 0; // ✅ Ya usa logro_obtenido del backend
        return acc + logro;
      }, 0) / finalizadas.length
      : 0;

    console.log('Promedio de logro calculado:', promedioLogro);

    return {
      total,
      completadas,
      pendientes: pendientes.length,
      progresoGeneral,
      promedioLogro
    };
  }, [pendientes, finalizadas]);

  // Función optimizada para abrir evaluaciones
  const openEvaluacion = useCallback(
    async (id: number | string, finalizada: boolean) => {
      if (!finalizada) {
        navigate("/autoevaluacion/inicio/formulario", {
          state: { id, from: "/autoevaluacion/inicio" },
        });
        return;
      }

      try {
        // Buscar en memoria primero
        let item = all.find((e: any) => e?.id === id);
        let isPonderada = item?.ponderada;

        // Fallback a la API si es necesario
        if (typeof isPonderada !== "boolean") {
          const { data } = await axios.get(`/evaluacion/api/autoevaluaciones/${id}/`, {
            params: { _t: Date.now() },
          });
          isPonderada = !!(data?.ponderada ?? data?.tipo_evaluacion?.ponderada);
        }

        navigate("/evaluacion-jefatura/tabla/detalle", {
          state: { id, from: "/autoevaluacion/inicio" }
        });
      } catch (error) {
        addToast({
          title: "Error",
          description: "No se pudo abrir el detalle de la autoevaluación.",
          color: "danger",
          variant: "solid",
        });
      }
    },
    [navigate, all]
  );

  // Determinar color del progreso
  const getProgressColor = (percentage: number) => {
    if (percentage === 100) return "success";
    if (percentage >= 70) return "primary";
    if (percentage >= 40) return "warning";
    return "danger";
  };

  const logroColor = getProgressColor(estadisticas.promedioLogro);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/50">
      {/* Barra de carga */}
      {showLoadingUI && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse"
            style={{
              animation: "shimmer 2s infinite linear",
              backgroundSize: "200% 100%"
            }}
          />
        </div>
      )}

      {/* Elementos decorativos optimizados */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gradient-to-tr from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header simplificado */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl mb-6 shadow-xl shadow-blue-500/25">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
            Mis Autoevaluaciones
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Gestiona tu desarrollo profesional y revisa tu progreso
          </p>
        </div>

        {/* Dashboard de estadísticas mejorado */}
        {estadisticas.total > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total"
                value={estadisticas.total}
                subtitle="evaluaciones"
                description="Total de evaluaciones asignadas"
                icon={Icons.clipboard}
                color="blue"
              />

              <StatCard
                title="Pendientes"
                value={estadisticas.pendientes}
                subtitle="por completar"
                description="Evaluaciones que requieren tu atención"
                icon={Icons.clock}
                color="amber"
              />

              <StatCard
                title="Completadas"
                value={estadisticas.completadas}
                subtitle="finalizadas"
                description="Evaluaciones ya completadas"
                icon={Icons.check}
                color="green"
              />

              <StatCard
                title="Progreso"
                value={Math.round(estadisticas.progresoGeneral)}
                subtitle="% completado"
                description="Porcentaje de avance general"
                icon={Icons.target}
                color="purple"
                percentage={estadisticas.progresoGeneral}
              />
            </div>

            {/* Tarjeta de logro promedio */}
            {estadisticas.completadas > 0 && (
              <Card className="bg-gradient-to-r from-white to-slate-50 border-0 shadow-xl dark:from-slate-800 dark:to-slate-700">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        Logro Promedio
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Porcentaje de logro alcanzado
                      </p>
                    </div>
                    <Chip
                      color={logroColor}
                      variant="flat"
                      size="lg"
                      className="font-bold"
                    >
                      {Math.round(estadisticas.promedioLogro)}%
                    </Chip>
                  </div>

                  <Progress
                    value={estadisticas.promedioLogro}
                    color={logroColor}
                    radius="full"
                    className="mb-3"
                    classNames={{
                      track: "h-3 bg-slate-200 dark:bg-slate-700",
                    }}
                  />

                  <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span>Basado en {estadisticas.completadas} evaluaciones</span>
                    <span>
                      {EvaluationUtils.getText(estadisticas.promedioLogro)}
                    </span>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        )}

        <Divider className="mb-8" />

        {/* Sección de tabs simplificada */}
        <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl dark:bg-slate-800/80">
          <CardHeader className="pb-0">
            <div className="w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  Gestión de Evaluaciones
                </h2>
                {estadisticas.pendientes > 0 && (
                  <Chip color="warning" variant="flat" className="animate-pulse font-semibold">
                    {estadisticas.pendientes} pendiente{estadisticas.pendientes !== 1 ? 's' : ''}
                  </Chip>
                )}
              </div>

              {/* Tabs mejorados */}
              <Tabs
                selectedKey={tab}
                onSelectionChange={(key) => setTab(key as typeof tab)}
                variant="underlined"
                classNames={{
                  tabList: "gap-6 w-full relative rounded-xl bg-slate-50/50 dark:bg-slate-700/50 p-1",
                  cursor: "w-full bg-white dark:bg-slate-600 shadow-md rounded-lg",
                  tab: "max-w-fit px-6 py-3 h-12",
                  tabContent: "group-data-[selected=true]:text-slate-800 dark:group-data-[selected=true]:text-white font-semibold"
                }}
              >
                <Tab
                  key="pendientes"
                  title={
                    <div className="flex items-center gap-2">
                      <span>📋</span>
                      <span>Pendientes</span>
                      {estadisticas.pendientes > 0 && (
                        <Chip size="sm" color="warning" variant="flat" className="font-bold">
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
                      <span>✅</span>
                      <span>Finalizadas</span>
                      {estadisticas.completadas > 0 && (
                        <Chip size="sm" color="success" variant="flat" className="font-bold">
                          {estadisticas.completadas}
                        </Chip>
                      )}
                    </div>
                  }
                />
              </Tabs>
            </div>
          </CardHeader>

          <CardBody className="pt-6">
            <div className="min-h-[400px]">
              {tab === "pendientes" ? (
                showLoadingUI ? (
                  <GridSkeleton />
                ) : (
                  <EvaluacionGrid items={pendientes} finalizada={false} onOpen={openEvaluacion} />
                )
              ) : (
                showLoadingUI ? (
                  <GridSkeleton />
                ) : (
                  <EvaluacionGrid items={finalizadas} finalizada={true} onOpen={openEvaluacion} />
                )
              )}
            </div>

            {/* Estados de carga y error optimizados */}
            {loading && (
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-950/50 rounded-full">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Cargando autoevaluaciones...
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <Card className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 max-w-md mx-auto">
                  <CardBody className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-red-800 dark:text-red-200">
                        Error al cargar
                      </h3>
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      onPress={() => window.location.reload()}
                    >
                      Reintentar
                    </Button>
                  </CardBody>
                </Card>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Estilos para animaciones personalizadas */}

    </div>
  );
}