import { useEffect, useState, Suspense } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Spinner } from "@heroui/spinner";

import { fetchEvaluacionById } from "@/features/evaluacion/services/plantilla/evaluacion";
import { TipoEvaluacion } from "@/features/evaluacion/types/evaluacion";
import useEvaluacionStore from "@/stores/evaluacion/plantilla/useEvaluacionStore";
import { AreaEditor } from "@/features/evaluacion/components";

function sanitizeEvaluacion(evaluacion: TipoEvaluacion): TipoEvaluacion {
  return {
    ...evaluacion,
    areas: (evaluacion.areas ?? []).map((area) => ({
      ...area,
      competencias: (area.competencias ?? []).map((comp) => ({
        ...comp,
        indicadores: (comp.indicadores ?? []).map((ind) => ({
          ...ind,
          nvlindicadores: ind.nvlindicadores ?? [],
        })),
      })),
    })),
  };
}

export default function EditarFormularioWrapperPage() {
  const location = useLocation();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { setNombre, setAreas } = useEvaluacionStore.getState();

    const cargarEvaluacion = async (evaluacion: TipoEvaluacion) => {
      const data = sanitizeEvaluacion(evaluacion);

      setNombre(data.n_tipo_evaluacion);
      setAreas(data.areas ?? []);
    };

    if (location.state?.tipoEvaluacion) {
      cargarEvaluacion(location.state.tipoEvaluacion);
      setLoading(false);
    } else if (id) {
      fetchEvaluacionById(Number(id)).then((data) => {
        if (data) cargarEvaluacion(data);
        setLoading(false);
      });
    } else {
      console.warn("No se encontró evaluación ni en state ni en params");
      setLoading(false);
    }
  }, [id, location.state]);

  if (loading) {
    return <p className="text-center mt-10">Cargando evaluación...</p>;
  }

  return (
    <>
      <section className="items-center justify-center py-2 max-w-6xl mx-auto w-full">
        <Suspense fallback={<Spinner label="Cargando editor de áreas..." />}>
          <AreaEditor />
        </Suspense>
      </section>
    </>
  );
}
