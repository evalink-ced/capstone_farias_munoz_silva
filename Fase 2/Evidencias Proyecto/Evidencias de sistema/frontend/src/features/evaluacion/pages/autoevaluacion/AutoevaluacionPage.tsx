import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Spinner } from "@heroui/spinner";
import { addToast } from "@heroui/toast";
import { 
  Loader2, 
  CheckCircle2, 
  Clock, 
  FileText
} from "lucide-react";

import axios from "@/services/google/axiosInstance";
import { cn } from "@/lib/utils";

const AutoevaluacionFormulario = lazy(() =>
  import("@/features/evaluacion/components").then((module) => ({
    default: module.AutoevaluacionFormulario,
  })),
);

// --- Tipado Flexible para el Header ---
interface AutoevaluacionDetalle {
  id: number;
  completado: boolean;
  // Soportamos varias estructuras posibles para asegurar que se lea
  tipo_evaluacion?: { 
    n_tipo_evaluacion?: string; 
    nombre?: string; 
  };
}

// --- 1. Componente de Loading ---
const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div className="flex flex-col items-center gap-4 p-8 rounded-2xl animate-in fade-in zoom-in duration-500">
      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-indigo-600 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
      </div>
      <p className="text-slate-500 dark:text-slate-400 font-medium text-sm tracking-wide">
        Cargando tu autoevaluación...
      </p>
    </div>
  </div>
);

// --- 2. Header de Autoevaluación (Corregido) ---
const AutoevaluacionHeader = ({
  detalle
}: {
  detalle: AutoevaluacionDetalle | null;
}) => {
  // Lógica robusta para extraer el texto
  const tipo = detalle?.tipo_evaluacion?.n_tipo_evaluacion || 
               detalle?.tipo_evaluacion?.nombre || 
               "Evaluación de Desempeño";

  const isCompleted = detalle?.completado;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 mb-8 transition-all hover:shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Info Principal */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
            Mi Autoevaluación
          </h1>
          
          <div className="flex flex-wrap items-center gap-3">
             {/* Tag: Tipo de Evaluación */}
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300">
               <FileText className="w-4 h-4" />
               <span className="font-semibold text-sm">{tipo}</span>
             </div>
          </div>
        </div>

        {/* Badge de Estado */}
        <div className="flex items-start md:items-end">
            <div className={cn(
                "px-4 py-2 rounded-full border flex items-center gap-2 text-sm font-semibold transition-colors",
                isCompleted 
                    ? "bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400"
                    : "bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400"
            )}>
                {isCompleted ? (
                    <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Completada</span>
                    </>
                ) : (
                    <>
                        <Clock className="w-4 h-4 animate-pulse" />
                        <span>En Progreso</span>
                    </>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

// --- 3. Contenedor de Sección ---
const ContentSection = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn(
      "bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all hover:shadow-md", 
      className
  )}>
    <div className="p-0">
        {children}
    </div>
  </div>
);

export default function AutoevaluacionPage() {
  const [loading, setLoading] = useState(true);
  const [evaluacionActual, setEvaluacionActual] = useState<AutoevaluacionDetalle | null>(null);
  
  const navigate = useNavigate();
  const { state, search } = useLocation();
  
  const selectedId = useMemo(() => {
    const fromState = state?.id;
    const params = new URLSearchParams(search);
    const fromQuery = params.get("id");
    const raw = fromState ?? fromQuery;
    const num = raw != null ? Number(String(raw).split("/")[0]) : undefined;

    return Number.isFinite(num as number) ? (num as number) : undefined;
  }, [state, search]);

  useEffect(() => {
    const cargarAutoevaluacion = async () => {
      try {
        const cameFromInicio = state?.from === "/autoevaluacion/inicio";
        const hasId = Boolean(selectedId);

        if (hasId) {
          try {
            // Cargar detalle completo
            const { data } = await axios.get(`/evaluacion/api/autoevaluaciones/${selectedId}/`);
            console.log("Datos de evaluación cargados:", data); // Debug para ver estructura real
            setEvaluacionActual(data);
          } catch (error) {
            console.warn("Error cargando detalle:", error);
            setEvaluacionActual({ id: selectedId!, completado: false });
          }
          setLoading(false);
          return;
        }

        if (cameFromInicio) {
          addToast({
            title: "Selecciona una evaluación",
            description: "No se encontró el período seleccionado.",
            color: "warning",
            variant: "flat",
          });
          navigate("/autoevaluacion/inicio", { replace: true });
          return;
        }

        const response = await axios.get<AutoevaluacionDetalle[]>("/evaluacion/api/autoevaluaciones/");
        const evaluacionPendiente = response.data.find((e) => !e.completado);

        if (evaluacionPendiente) {
          navigate("/autoevaluacion/inicio/formulario", {
            state: { id: evaluacionPendiente.id },
            replace: true,
          });
        } else {
          addToast({
            title: "Todo listo",
            description: "No tienes autoevaluaciones pendientes.",
            color: "success",
            variant: "flat",
          });
          navigate("/autoevaluacion?sinEvaluacion=true", { replace: true });
        }
      } catch (err) {
        console.error(err);
        addToast({
          title: "Error de conexión",
          description: "No pudimos cargar la autoevaluación.",
          color: "danger",
          variant: "flat",
        });
      } finally {
        setLoading(false);
      }
    };

    cargarAutoevaluacion();
  }, [navigate, selectedId, state?.from]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-32">
        
        {/* Header con Periodo visible */}
        <AutoevaluacionHeader detalle={evaluacionActual} />

        <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700 ease-out">
          <ContentSection>
            <Suspense 
              fallback={
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <Spinner className="text-indigo-600" size="lg" />
                  <p className="text-slate-400 font-medium animate-pulse">Cargando formulario...</p>
                </div>
              }
            >
              <AutoevaluacionFormulario />
            </Suspense>
          </ContentSection>
        </div>
      </div>
    </div>
  );
}