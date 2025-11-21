// data/sections.ts
import { Section } from "@/types/sections";
import { buttons } from "@/data/buttons";

export const sections: Section[] = [
  {
    title: "TRABAJADOR",
    icon: "🧑‍🏫",
    buttons: [
      buttons.evaluacionAuto,
    ],
  },
  {
    title: "EVALUADOR",
    icon: "📋",
    buttons: [
      buttons.evaluarDesempeno,
      buttons.evaluacionMixta,
    ],
  },
  {
    title: "FUNDACIÓN",
    icon: "🏫",
    buttons: [buttons.usuarios], // Changed from buttons.usuariosFicha to buttons.usuarios
  },
  {
    title: "RECURSOS HUMANOS",
    icon: "📊",
    buttons: [buttons.plantillas, buttons.asignar],
    fullWidth: true,
  },
];
