import { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@heroui/spinner";
import { addToast } from "@heroui/toast";

import axios from "@/services/google/axiosInstance";

const AutoevaluacionFormulario = lazy(() =>
  import("@/features/evaluacion/components").then((module) => ({
    default: module.AutoevaluacionFormulario,
  })),
);

// Tipado mínimo necesario
interface Autoevaluacion {
  id: number;
  completado: boolean;
}

export default function AutoevaluacionPage() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarAutoevaluacion = async () => {
      try {
        const response = await axios.get<Autoevaluacion[]>(
          "/evaluacion/api/autoevaluaciones/",
        );
        const evaluacionPendiente = response.data.find((e) => !e.completado);

        if (evaluacionPendiente) {
          navigate("/autoevaluacion/inicio/formulario", {
            state: { id: evaluacionPendiente.id },
          });
        } else {
          addToast({
            title: "No tienes autoevaluaciones pendientes",
            description: "No tienes autoevaluaciones pendientes.",
            color: "warning",
            variant: "solid",
          });
          navigate("/autoevaluacion?sinEvaluacion=true");
        }
      } catch (err) {
        console.error(err);
        addToast({
          title: "Error al cargar la autoevaluación",
          description: "Ocurrió un error al intentar cargar la autoevaluación.",
          color: "danger",
          variant: "solid",
        });
      } finally {
        setLoading(false);
      }
    };

    cargarAutoevaluacion();
  }, [navigate]);

  if (loading) {
    return (
      <section className="flex justify-center py-20">
        <Spinner size="lg" />
      </section>
    );
  }

  return (
    <>
      <section className="max-w-6xl mx-auto px-4 py-10">
        <Suspense fallback={<Spinner size="lg" />}>
          <AutoevaluacionFormulario />
        </Suspense>
      </section>
    </>
  );
}
