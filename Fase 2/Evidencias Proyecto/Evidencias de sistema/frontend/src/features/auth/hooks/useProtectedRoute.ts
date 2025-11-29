// hooks/useProtectedRoute.ts
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addToast } from "@heroui/toast";

import { useSession } from "@/hooks/useSession";
import { usePermissions } from "@/hooks/usePermissions";

type Permiso = string | string[];

export function useProtectedRoute(permiso?: Permiso) {
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, isLoading: sessionLoading } = useSession();
  const { hasAccess, loading: permissionsLoading } = usePermissions();

  const [isTransitioning, setIsTransitioning] = useState(false);
  const redirectTimer = useRef<number | null>(null);
  const actedRef = useRef(false); // evita múltiples redirecciones/toasts

  const isLoading = sessionLoading || permissionsLoading;

  const accessDenied = useMemo(() => {
    if (!permiso || permissionsLoading) return false;
    const check = (p: string) =>
      typeof hasAccess === "function" ? hasAccess(p) : false;

    return Array.isArray(permiso) ? !permiso.some(check) : !check(permiso);
  }, [permiso, hasAccess, permissionsLoading]);

  // para el contenedor: puede renderizar si no estamos cargando y el acceso es válido
  const canRender = !isLoading && isAuthenticated === true && !accessDenied;

  useEffect(() => {
    if (isLoading || actedRef.current) return;

    const doRedirect = (path: string) => {
      actedRef.current = true;
      setIsTransitioning(true);
      // 400ms si usas animación/skeleton; ajusta o pon 0 si no quieres delay
      redirectTimer.current = window.setTimeout(() => {
        navigate(path, { replace: true });
        setIsTransitioning(false);
      }, 400);
    };

    // No autenticado → al login con redirect a la ruta original
    if (isAuthenticated === false) {
      const current = `${location.pathname}${location.search}`;

      doRedirect(`/login?redirect=${encodeURIComponent(current)}`);

      return;
    }

    // Autenticado pero sin permiso → toast y al home (o a una 403 si la tienes)
    if (isAuthenticated === true && accessDenied) {
      addToast({
        title: "Acceso denegado",
        description: "No tienes permiso para acceder a esta sección.",
        color: "danger",
        timeout: 3000,
      });
      doRedirect("/");

      return;
    }

    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
        redirectTimer.current = null;
      }
    };
  }, [isLoading, isAuthenticated, accessDenied, navigate, location]);

  return { isLoading, isTransitioning, canRender };
}
