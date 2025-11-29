import { useEffect } from "react";

export function useApplyTheme(theme: any) {
  useEffect(() => {
    if (!theme) return;

    const root = document.documentElement;

    // ✅ Aplica variables CSS
    Object.entries(theme).forEach(([key, value]) => {
      if (typeof value === "string") {
        root.style.setProperty(`--${key.replace(/_/g, "-")}`, value);
      }
    });

    // ✅ Aplica clase 'dark' si el tema lo indica
    if (theme.modo_oscuro) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);
}
