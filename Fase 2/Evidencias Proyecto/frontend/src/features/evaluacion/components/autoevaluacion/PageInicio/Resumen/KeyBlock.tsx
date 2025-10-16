// features/evaluacion/components/autoevaluacion/PageInicio/Resumen/KeyBlock.tsx
import { ReactNode } from "react";

type Tone = "neutral" | "success" | "warning" | "danger";
export function KeyBlock({
  title,
  text,
  tone = "neutral",
  extra,
}: {
  title: string;
  text?: string | null;
  tone?: Tone;
  extra?: ReactNode; // por si quieres chips, contadores, etc.
}) {
  const toneDot =
    tone === "success"
      ? "bg-emerald-500"
      : tone === "warning"
      ? "bg-amber-500"
      : tone === "danger"
      ? "bg-rose-500"
      : "bg-gray-400";

  const ringTone =
    tone === "success"
      ? "ring-emerald-100"
      : tone === "warning"
      ? "ring-amber-100"
      : tone === "danger"
      ? "ring-rose-100"
      : "ring-gray-100";

  return (
    <section
      className={`group relative overflow-hidden rounded-2xl border border-gray-200 bg-white/90 shadow-sm ring-1 ${ringTone}`}
    >
      {/* decor suave */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-gradient-to-br from-gray-50 to-white opacity-60 blur-2xl" />
      <header className="flex items-center justify-between gap-3 px-6 pt-5">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${toneDot}`} />
          <h3 className="text-[15px] font-semibold text-gray-900">{title}</h3>
        </div>
        {extra}
      </header>
      <div className="px-6 pb-6 pt-3">
        {text?.trim() ? (
          <p className="leading-relaxed text-gray-700 whitespace-pre-line">
            {text}
          </p>
        ) : (
          <p className="italic text-gray-400">Sin información</p>
        )}
      </div>
    </section>
  );
}

export default KeyBlock;
