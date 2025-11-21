import { useEffect, useState } from "react";

import axios from "@/services/google/axiosInstance";
import { TipoEvaluacion } from "@/features/evaluacion/types/evaluacion";

export default function useTiposEvaluacion() {
  const [tipos, setTipos] = useState<TipoEvaluacion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get("/evaluacion/api/tipos-evaluacion/")
      .then((res) => setTipos(res.data))
      .finally(() => setLoading(false));
  }, []);

  return { tipos, loading };
}
