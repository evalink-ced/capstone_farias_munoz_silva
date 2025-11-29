import { useNavigate } from "react-router-dom";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import {
  ChartBarSquareIcon,
  ScaleIcon,
  ArrowPathIcon,
  DocumentMagnifyingGlassIcon,
  PresentationChartLineIcon,
  LightBulbIcon,
  CheckBadgeIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

// Mantenemos los componentes funcionales complejos
import { useEvaluacionesMixtas } from "@/features/evaluacion/hooks/useEvaluacionesMixtas";
import FiltrosEvaluacionComponent from "@/features/evaluacion/components/mixta/FiltrosEvaluacion";
import VistaTarjetas from "@/features/evaluacion/components/mixta/VistaTarjetas";
import VistaTabla from "@/features/evaluacion/components/mixta/VistaTabla";

export default function EvaluacionMixtaIntro() {
  const navigate = useNavigate();

  // Hook de lógica de negocio
  const {
    loading,
    error,
    filtros,
    setFiltros,
    vistaActual,
    setVistaActual,
    paginaActual,
    setPaginaActual,
    opcionesFiltros,
    items,
    total,
    totalPaginas,
    limpiarFiltros,
  } = useEvaluacionesMixtas(6);

  const handleEvaluacionMixta = (detalleId: number) => {
    navigate(`/evaluacion-mixta/${detalleId}`);
  };

  // --- Datos Estáticos (Rediseñados Inline) ---
  const pasos = [
    {
      numero: "01",
      title: "Comparación",
      text: "Visualiza autoevaluaciones vs evaluación de jefatura.",
      icon: <ScaleIcon className="w-6 h-6" />,
      color: "blue",
    },
    {
      numero: "02",
      title: "Análisis",
      text: "Identifica brechas y oportunidades de desarrollo.",
      icon: <PresentationChartLineIcon className="w-6 h-6" />,
      color: "indigo",
    },
  ];

  const criterios = [
    {
      title: "Técnicas",
      desc: "Habilidades específicas",
      icon: <DocumentMagnifyingGlassIcon className="w-5 h-5" />,
    },
    {
      title: "Conductuales",
      desc: "Comportamientos",
      icon: <UserGroupIcon className="w-5 h-5" />,
    },
    {
      title: "Resultados",
      desc: "Objetivos alcanzados",
      icon: <ChartBarSquareIcon className="w-5 h-5" />,
    },
    {
      title: "Desarrollo",
      desc: "Áreas de mejora",
      icon: <ArrowPathIcon className="w-5 h-5" />,
    },
  ];

  // --- CORRECCIÓN: Eliminamos el "if (loading) return..." que bloqueaba la UI ---
  // Solo bloqueamos si hay un error crítico, no durante la carga normal o filtrado.
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-[#0b1220]">
        <Card className="max-w-md border border-danger-200 bg-danger-50 dark:bg-danger-900/20">
          <CardBody className="text-center p-8">
            <div className="p-3 bg-danger-100 text-danger-600 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <ArrowPathIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-danger-700 mb-2">
              Error de Carga
            </h3>
            <p className="text-danger-600 text-sm mb-6">{error}</p>
            <Button
              color="danger"
              variant="flat"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b1220] pb-10">
      {/* 1. Header Sticky */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 pt-8 pb-8 px-6 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              <ScaleIcon className="w-8 h-8 text-gray-400" />
              Evaluación Mixta
            </h1>
            <p className="text-gray-500 mt-1">
              Análisis comparativo 360° y detección de brechas.
            </p>
          </div>

          {/* Mini Stats Contextuales */}
          <div className="hidden md:flex gap-4">
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-500 uppercase font-bold block">
                Evaluaciones
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {total}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* 2. Contenedor Principal (Filtros + Resultados) */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 min-h-[600px]">
          {/* Header con Filtros */}
          <CardHeader className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex flex-col gap-4">
            <div className="w-full flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <DocumentMagnifyingGlassIcon className="w-5 h-5 text-primary" />
                Resultados de Evaluación
                {/* Indicador de carga discreto (spinner pequeño al lado del título) */}
                {loading && (
                  <Spinner
                    className="ml-2 text-primary"
                    color="current"
                    size="sm"
                  />
                )}
              </h2>
              <div className="flex gap-2">
                {(filtros.busqueda || filtros.estado) && (
                  <Button
                    color="danger"
                    size="sm"
                    variant="light"
                    onPress={limpiarFiltros}
                  >
                    Limpiar Filtros
                  </Button>
                )}
              </div>
            </div>

            {/* Los filtros están siempre visibles ahora */}
            <div className="w-full bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
              <FiltrosEvaluacionComponent
                filtros={filtros}
                itemsPorPagina={6}
                opciones={opcionesFiltros}
                paginaActual={paginaActual}
                setFiltros={setFiltros}
                setPaginaActual={setPaginaActual}
                setVistaActual={setVistaActual}
                total={total}
                totalPaginas={totalPaginas}
                vistaActual={vistaActual}
                onLimpiar={limpiarFiltros}
              />
            </div>
          </CardHeader>

          {/* Cuerpo con Contenido - Manejo de Loading No Intrusivo */}
          <CardBody className="p-6 bg-white dark:bg-gray-900 min-h-[400px]">
            {loading && total === 0 ? (
              // Estado de Carga Inicial (Solo si no hay datos previos, pantalla "limpia")
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Spinner color="primary" size="lg" />
                <p className="text-gray-400 text-sm">
                  Buscando evaluaciones...
                </p>
              </div>
            ) : total > 0 ? (
              // Mostrar Datos (Con opacidad si se está re-filtrando para indicar actividad, pero sin bloquear)
              <div
                className={`animate-in fade-in duration-500 transition-opacity ${loading ? "opacity-50 pointer-events-none" : ""}`}
              >
                {vistaActual === "tarjetas" ? (
                  <VistaTarjetas
                    items={items}
                    onVerMixta={handleEvaluacionMixta}
                  />
                ) : (
                  <VistaTabla
                    items={items}
                    onVerMixta={handleEvaluacionMixta}
                  />
                )}
              </div>
            ) : (
              // Estado Vacío (Solo si NO está cargando y de verdad no hay datos)
              !loading && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <DocumentMagnifyingGlassIcon className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No se encontraron resultados
                  </h3>
                  <p className="text-gray-500 max-w-xs mx-auto mb-6 text-sm">
                    Intenta ajustar los criterios de búsqueda o limpia los
                    filtros para ver todas las evaluaciones.
                  </p>
                  <Button
                    color="primary"
                    variant="flat"
                    onPress={limpiarFiltros}
                  >
                    Mostrar Todo
                  </Button>
                </div>
              )
            )}
          </CardBody>
        </Card>

        {/* 3. Sección Informativa (Footer Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Pasos */}
          <Card className="lg:col-span-2 border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
            <CardHeader className="px-6 pt-6 pb-2">
              <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <LightBulbIcon className="w-5 h-5 text-amber-500" />
                Metodología de Análisis
              </h3>
            </CardHeader>
            <CardBody className="p-6 pt-2">
              <div className="grid md:grid-cols-2 gap-4">
                {pasos.map((paso, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-${paso.color}-100 text-${paso.color}-600 dark:bg-${paso.color}-900/20`}
                    >
                      {paso.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Chip
                          className="h-5 px-1 text-[10px] font-bold bg-white dark:bg-gray-700"
                          size="sm"
                          variant="flat"
                        >
                          {paso.numero}
                        </Chip>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                          {paso.title}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {paso.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Columna Criterios */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
            <CardHeader className="px-6 pt-6 pb-2">
              <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <CheckBadgeIcon className="w-5 h-5 text-emerald-500" />
                Dimensiones
              </h3>
            </CardHeader>
            <CardBody className="p-6 pt-2">
              <div className="space-y-3">
                {criterios.map((c, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between group cursor-default"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-gray-400 group-hover:text-primary-500 transition-colors">
                        {c.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                          {c.title}
                        </p>
                        <p className="text-[10px] text-gray-400">{c.desc}</p>
                      </div>
                    </div>
                    <ArrowRightIcon className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Subcomponente auxiliar para iconos (para evitar errores de importación si faltan)
function UserGroupIcon(props: any) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
