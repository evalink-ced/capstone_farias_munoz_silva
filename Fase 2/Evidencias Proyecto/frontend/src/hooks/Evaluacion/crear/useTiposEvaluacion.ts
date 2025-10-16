import { useEffect, useState } from "react";

import axios from "@/services/google/axiosInstance";
import { TipoEvaluacion } from "@/features/evaluacion/types/evaluacion";

export default function useTiposEvaluacion() {
  const [tipos, setTipos] = useState<TipoEvaluacion[]>([]);

  useEffect(() => {
    axios
      .get("/evaluacion/api/tipos-evaluacion/")
      .then((res) => setTipos(res.data));
  }, []);

  return tipos;
}
