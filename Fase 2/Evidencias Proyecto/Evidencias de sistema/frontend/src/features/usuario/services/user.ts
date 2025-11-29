import { UsuarioDias } from "../types";

import api from "@/services/google/axiosInstance";

export const obtenerUsuariosDias = async (): Promise<UsuarioDias[]> => {
  try {
    const response = await api.get("proyecto/api/usuarios-dias/");

    return response.data;
  } catch (error) {
    console.error("Error al obtener usuarios con días", error);

    return [];
  }
};
