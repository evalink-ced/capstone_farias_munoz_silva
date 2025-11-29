// features/evaluacion/autoevaluacion/components/EvaluacionGrid.tsx
import type { Evaluacion } from "@/features/evaluacion/types/evaluacion";

import { memo } from "react";

import EmptyState from "./EmptyState";
import EvaluacionCard from "./EvaluacionCard";

type Props = {
  items: Evaluacion[];
  finalizada: boolean;
  onOpen: (id: number | string, finalizada: boolean) => void; // 👈 relaja el tipo
};

const EvaluacionGrid = memo(function EvaluacionGrid({
  items,
  finalizada,
  onOpen,
}: Props) {
  if (!items.length) {
    return (
      <EmptyState>
        {finalizada
          ? "✨ Aún no tienes autoevaluaciones finalizadas."
          : "💤 No hay autoevaluaciones pendientes."}
      </EmptyState>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((ev, i) => {
        // 👇 normaliza el id: si viene "5/1" toma "5"
        const idNorm = String(ev.id).split("/")[0];

        return (
          <div
            key={`${ev.id}-${i}`}
            className="animate-fadeInUp"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <EvaluacionCard
              finalizada={finalizada}
              item={ev}
              onOpen={() => onOpen(idNorm, finalizada)} // 👈 pasa el id limpio
            />
          </div>
        );
      })}
    </div>
  );
});

export default EvaluacionGrid;
