import { lazy, Suspense } from "react";
import { Spinner } from "@heroui/spinner";

// Lazy load del formulario
const FormularioEditarAsignacionEvaluacion = lazy(() =>
  import("@/features/evaluacion/components/Asignar").then((module) => ({
    default: module.FormularioEditarAsignacionEvaluacion,
  })),
);

export default function EditarAsignacionPage() {
  return (
    <>
      <section className="min-h-screen py-10 px-4 flex items-center justify-center">
        <div className="w-full max-w-6xl">
          <Suspense
            fallback={
              <div className="flex justify-center py-20">
                <Spinner size="lg" />
              </div>
            }
          >
            <FormularioEditarAsignacionEvaluacion />
          </Suspense>
        </div>
      </section>
    </>
  );
}
