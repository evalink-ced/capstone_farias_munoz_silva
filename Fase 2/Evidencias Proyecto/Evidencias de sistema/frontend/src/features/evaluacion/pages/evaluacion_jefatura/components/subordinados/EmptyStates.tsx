import {
  ClipboardDocumentListIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

export function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
        <ClipboardDocumentListIcon className="w-12 h-12 text-slate-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-3">
        No hay autoevaluaciones disponibles
      </h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
        Aún no se han creado autoevaluaciones para tu equipo. Las evaluaciones
        aparecerán aquí una vez que sean asignadas.
      </p>
    </div>
  );
}

export function EmptyStateDetail() {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
        <UserIcon className="w-12 h-12 text-slate-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-3">
        No hay personas en este período
      </h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
        No se encontraron autoevaluaciones para este período específico.
        Verifica que las evaluaciones hayan sido asignadas correctamente.
      </p>
    </div>
  );
}
