import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Spinner } from "@heroui/spinner";
import { addToast } from "@heroui/toast";
import { 
  Loader2, 
  CheckCircle2, 
  Clock, 
  FileText, 
  History, 
  LayoutDashboard 
} from "lucide-react";

import axios from "@/services/google/axiosInstance";
import { cn } from "@/lib/utils"; // Asegúrate de tener tu utilidad cn

// Lazy load del formulario
const EvaluacionFormulario = lazy(
  () => import("@/features/evaluacion/components/evaluacion/EvaluacionFormulario")
);

// Importaciones para el flujo de completado
import { AccionesEvaluacionFlow } from "@/features/evaluacion/components/flow/AccionesEvaluacionFlow";
import { TimelineEvaluacion } from "@/features/evaluacion/components/flow/TimelineEvaluacion";

import type { EvaluacionJefe } from "@/features/evaluacion/types/evaluacion";

// --- 1. Componente de Loading (Clean Slate) ---
const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-4 p-8 rounded-2xl animate-in fade-in zoom-in duration-500">
      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-indigo-600 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
      </div>
      <p className="text-slate-500 font-medium text-sm tracking-wide">
        Preparando entorno de evaluación...
      </p>
    </div>
  </div>
);

// --- 2. Header de Evaluación (Card Style) ---
const EvaluacionHeader = ({
  tipo,
  personaNombre,
  personaImagen, // Nueva prop para la imagen
  isCompleted,
}: {
  tipo: string;
  personaNombre: string;
  personaImagen?: string;
  isCompleted?: boolean;
}) => {
  // Generar iniciales (Fallback)
  const iniciales = personaNombre
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 mb-8 transition-all hover:shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Perfil */}
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
             {/* Lógica: Si hay imagen, la muestra. Si no, muestra iniciales */}
             {personaImagen ? (
               <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-lg shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-800">
                 <img 
                   src={personaImagen} 
                   alt={personaNombre}
                   className="w-full h-full object-cover"
                 />
               </div>
             ) : (
               <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
                  <span className="text-xl sm:text-2xl font-bold text-white tracking-wider">
                    {iniciales}
                  </span>
               </div>
             )}
             
             {/* Decoración de estado */}
             <div className={cn(
                 "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center",
                 isCompleted ? "bg-emerald-500" : "bg-amber-400"
             )}>
                 {isCompleted && <CheckCircle2 className="w-3 h-3 text-white" />}
             </div>
          </div>
          
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
              {personaNombre}
            </h1>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
               <FileText className="w-4 h-4" />
               <span className="font-medium text-sm sm:text-base">{tipo}</span>
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
                        <span>Evaluación Completada</span>
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

// --- 3. Contenedor de Sección (Wrapper) ---
const ContentSection = ({
  children,
  className = "",
  title,
  icon: Icon
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: any;
}) => (
  <div className={cn(
      "bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all hover:shadow-md", 
      className
  )}>
    {title && (
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
            {Icon && (
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm text-indigo-600 dark:text-indigo-400">
                    <Icon className="w-4 h-4" />
                </div>
            )}
            <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
        </div>
    )}
    <div className="p-0">
        {children}
    </div>
  </div>
);

export default function EvaluacionPage() {
  const [loading, setLoading] = useState(true);
  const [personaNombre, setPersonaNombre] = useState<string>("");
  const [personaImagen, setPersonaImagen] = useState<string>(""); // Nuevo estado para la imagen
  const [tipo, setTipo] = useState<string>("");
  const [evaluacionActual, setEvaluacionActual] = useState<EvaluacionJefe | null>(null);
  
  const navigate = useNavigate();
  const { state } = useLocation();
  const idDesdeState = state?.id;

  // Lógica de carga
  useEffect(() => {
    const cargar = async () => {
      try {
        if (idDesdeState) {
          const { data } = await axios.get(`/evaluacion/api/evaluaciones-jefe/${idDesdeState}/`);
          setEvaluacionActual(data);
          
          const u = data?.persona ?? {};
          
          // Nombre
          setPersonaNombre(`${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || "Sin nombre");
          
          // Imagen: Aquí debes poner el campo real de tu API. 
          // Ejemplos comunes: u.foto, u.avatar, u.image, u.profile_picture
          // Si es una URL relativa, recuerda concatenar la base URL si es necesario.
          const img = u.foto || u.avatar || u.imagen || ""; 
          setPersonaImagen(img);

          const t = data?.tipo_evaluacion ?? { nombre: "" };
          setTipo(t.n_tipo_evaluacion);
          return;
        }

        const { data } = await axios.get("/evaluacion/api/evaluaciones-jefe/");
        const evalPend = data.find((e: any) => !e.completado);

        if (evalPend) {
          navigate("/evaluacion-jefatura/tabla/formulario", {
            state: { id: evalPend.id },
            replace: true,
          });
        } else {
          addToast({
            title: "Todo al día",
            description: "No tienes evaluaciones pendientes.",
            color: "success",
            variant: "flat",
          });
          navigate("/evaluacion-jefatura?sinEvaluacion=true", { replace: true });
        }
      } catch (err) {
        console.error(err);
        addToast({
          title: "Error de conexión",
          description: "No pudimos cargar la evaluación. Intenta nuevamente.",
          color: "danger",
          variant: "flat",
        });
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [idDesdeState, navigate]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    // FONDO UNIFICADO: Slate-50 para consistencia total
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/30">
      
      {/* Container Responsivo */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-32">
        
        {/* 1. Header Principal */}
        <EvaluacionHeader
          isCompleted={evaluacionActual?.completado}
          personaNombre={personaNombre}
          personaImagen={personaImagen} // Pasamos la imagen aquí
          tipo={tipo}
        />

        <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700 ease-out">
          
          {/* 2. Área del Formulario (Principal) */}
          <ContentSection>
            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <Spinner className="text-indigo-600" size="lg" />
                  <p className="text-slate-400 font-medium animate-pulse">Cargando formulario...</p>
                </div>
              }
            >
              {/* El formulario ya tiene su propio padding/estilo interno, así que lo dejamos limpio */}
              <EvaluacionFormulario />
            </Suspense>
          </ContentSection>

          {/* 3. Zona de Finalización (Solo si está completado) */}
          {evaluacionActual && evaluacionActual.completado && (
            <div className="space-y-8 animate-in fade-in zoom-in duration-500">
              
              {/* Divisor Visual */}
              <div className="relative flex items-center justify-center py-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative bg-slate-50 dark:bg-slate-950 px-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Resumen del Proceso</span>
                </div>
              </div>

              {/* Timeline Card */}
              <ContentSection title="Historial de Actividad" icon={History}>
                <div className="p-6 sm:p-8">
                  <TimelineEvaluacion
                    compact={true}
                    evaluacion={evaluacionActual}
                  />
                </div>
              </ContentSection>

              {/* Acciones Card */}
              <ContentSection title="Acciones Disponibles" icon={LayoutDashboard}>
                <div className="p-6 sm:p-8">
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
      </div>
    </div>
  );
}