// data/buttons.ts
import { SectionButton } from "@/types/sections";
import { PERMISSIONS } from "@/constants/permissions";

export const buttons: Record<string, SectionButton> = {
  evaluacionAuto: {
    label: "EVALUACIÓN DE DESEMPEÑO",
    href: "/autoevaluacion",
    permiso: PERMISSIONS.PORTAL.AUTOEVALUACION,
  },
  evaluarDesempeno: {
    label: "EVALUAR DESEMPEÑO",
    href: "/evaluacion-jefatura",
    permiso: PERMISSIONS.DIRECTIVO.EVALUAR_DESEMPENO,
  },
  plantillas: {
    label: "PLANTILLAS",
    href: "/evaluacion-editar",
    permiso: PERMISSIONS.EVALUACION.PLANTILLAS,
  },
  asignar: {
    label: "ASIGNAR",
    href: "/evaluacion-asignar",
    permiso: PERMISSIONS.EVALUACION.ASIGNAR,
  },
  usuarios: {
    label: "USUARIOS",
    href: "/ficha",
    permiso: PERMISSIONS.EVALUACION.PLANTILLAS,
  },
  evaluacionMixta: {
    label: "EVALUACIÓN MIXTA",
    href: "/evaluacion-mixta",
    permiso: PERMISSIONS.DIRECTIVO.EVALUACION_MIXTA,
  },
};
