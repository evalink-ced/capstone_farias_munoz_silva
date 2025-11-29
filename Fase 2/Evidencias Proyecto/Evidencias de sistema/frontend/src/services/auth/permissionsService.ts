import api from "@/services/google/axiosInstance";
import { Group } from "@/types/types";

export type UserPermissions = {
  grupo: Group[];
  empresa: string;
  permisos: string[];
};

export const getUserPermissions = async (): Promise<UserPermissions> => {
  const response = await api.get("/acceso/api/auth/user/access/");

  return response.data;
};
