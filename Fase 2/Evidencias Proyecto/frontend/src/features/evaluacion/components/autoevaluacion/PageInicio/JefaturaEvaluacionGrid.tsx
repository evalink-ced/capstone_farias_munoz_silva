// features/evaluacion/jefatura/components/JefaturaEvaluacionGrid.tsx
import { memo } from "react";
import type { Evaluacion } from "@/features/evaluacion/types/evaluacion";
import EmptyState from "@/features/evaluacion/components/autoevaluacion/PageInicio/EmptyState";
import JefaturaEvaluacionCard from "./JefaturaEvaluacionCard";

type Props = {
  items: Evaluacion[];
  firmado: boolean; // true = finalizadas; false = por firmar
  onOpen: (id: number, firmado: boolean) => void;
  extractTexto?: (ev: Evaluacion) => string | undefined;
};

const JefaturaEvaluacionGrid = memo(function JefaturaEvaluacionGrid({ items, firmado, onOpen, extractTexto }: Props) {
  if (!items.length) {
    return (
      <EmptyState>
        {firmado ? "✅ Aún no hay evaluaciones finalizadas." : "📝 No tienes evaluaciones por firmar."}
      </EmptyState>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((ev, i) => (
        <div key={ev.id} className="animate-fadeInUp" style={{ animationDelay: `${i * 0.08}s` }}>
          <JefaturaEvaluacionCard item={ev} firmado={firmado} onOpen={onOpen} extractTexto={extractTexto} />
        </div>
      ))}
    </div>
  );
});

export default JefaturaEvaluacionGrid;
