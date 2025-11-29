// pages/auth/GoogleRedirectHandler.tsx
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  setTokens,
  clearTokens,
  getTokens,
} from "@/features/auth/services/tokenService";
import { fetchUsuarioActual } from "@/api/user/user";

function parseParams() {
  // Soporta ?query y #hash
  const searchParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const hashParams = new URLSearchParams(hash);

  const get = (k: string) => searchParams.get(k) || hashParams.get(k);
  const hasAnyParam =
    Array.from(searchParams.keys()).length > 0 ||
    Array.from(hashParams.keys()).length > 0;

  return {
    hasAnyParam,
    error: get("error") || get("error_description"),
    access: get("access_token") || undefined,
    refresh: get("refresh_token") || undefined,
    gtoken: get("google_token") || undefined,
  };
}

const GoogleRedirectHandler = () => {
  const navigate = useNavigate();
  const processedRef = useRef(false); // evita doble ejecución en StrictMode

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    (async () => {
      const { hasAnyParam, error, access, refresh, gtoken } = parseParams();

      // Si entraste acá sin params (recarga/visita directa), manda al home si ya tienes tokens
      if (!hasAnyParam) {
        const { access: a, refresh: r } = getTokens();

        if (a && r) {
          navigate("/", { replace: true });

          return;
        }
        // sin tokens -> al login
        navigate("/login", { replace: true });

        return;
      }

      if (error) {
        clearTokens();
        // limpia la URL para evitar re-procesos si el usuario recarga
        history.replaceState(
          {},
          "",
          "/login?error=" + encodeURIComponent(error),
        );

        return;
      }

      if (!access || !refresh) {
        clearTokens();
        history.replaceState({}, "", "/login?error=NoTokens");

        return;
      }

      try {
        setTokens({ access, refresh, google: gtoken });

        // (opcional) obtenemos el usuario; si falla, igual seguimos
        try {
          const user = await fetchUsuarioActual();

          if (user) localStorage.setItem("user", JSON.stringify(user));
        } catch {
          // no interrumpir el flujo por esto
        }

        // Limpia por completo query/hash del callback y deja en raíz
        history.replaceState({}, "", "/");
        // Si prefieres usar navigate en vez de replaceState:
        // navigate("/", { replace: true });
      } catch {
        clearTokens();
        history.replaceState({}, "", "/login?error=InvalidToken");
      }
    })();
  }, [navigate]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#f5f5f5",
      }}
    >
      <div
        style={{
          padding: 20,
          borderRadius: 8,
          background: "#fff",
          boxShadow: "0 2px 10px rgba(0,0,0,.1)",
        }}
      >
        Procesando autenticación...
      </div>
    </div>
  );
};

export default GoogleRedirectHandler;
