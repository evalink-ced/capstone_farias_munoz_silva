// src/pages/IndexPage.tsx
import React, { Suspense } from "react";
import { Spinner } from "@heroui/spinner";

const DashboardPage = React.lazy(() => import("@/shared/pages/DashboardPage"));

export default function IndexPage() {
  return (
    <>
      <Suspense fallback={<Spinner label="Cargando inicio..." />}>
        <DashboardPage />
      </Suspense>
    </>
  );
}
