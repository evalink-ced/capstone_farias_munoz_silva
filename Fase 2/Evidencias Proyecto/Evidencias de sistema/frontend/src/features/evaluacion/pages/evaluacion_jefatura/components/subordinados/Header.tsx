import { Button } from "@heroui/button";
import {
  ClipboardDocumentListIcon,
  HomeIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

export default function Header({
  isDetailView,
  periodoActual,
  onVolverAResumen,
  onVolverAInicio,
}: {
  isDetailView: boolean;
  periodoActual: { año: number; mes: string; tipoEvaluacion: string } | null;
  onVolverAResumen: () => void;
  onVolverAInicio: () => void;
}) {
  return (
    <div className="mb-8">
      {isDetailView && (
        <div className="flex items-center gap-2 mb-6">
          <Button
            className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
            size="sm"
            startContent={<HomeIcon className="w-4 h-4" />}
            variant="light"
            onPress={onVolverAInicio}
          >
            Inicio
          </Button>
          <span className="text-slate-400">/</span>
          <Button
            className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
            size="sm"
            startContent={<ArrowLeftIcon className="w-4 h-4" />}
            variant="light"
            onPress={onVolverAResumen}
          >
            Autoevaluaciones
          </Button>
        </div>
      )}
      <div className="flex items-start gap-6">
        <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl">
          <ClipboardDocumentListIcon className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            {isDetailView && periodoActual
              ? `${periodoActual.tipoEvaluacion}`
              : "Autoevaluaciones del Equipo"}
          </h1>
          {isDetailView && periodoActual ? (
            <div className="space-y-1">
              <p className="text-lg text-slate-600 dark:text-slate-400 capitalize">
                {periodoActual.mes} {periodoActual.año}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Revisa las autoevaluaciones de tu equipo para este período
              </p>
            </div>
          ) : (
            <p className="text-slate-600 dark:text-slate-400">
              Gestiona y revisa las autoevaluaciones organizadas por períodos
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
