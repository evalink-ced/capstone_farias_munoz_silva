import { useEffect, useState } from "react";

import api from "@/services/google/axiosInstance";

export function useTheme(themeId: number | null) {
  const [theme, setTheme] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!themeId) {
      setTheme(null); // ✅ Resetear theme

      return;
    }

    setLoading(true);
    api
      .get(`/theme/api/temas/${themeId}/`)
      .then((res) => setTheme(res.data))
      .catch((err) => {
        console.error("Error al cargar el theme:", err);
        setTheme(null);
      })
      .finally(() => setLoading(false));
  }, [themeId]);

  return { theme, loading };
}
