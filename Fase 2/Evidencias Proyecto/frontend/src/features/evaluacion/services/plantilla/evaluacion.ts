import api from "@/services/google/axiosInstance"; // usa el global con refresh automático
import { TipoEvaluacion } from "@/features/evaluacion/types/evaluacion";

export const BASE_API_URL = import.meta.env.VITE_API_URL + "/evaluacion/api/";

export const fetchEvaluacion = async (): Promise<TipoEvaluacion[]> => {
  try {
    const response = await api.get<TipoEvaluacion[]>(
      `${BASE_API_URL}tipos-evaluacion/`,
    );

    return response.data;
  } catch (error) {
    console.error("❌ Error obteniendo los tipos de evaluación:", error);

    return [];
  }
};

export const fetchEvaluacionById = async (
  id: number,
): Promise<TipoEvaluacion | null> => {
  try {
    const response = await api.get<TipoEvaluacion>(
      `${BASE_API_URL}tipos-evaluacion/${id}/`,
    );

    return response.data;
  } catch (error) {
    console.error("Error obteniendo el tipo de evaluación:", error);

    return null;
  }
};
