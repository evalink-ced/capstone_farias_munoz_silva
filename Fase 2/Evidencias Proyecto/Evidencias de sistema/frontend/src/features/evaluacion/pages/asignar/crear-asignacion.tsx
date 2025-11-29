import { lazy, Suspense } from "react";
import { Spinner } from "@heroui/spinner";

const FormularioAsignacionEvaluacion = lazy(() =>
  import("@/features/evaluacion/components/Asignar/Crear").then((module) => ({
    default: module.FormularioAsignacionEvaluacion,
  })),
);

export default function CrearAsignacionPage() {
  return (
    <>
      <section className="min-h-screen py-10 px-4 flex items-center justify-center">
        <div className="w-full max-w-6xl">
          <Suspense fallback={<Spinner size="lg" />}>
            <FormularioAsignacionEvaluacion />
          </Suspense>
        </div>
      </section>
    </>
  );
}
