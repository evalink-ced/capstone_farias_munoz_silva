// shared/hooks/useSmartBack.ts
import { useLocation, useNavigate } from "react-router-dom";

function parentOf(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length > 1) return "/" + parts.slice(0, -1).join("/");

  return "/";
}

/**
 * Back moderno y zero-config:
 * 1) Si hay historial real => navigate(-1)
 * 2) Si no, sube un nivel con replace (no agrega al stack)
 * 3) Si no, va a "/"
 */
export function useSmartBack() {
  const navigate = useNavigate();
  const location = useLocation();

  const canGoBack =
    typeof window !== "undefined" &&
    window.history?.state &&
    typeof window.history.state.idx === "number" &&
    window.history.state.idx > 0;

  const goBack = () => {
    if (canGoBack) {
      navigate(-1);

      return;
    }
    const parent = parentOf(location.pathname);

    if (parent !== location.pathname) {
      // IMPORTANTE: replace para no “apilar” el padre y evitar rebotes
      navigate(parent, { replace: true });

      return;
    }
    // Fallback final (también con replace)
    navigate("/", { replace: true });
  };

  return { goBack };
}
