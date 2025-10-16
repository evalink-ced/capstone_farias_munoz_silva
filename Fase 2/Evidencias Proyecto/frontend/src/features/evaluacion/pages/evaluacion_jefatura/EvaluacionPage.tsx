import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Spinner } from "@heroui/spinner";
import { addToast } from "@heroui/toast";
import axios from "@/services/google/axiosInstance";

const EvaluacionFormulario = lazy(() =>
  import("@/features/evaluacion/components/evaluacion/EvaluacionFormulario"),
);

// Importaciones para el nuevo flujo
import { AccionesEvaluacionFlow } from "@/features/evaluacion/components/flow/AccionesEvaluacionFlow";
import { TimelineEvaluacion } from "@/features/evaluacion/components/flow/TimelineEvaluacion";
import type { EvaluacionJefe } from "@/features/evaluacion/types/evaluacion";

// Componente de loading mejorado
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
    <div className="flex flex-col items-center space-y-4">
      <Spinner size="lg" className="text-blue-600" />
      <p className="text-slate-600 text-sm animate-pulse">Cargando evaluación...</p>
    </div>
  </div>
);

// Componente de header mejorado
const EvaluacionHeader = ({ tipo, personaNombre, isCompleted }: {
  tipo: string;
  personaNombre: string;
  isCompleted?: boolean;
}) => (
  <div className="rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
    <div className="text-center space-y-3">
      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium  text-slate border border-blue-200">
        {isCompleted ? '✓ Completada' : 'En progreso'}
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-default-900 leading-tight">
        {tipo}
      </h1>

      <div className="flex items-center justify-center space-x-2 text-slate-600">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-semibold">
            {personaNombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </span>
        </div>
        <h2 className="text-lg md:text-xl font-semibold text-default-800">
          {personaNombre}
        </h2>
      </div>
    </div>
  </div>
);

// Componente contenedor de contenido
const ContentSection = ({ children, className = "" }: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
    {children}
  </div>
);

export default function EvaluacionPage() {
  const [loading, setLoading] = useState(true);
  const [personaNombre, setPersonaNombre] = useState<string>("");
  const [tipo, setTipo] = useState<string>("");
  const [evaluacionActual, setEvaluacionActual] = useState<EvaluacionJefe | null>(null);
  const navigate = useNavigate();
  const { state } = useLocation();
  const idDesdeState = state?.id;

  useEffect(() => {
    const cargar = async () => {
      try {
        // Si ya vengo con ID, cargo esa evaluación y obtengo el nombre
        if (idDesdeState) {
          const { data } = await axios.get(
            `/evaluacion/api/evaluaciones-jefe/${idDesdeState}/`,
          );

          // Guardar la evaluación completa en el estado
          setEvaluacionActual(data);

          const u = data?.persona ?? {};
          setPersonaNombre(
            `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || "Sin nombre",
          );
          const t = data?.tipo_evaluacion ?? { nombre: "" };
          setTipo(t.n_tipo_evaluacion);

          return;
        }

        // Si no hay ID, busco la primera pendiente y redirijo con ese ID
        const { data } = await axios.get("/evaluacion/api/evaluaciones-jefe/");
        const evalPend = data.find((e: any) => !e.completado);

        if (evalPend) {
          navigate("/evaluacion-jefatura/tabla/formulario", {
            state: { id: evalPend.id },
            replace: true,
          });
        } else {
          addToast({
            title: "No tienes evaluaciones pendientes",
            description: "No tienes evaluaciones pendientes.",
            color: "warning",
            variant: "solid",
          });
          navigate("/evaluacion-jefatura?sinEvaluacion=true", { replace: true });
        }
      } catch (err) {
        console.error(err);
        addToast({
          title: "Error al cargar la evaluación",
          description: "Ocurrió un error al intentar cargar la evaluación.",
          color: "danger",
          variant: "solid",
        });
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [idDesdeState, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/50 rounded-xl">
      {/* Container principal con padding responsivo */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">

        {/* Header de la evaluación */}
        <EvaluacionHeader
          tipo={tipo}
          personaNombre={personaNombre}
          isCompleted={evaluacionActual?.completado}
        />

        {/* Contenido principal */}
        <div className="space-y-6">

          {/* Formulario de evaluación */}
          <ContentSection>
            <Suspense
              fallback={
                <div className="flex justify-center py-12">
                  <div className="flex flex-col items-center space-y-3">
                    <Spinner size="md" className="text-blue-600" />
                    <p className="text-slate-500 text-sm">Cargando formulario...</p>
                  </div>
                </div>
              }
            >
              <EvaluacionFormulario />
            </Suspense>
          </ContentSection>

          {/* Timeline y acciones - Solo si la evaluación está completada */}
          {evaluacionActual && evaluacionActual.completado && (
            <div className="space-y-6">

              {/* Separador visual */}
              <div className="flex items-center justify-center py-4">
                <div className="flex items-center space-x-4 text-slate-400">
                  <div className="h-px bg-slate-200 w-16"></div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm font-medium text-slate-600">Evaluación Completada</span>
                  </div>
                  <div className="h-px bg-slate-200 w-16"></div>
                </div>
              </div>

              {/* Timeline */}
              <ContentSection>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Historial de la Evaluación
                  </h3>
                  <TimelineEvaluacion
                    evaluacion={evaluacionActual}
                    compact={true}
                  />
                </div>
              </ContentSection>

              {/* Acciones */}
              <ContentSection>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 01-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 01-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 01-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Acciones Disponibles
                  </h3>
                  <AccionesEvaluacionFlow
                    evaluacion={evaluacionActual}
                    onSuccess={(evaluacionActualizada) => {
                      setEvaluacionActual(evaluacionActualizada);
                    }}
                  />
                </div>
              </ContentSection>
            </div>
          )}
        </div>

        {/* Footer espaciado */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}