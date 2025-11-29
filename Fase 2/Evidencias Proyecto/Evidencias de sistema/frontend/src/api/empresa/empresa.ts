import api from "@/services/google/axiosInstance";

export const fetchMiEmpresa = async () => {
  try {
    const res = await api.get("/institucion/empresa/get/empresa/");

    return res.data;
  } catch (error) {
    console.error("Error al obtener empresas:", error);

    return [];
  }
};
