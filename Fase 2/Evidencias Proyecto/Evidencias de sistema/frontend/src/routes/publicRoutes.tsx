import { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";

import RedirectGoogleAuth from "@/features/auth/components/GoogleRedirectHandler";
import Welcome from "@/shared/pages/Welcome";
import { useSession } from "@/hooks/useSession";
const ProtectedLogin = () => {
  const { isAuthenticated } = useSession();

  return isAuthenticated ? <Navigate to="/" /> : <Welcome />;
};

export const publicRoutes: RouteObject[] = [
  {
    path: "/login/api/callback",
    element: <RedirectGoogleAuth />,
  },
  {
    path: "/login",
    element: <ProtectedLogin />,
  },
];
