import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuthentication } from "@/services/google/auth";
import LoadingOverlay from "@/shared/components/ui/Loaders/LoadingOverlay";

interface Props {
  children: ReactNode;
}

function ProtectedRoute({ children }: Props) {
  const { isAuthorized } = useAuthentication();

  if (isAuthorized === null) {
    return <LoadingOverlay isLoading />;
  }

  if (isAuthorized && window.location.pathname === "/login") {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
