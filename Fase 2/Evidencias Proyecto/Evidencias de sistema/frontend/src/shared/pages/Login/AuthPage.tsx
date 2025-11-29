import React, { Suspense } from "react";
import { Spinner } from "@heroui/spinner";

// Lazy load del formulario de autenticación
const AuthForm = React.lazy(
  () => import("@/features/auth/components/AuthForm"),
);

const AuthPage: React.FC = () => {
  return (
    <>
      <div className="flex justify-center py-10">
        <Suspense fallback={<Spinner label="Cargando login..." />}>
          <AuthForm method="login" route="/api/token/" />
        </Suspense>
      </div>
    </>
  );
};

export default AuthPage;
