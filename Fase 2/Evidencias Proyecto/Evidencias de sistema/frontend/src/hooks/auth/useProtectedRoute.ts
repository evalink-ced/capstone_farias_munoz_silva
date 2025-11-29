// hooks/useProtectedRoute.ts
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addToast } from "@heroui/toast";

import { useSession } from "@/hooks/useSession";
import { usePermissions } from "@/hooks/usePermissions";

type Permiso = string | string[];

export function useProtectedRoute(permiso?: Permiso) {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: sessionLoading } = useSession();
  const { hasAccess, loading: permissionsLoading } = usePermissions();

  const [isTransitioning, setIsTransitioning] = useState(false);

  const isLoading = sessionLoading || permissionsLoading;

  const accessDenied =
    permiso && !permissionsLoading && !hasSomePermission(permiso, hasAccess);

  function hasSomePermission(
    permiso: Permiso,
    checker: (p: string) => boolean,
  ) {
    if (Array.isArray(permiso)) {
      return permiso.some(checker);
    }

    return checker(permiso);
  }

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated === false) {
      redirect("/login");
    } else if (isAuthenticated && accessDenied) {
      addToast({
        title: "Acceso denegado",
        description: "No tienes permiso para acceder a esta sección.",
        color: "danger",
        timeout: 3000,
      });
      redirect("/");
    }

    function redirect(path: string) {
      setIsTransitioning(true);
      setTimeout(() => {
        navigate(path, { replace: true });
        setIsTransitioning(false);
      }, 400);
    }
  }, [isLoading, isAuthenticated, accessDenied, navigate]);

  return { isLoading, isTransitioning };
}
