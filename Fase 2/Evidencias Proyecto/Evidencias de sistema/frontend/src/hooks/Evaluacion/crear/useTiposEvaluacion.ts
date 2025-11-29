import { useEffect, useState } from "react";
import { addToast } from "@heroui/toast";

import axios from "@/services/google/axiosInstance";
import { TipoEvaluacion } from "@/features/evaluacion/types/evaluacion";

export default function useTiposEvaluacion() {
  const [tipos, setTipos] = useState<TipoEvaluacion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      try {
        const res = await axios.get("/evaluacion/api/tipos-evaluacion/");

        if (active) setTipos(res.data);
      } catch (err: any) {
        if (active) setTipos([]);
        addToast({
          title: "Error al cargar tipos de evaluación",
          description:
            err?.response?.data?.detail ||
            "No se pudieron obtener las plantillas de evaluación.",
          color: "danger",
          variant: "solid",
        });
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return { tipos, loading };
}
