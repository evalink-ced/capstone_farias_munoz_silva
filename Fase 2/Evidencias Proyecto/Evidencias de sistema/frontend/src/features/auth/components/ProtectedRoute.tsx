import { ReactNode } from "react";

import { useProtectedRoute } from "@/features/auth/hooks/useProtectedRoute";
import LoadingOverlay from "@/shared/components/ui/Loaders/LoadingOverlay";

type Permiso = string | string[];

interface ProtectedRouteProps {
  children: ReactNode;
  permiso?: Permiso;
  fallback?: ReactNode; // opcional
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  permiso,
  fallback,
}) => {
  const { isLoading, isTransitioning, canRender } = useProtectedRoute(permiso);

  if (isLoading || isTransitioning) {
    return <LoadingOverlay isLoading />;
  }

  if (!canRender) {
    return <>{fallback ?? null}</>; // renderiza fallback o nada si se está redirigiendo
  }

  return <>{children}</>;
};

export default ProtectedRoute;
