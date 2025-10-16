// features/evaluacion/components/CriteriosEvaluacion.tsx
import { Card, CardBody, CardHeader } from "@heroui/card";

type Criterio = {
  title: string;
  description: string;
  icon?: string | React.ReactNode; // emoji o nodo React
};

interface Props {
  title?: string;
  subtitle?: string;
  criterios: Criterio[];
}

export default function CriteriosEvaluacion({
  title = "Criterios de Evaluación",
  subtitle = "Aspectos que se comparan en la evaluación mixta",
  criterios,
}: Props) {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-2M9 11V9a2 2 0 1 1 4 0v2M9 11h6" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
            <p className="text-sm text-slate-600">{subtitle}</p>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {criterios.map((c, i) => (
            <div
              key={i}
              className="p-4 bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md"
            >
              <div className="text-2xl mb-3">{c.icon ?? "📌"}</div>
              <h3 className="font-semibold text-slate-800 mb-2">{c.title}</h3>
              <p className="text-sm text-slate-600">{c.description}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
