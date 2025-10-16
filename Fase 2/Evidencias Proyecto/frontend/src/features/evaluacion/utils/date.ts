// features/evaluacion/autoevaluacion/utils/date.ts
const MONTH_FMT_ES_CL = new Intl.DateTimeFormat("es-CL", {
  year: "numeric",
  month: "long",
});

export function safeMonthToLabel(fechaEvaluacion: string, fmt = MONTH_FMT_ES_CL): string {
  const d = new Date(`${fechaEvaluacion}-01T00:00:00`);
  return isNaN(d.getTime()) ? "—" : fmt.format(d);
}
