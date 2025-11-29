import { useEffect, useState } from "react";

import {
  getUserPermissions,
  UserPermissions,
} from "@/features/auth/services/permissionsService";
import {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  GOOGLE_ACCESS_TOKEN,
  USER,
} from "@/services/google/token";

export const usePermissions = () => {
  const [data, setData] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const permisos = await getUserPermissions();

        setData(permisos);
      } catch (error: any) {
        console.error("Error al cargar permisos del usuario", error);

        if (
          error?.response?.status === 401 ||
          error?.message?.includes("Token")
        ) {
          console.warn("Token inválido. Limpiando localStorage...");
          localStorage.removeItem(ACCESS_TOKEN);
          localStorage.removeItem(REFRESH_TOKEN);
          localStorage.removeItem(GOOGLE_ACCESS_TOKEN);
          localStorage.removeItem(USER);

          // Opcional: fuerza recarga o redirección
          window.location.href = "/login";
        }

        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const hasAccess = (template: string): boolean => {
    return data?.permisos.includes(template) ?? false;
  };

  return {
    loading,
    permisos: data?.permisos || [],
    grupo: data?.grupo || "",
    empresa: data?.empresa || "",
    is_staff: Boolean(data?.is_staff),
    hasAccess,
  };
};
