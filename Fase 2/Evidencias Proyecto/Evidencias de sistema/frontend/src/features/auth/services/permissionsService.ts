import api from "@/services/google/axiosInstance";

export type UserPermissions = {
  grupo: string;
  empresa: string;
  permisos: string[];
  is_staff?: boolean;
};

export const getUserPermissions = async (): Promise<UserPermissions> => {
  const response = await api.get("/acceso/api/auth/user/access/");
  const data = response.data;

  const permisos = Array.isArray(data?.permisos) ? data.permisos : [];

  let grupo = "";

  if (Array.isArray(data?.grupo)) {
    grupo = data.grupo
      .map((g: any) =>
        typeof g === "string" ? g : (g?.group ?? g?.name ?? ""),
      )
      .filter(Boolean)
      .join(", ");
  } else if (typeof data?.grupo === "string") {
    grupo = data.grupo;
  }

  let empresa = "";

  if (typeof data?.empresa === "string") {
    empresa = data.empresa;
  } else if (Array.isArray(data?.grupo)) {
    const empresas = data.grupo
      .flatMap((g: any) => (Array.isArray(g?.empresa) ? g.empresa : []))
      .map((e: any) => e?.name ?? e?.empresa ?? e)
      .filter(Boolean);

    empresa = Array.from(new Set(empresas)).join(", ");
  }

  const is_staff = Boolean(data?.is_staff);

  return { grupo, empresa, permisos, is_staff };
};
