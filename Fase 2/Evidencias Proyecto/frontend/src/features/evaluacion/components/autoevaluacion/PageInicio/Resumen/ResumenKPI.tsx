// features/evaluacion/jefatura/components/ResumenKPI.tsx
import { memo } from "react";

export const ResumenKPI = memo(function ResumenKPI({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/80 p-5 text-center shadow-sm backdrop-blur-md">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-3xl font-bold text-gray-900">{value}</div>
      {hint && <div className="mt-1 text-xs text-gray-500">{hint}</div>}
    </div>
  );
});
