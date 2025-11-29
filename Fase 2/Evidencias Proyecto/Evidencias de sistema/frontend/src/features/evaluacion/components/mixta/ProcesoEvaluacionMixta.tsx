// features/evaluacion/components/ProcesoEvaluacionMixta.tsx
import { Card, CardBody, CardHeader } from "@heroui/card";

type Paso = {
  numero: string;
  title: string;
  text: string;
  icon: React.ReactNode;
  bgGradient: string; // e.g. "from-blue-500/20 to-indigo-500/20"
  iconBg: string; // e.g. "from-blue-500 to-indigo-600"
};

interface Props {
  title?: string;
  subtitle?: string;
  pasos: Paso[];
}

export default function ProcesoEvaluacionMixta({
  title = "Proceso de Evaluación Mixta",
  subtitle = "Comprende cómo funciona la comparación de evaluaciones",
  pasos,
}: Props) {
  return (
    <Card className="bg-background/70 backdrop-blur-sm border border-divider shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg
              className="h-4 w-4 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            <p className="text-sm text-default-600 dark:text-default-300">
              {subtitle}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid md:grid-cols-2 gap-6">
          {pasos.map((paso, index) => (
            <div
              key={index}
              className={`relative p-6 rounded-2xl border border-divider bg-background/80 backdrop-blur-sm`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${paso.iconBg} rounded-xl flex items-center justify-center text-white shadow-lg`}
                >
                  {paso.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-default-600 dark:text-default-300 bg-background/60 px-2 py-1 rounded-full border border-divider">
                      {paso.numero}
                    </span>
                    <h3 className="text-lg font-semibold text-foreground">
                      {paso.title}
                    </h3>
                  </div>
                  <p className="text-sm text-default-600 dark:text-default-300 leading-relaxed">
                    {paso.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
