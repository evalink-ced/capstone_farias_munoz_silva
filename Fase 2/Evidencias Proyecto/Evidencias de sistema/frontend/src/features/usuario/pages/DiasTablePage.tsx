import React, { Suspense } from "react";
import { Spinner } from "@heroui/spinner";

// Lazy load del componente de perfil
const UsuariosDiasTable = React.lazy(
  () => import("@/features/usuario/components/usuario"),
);

export default function DiasTablePage() {
  return (
    <>
      <section className="w-full flex justify-center items-center py-6 px-4">
        <div className="w-full max-w-5xl">
          <Suspense fallback={<Spinner label="Cargando perfil..." />}>
            <UsuariosDiasTable />
          </Suspense>
        </div>
      </section>
    </>
  );
}
