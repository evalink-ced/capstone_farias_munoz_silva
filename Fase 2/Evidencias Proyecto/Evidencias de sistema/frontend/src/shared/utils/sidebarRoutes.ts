import { sections } from "@/data/sections";

export const sidebarRoutes = sections.flatMap((section) =>
  section.buttons.map((btn) => btn.href),
);
