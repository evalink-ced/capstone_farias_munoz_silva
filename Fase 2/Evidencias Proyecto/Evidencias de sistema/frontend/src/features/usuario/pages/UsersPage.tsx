import React, { Suspense } from "react";
import { Spinner } from "@heroui/spinner";
import { useNavigate } from "react-router-dom";

// Lazy load de la tabla de usuarios
const UsersTable = React.lazy(
  () => import("@/features/usuario/components/UsersTable/Table"),
);

export default function UsersPage() {
  const navigate = useNavigate();

  return (
    <>
      <section className="flex flex-col items-center justify-center gap-3 py-5 md:py-1">
        <div className="inline-block text-center justify-center">
          <Suspense
            fallback={<Spinner label="Cargando tabla de usuarios..." />}
          >
            <UsersTable
              buttonText="VER PERFIL"
              onButtonClick={(userId: number) => {
                navigate(`/ficha/usuario`, { state: { userId } });
              }}
            />
          </Suspense>
        </div>
      </section>
    </>
  );
}
