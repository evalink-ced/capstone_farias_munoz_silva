import { PERMISSIONS, isValidPermission } from "@/constants/permissions";
import { SectionButton } from "@/types/sections";

// Función para crear botones con permisos automáticos
export const createButton = (
  label: string,
  href: string,
  permission: string,
  options?: Partial<SectionButton>,
): SectionButton => {
  // Validar que el permiso existe
  if (!isValidPermission(permission)) {
    console.warn(`Permiso no válido: ${permission}`);
  }

  return {
    label,
    href,
    permiso: permission,
    ...options,
  };
};

// Factory para crear botones por módulo
export const createPortalButton = (
  key: keyof typeof PERMISSIONS.PORTAL,
  label: string,
  href: string,
) => createButton(label, href, PERMISSIONS.PORTAL[key]);

export const createDirectivoButton = (
  key: keyof typeof PERMISSIONS.DIRECTIVO,
  label: string,
  href: string,
) => createButton(label, href, PERMISSIONS.DIRECTIVO[key]);

export const createEvaluacionButton = (
  key: keyof typeof PERMISSIONS.EVALUACION,
  label: string,
  href: string,
) => createButton(label, href, PERMISSIONS.EVALUACION[key]);

export const createFundacionButton = (
  key: keyof typeof PERMISSIONS.FUNDACION,
  label: string,
  href: string,
) => createButton(label, href, PERMISSIONS.FUNDACION[key]);

export const createSistemaButton = (
  key: keyof typeof PERMISSIONS.SISTEMA,
  label: string,
  href: string,
) => createButton(label, href, PERMISSIONS.SISTEMA[key]);
