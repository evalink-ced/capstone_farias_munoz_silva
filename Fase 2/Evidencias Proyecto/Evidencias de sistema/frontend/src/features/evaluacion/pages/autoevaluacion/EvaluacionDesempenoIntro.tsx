import React from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { useNavigate } from "react-router-dom";
import {
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
  ChartBarIcon,
  CheckBadgeIcon,
  EyeIcon,
  ScaleIcon,
  ArrowRightIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

export default function EvaluacionDesempenoIntro() {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      {/* 1. HEADER SIMPLE Y DIRECTO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Evaluación de Desempeño
          </h1>
        </div>
        <Chip
          color="primary"
          size="lg"
          startContent={<CheckBadgeIcon className="w-5 h-5 mx-1" />}
          variant="flat"
        >
          Proceso Activo
        </Chip>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. TARJETA PRINCIPAL DE ACCIÓN (Hero) - Ocupa 2 columnas */}
        <Card className="lg:col-span-2 shadow-sm border border-blue-100 dark:border-blue-900 bg-gradient-to-r from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
          <CardHeader className="px-8 pt-8 pb-0 flex flex-col items-start">
            <div className="p-3 bg-blue-600 rounded-xl mb-4 shadow-lg shadow-blue-200 dark:shadow-none">
              <ClipboardDocumentCheckIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Es momento de evaluar
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-xl leading-relaxed">
              Tu perspectiva es fundamental. Este proceso busca medir logros,
              identificar oportunidades y planificar el desarrollo profesional
              con transparencia.
            </p>
          </CardHeader>
          <CardBody className="px-8 py-8">
            <div className="flex flex-wrap gap-4">
              <Button
                className="font-semibold shadow-lg shadow-blue-500/30"
                color="primary"
                endContent={<ArrowRightIcon className="w-5 h-5" />}
                size="lg"
                onPress={() => navigate("/autoevaluacion/inicio")}
              >
                Comenzar mi Autoevaluación
              </Button>

              <Button
                className="bg-white dark:bg-transparent border-gray-300 font-medium text-gray-700 dark:text-gray-200"
                size="lg"
                startContent={<UserGroupIcon className="w-5 h-5" />}
                variant="bordered"
                onPress={() => navigate("/autoevaluacion/jefatura")}
              >
                Revisar Mis Evaluaciones
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* 3. TARJETA DE CRONOGRAMA / PASOS (Timeline Vertical) */}
        <Card className="lg:col-span-1 shadow-sm border border-gray-200 dark:border-gray-800 h-full">
          <CardHeader className="px-6 pt-6 pb-2">
            <h3 className="font-bold text-gray-700 dark:text-gray-200">
              Etapas del Proceso
            </h3>
          </CardHeader>
          <CardBody className="px-6 py-4">
            <div className="relative border-l-2 border-gray-100 dark:border-gray-700 ml-3 space-y-8 my-2">
              {/* Paso 1 */}
              <div className="ml-6 relative">
                <span className="absolute -left-[41px] top-0 flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full ring-4 ring-white dark:ring-gray-900">
                  <span className="text-blue-600 dark:text-blue-300 font-bold text-xs">
                    01
                  </span>
                </span>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Autoevaluación
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  Evalúa tu desempeño por competencias. Puedes guardar y
                  continuar después.
                </p>
              </div>
              {/* Paso 2 */}
              <div className=" ml-6 relative">
                <span className="absolute -left-[41px] top-0 flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full ring-4 ring-white dark:ring-gray-900 ">
                  <span className="text-purple-600 dark:text-purple-300 font-bold text-xs">
                    02
                  </span>
                </span>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Evaluación de Jefatura
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  Tu supervisor realiza la evaluación objetiva y ambos realizan
                  una reunión de retroalimentación.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 4. CRITERIOS (Grid Informativo limpio) */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
          <ChartBarIcon className="w-6 h-6 text-gray-400" />
          Metodología de Evaluación
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoCard
            color="emerald"
            desc="Ponderados por área y competencia específica."
            icon={<ScaleIcon className="w-6 h-6 text-emerald-600" />}
            title="Indicadores"
          />
          <InfoCard
            color="amber"
            desc="Criterios de logro definidos y consistentes."
            icon={<CheckBadgeIcon className="w-6 h-6 text-amber-600" />}
            title="Escalas Claras"
          />
          <InfoCard
            color="indigo"
            desc="Enfoque en potenciar fortalezas y mejora."
            icon={<ChartBarIcon className="w-6 h-6 text-indigo-600" />}
            title="Feedback"
          />
          <InfoCard
            color="rose"
            desc="Seguimiento en tiempo real del estado."
            icon={<EyeIcon className="w-6 h-6 text-rose-600" />}
            title="Transparencia"
          />
        </div>
      </div>

      {/* 5. FOOTER / AYUDA DISCRETA */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
        <InformationCircleIcon className="w-6 h-6 text-gray-400" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          ¿Tienes dudas sobre el proceso?{" "}
          puedes contactar a Recursos Humanos.
        </p>
      </div>
    </div>
  );
}

// Subcomponente para tarjetas pequeñas de info
function InfoCard({
  icon,
  title,
  desc,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
}) {
  // Nota: Tailwind necesita safelist para clases dinámicas completas,
  // pero aquí usamos una estructura simple para el ejemplo.
  return (
    <Card className="shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
      <CardBody className="p-5">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-${color}-50 dark:bg-${color}-900/20`}
        >
          {icon}
        </div>
        <h4 className="font-bold text-gray-900 dark:text-white text-sm">
          {title}
        </h4>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
      </CardBody>
    </Card>
  );
}
