// features/evaluacion/pages/EvaluacionMixtaIntro.tsx
import { useNavigate } from "react-router-dom";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import ProcesoEvaluacionMixta from "@/features/evaluacion/components/mixta/ProcesoEvaluacionMixta";
import CriteriosEvaluacion from "@/features/evaluacion/components/mixta/CriteriosEvaluacion";

import { useEvaluacionesMixtas } from "@/features/evaluacion/hooks/useEvaluacionesMixtas";
import FiltrosEvaluacionComponent from "@/features/evaluacion/components/mixta/FiltrosEvaluacion";
import VistaTarjetas from "@/features/evaluacion/components/mixta/VistaTarjetas";
import VistaTabla from "@/features/evaluacion/components/mixta/VistaTabla";

export default function EvaluacionMixtaIntro() {
  const navigate = useNavigate();
  const {
    loading, error,
    filtros, setFiltros,
    vistaActual, setVistaActual,
    paginaActual, setPaginaActual,
    opcionesFiltros,
    items, total, totalPaginas,
    limpiarFiltros,
  } = useEvaluacionesMixtas(6);

  const handleEvaluacionMixta = (detalleId: number) => {
    navigate(`/evaluacion-mixta/${detalleId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" label="Cargando evaluaciones..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="max-w-md">
          <CardBody className="text-center">
            <p className="text-danger">{error}</p>
            <Button color="primary" className="mt-4" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }


  const pasos = [
    {
      numero: "01",
      title: "Comparación de Evaluaciones",
      text: "Visualiza y compara las autoevaluaciones con las evaluaciones de jefatura para identificar brechas y oportunidades de desarrollo.",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-2M9 11V9a2 2 0 1 1 4 0v2M9 11h6" />
          <path d="M9 16h6" />
        </svg>
      ),
      bgGradient: "from-blue-500/20 to-indigo-500/20",
      iconBg: "from-blue-500 to-indigo-600",
    },
    {
      numero: "02",
      title: "Análisis de Discrepancias",
      text: "Identifica las diferencias entre la autopercepción y la evaluación supervisora para generar planes de desarrollo más efectivos.",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 19c-5 0-8-3-8-8s3-8 8-8 8 3 8 8-3 8-8 8z" />
          <path d="M15 9l6 6" />
          <path d="M21 9l-6 6" />
        </svg>
      ),
      bgGradient: "from-purple-500/20 to-pink-500/20",
      iconBg: "from-purple-500 to-pink-600",
    },
  ];

  const criterios = [
    { title: "Competencias Técnicas", description: "Evaluación de habilidades específicas del puesto", icon: "🎯" },
    { title: "Competencias Conductuales", description: "Análisis de comportamientos y actitudes", icon: "🤝" },
    { title: "Resultados y Logros", description: "Medición de objetivos alcanzados", icon: "📊" },
    { title: "Desarrollo Profesional", description: "Identificación de áreas de mejora", icon: "📈" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200/50 shadow-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-700">Evaluación de Desempeño</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Evaluación Mixta
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Compara y analiza las evaluaciones desde múltiples perspectivas para obtener una visión integral del desempeño.
          </p>
        </div>

        {/* Filtros */}
        <FiltrosEvaluacionComponent
          filtros={filtros}
          setFiltros={setFiltros}
          vistaActual={vistaActual}
          setVistaActual={setVistaActual}
          paginaActual={paginaActual}
          setPaginaActual={setPaginaActual}
          total={total}
          totalPaginas={totalPaginas}
          itemsPorPagina={6}
          opciones={opcionesFiltros}
          onLimpiar={limpiarFiltros}
        />

        {/* Evaluaciones */}
        {total > 0 ? (
          vistaActual === "tarjetas" ? (
            <VistaTarjetas items={items} onVerMixta={handleEvaluacionMixta} />
          ) : (
            <VistaTabla items={items} onVerMixta={handleEvaluacionMixta} />
          )
        ) : (
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardBody className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M7 12h10m-7 6h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                No se encontraron resultados
              </h3>
              <p className="text-slate-600 max-w-md mx-auto">
                Intenta ajustar los filtros para encontrar las evaluaciones que buscas.
              </p>
              <Button color="primary" variant="flat" className="mt-4" onClick={limpiarFiltros}>
                Limpiar Filtros
              </Button>
            </CardBody>
          </Card>
        )}
        {/* Proceso de Evaluación */}
        <ProcesoEvaluacionMixta pasos={pasos} />

        {/* Criterios de Evaluación */}
        <CriteriosEvaluacion criterios={criterios} />

        {/* Secciones estáticas (proceso/criterios) – puedes dejarlas aquí o extraerlas si las reutilizas */}
        {/* ... (tu contenido de “Proceso de Evaluación” y “Criterios de Evaluación”) ... */}
      </div>
    </div>
  );
}
