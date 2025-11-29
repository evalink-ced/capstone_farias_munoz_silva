import React, { Suspense } from "react";
import { Spinner } from "@heroui/spinner";

// Lazy load del componente de perfil
const UserProfile = React.lazy(
  () => import("@/features/usuario/components/profile/UserProfile"),
);

export default function UserProfileView() {
  return (
    <>
      <section className="w-full flex justify-center items-center py-6 px-4">
        <div className="w-full max-w-5xl">
          <Suspense
            fallback={<Spinner label="Cargando perfil del usuario..." />}
          >
            <UserProfile />
          </Suspense>
        </div>
      </section>
    </>
  );
}
