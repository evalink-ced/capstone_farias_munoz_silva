import api from "@/services/google/axiosInstance";
import { AsignacionEvaluacion } from "@/features/evaluacion/types/asignar/evaluacion";
import { BASE_API_URL } from "@/features/evaluacion/services/plantilla/evaluacion";

export const fetchAsignarAutoevaluacion = async (): Promise<
  AsignacionEvaluacion[]
> => {
  try {
    const response = await api.get<AsignacionEvaluacion[]>(
      `${BASE_API_URL}autoevaluaciones-asignadas/`,
    );

    return response.data;
  } catch (error) {
    console.error("❌ Error obteniendo las asignaciones de evaluación:", error);

    return [];
  }
};

export const updateAsignacionAutoevaluacion = async (
  evaluacion: AsignacionEvaluacion,
): Promise<void> => {
  if (!evaluacion.id) {
    throw new Error("La evaluación no tiene ID, no se puede actualizar.");
  }

  await api.put(
    `${BASE_API_URL}autoevaluaciones-asignadas/${evaluacion.id}/`,
    evaluacion,
  );
};

export const fetchAsignarEvaluacion = async (): Promise<
  AsignacionEvaluacion[]
> => {
  try {
    const response = await api.get<AsignacionEvaluacion[]>(
      `${BASE_API_URL}mostrar-asignada/`,
    );

    return response.data;
  } catch (error) {
    console.error("❌ Error obteniendo las asignaciones de evaluación:", error);

    return [];
  }
};

export const updateAsignacionEvaluacion = async (
  evaluacion: AsignacionEvaluacion,
): Promise<void> => {
  if (!evaluacion.id) {
    throw new Error("La evaluación no tiene ID, no se puede actualizar.");
  }

  await api.put(
    `${BASE_API_URL}evaluaciones-asignadas/${evaluacion.id}/`,
    evaluacion,
  );
};
