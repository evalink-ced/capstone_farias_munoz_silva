// components/Spinner/FullPageSpinner.tsx
import { Spinner } from "@heroui/spinner";

export const FullPageSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-black/60 z-50">
    <div className="flex flex-col items-center gap-3">
      <Spinner color="primary" size="lg" />
      <p className="text-sm text-gray-500 dark:text-gray-300 animate-pulse">
        Cargando contenido...
      </p>
    </div>
  </div>
);
