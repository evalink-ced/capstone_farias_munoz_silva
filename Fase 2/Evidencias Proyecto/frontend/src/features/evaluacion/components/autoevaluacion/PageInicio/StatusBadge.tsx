    // features/evaluacion/autoevaluacion/components/StatusBadge.tsx
import { memo } from "react";

const StatusBadge = memo(function StatusBadge({ finalizada }: { finalizada: boolean }) {
  const cls = finalizada
    ? "text-emerald-700 bg-gradient-to-r from-emerald-100 to-green-100 border border-emerald-200"
    : "text-amber-700 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200";
  return (
    <span className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold shadow-sm ${cls}`}>
      {finalizada ? "✅ Finalizada" : "⏳ Pendiente"}
    </span>
  );
});

export default StatusBadge;
