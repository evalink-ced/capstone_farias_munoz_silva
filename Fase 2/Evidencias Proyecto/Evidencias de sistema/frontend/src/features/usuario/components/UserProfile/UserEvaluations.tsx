import React from "react";
import {
  Eye,
  FileText,
  TrendingUp,
  Calendar,
  ExternalLink,
  ChartBar,
} from "lucide-react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";

import { Evaluation } from "@/types/types";

interface Props {
  evaluaciones: Evaluation[];
}

const UserEvaluations: React.FC<Props> = ({ evaluaciones }) => {
  if (!evaluaciones || evaluaciones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="bg-default-100 dark:bg-default-50/20 rounded-full p-6 mb-4">
          <ChartBar className="w-8 h-8 text-default-400" />
        </div>
        <h3 className="text-lg font-medium text-default-700 dark:text-default-300 mb-2">
          Sin evaluaciones registradas
        </h3>
        <p className="text-sm text-default-500 text-center max-w-md">
          No hay evaluaciones disponibles para este usuario en este momento.
        </p>
      </div>
    );
  }

  // Calcular estadísticas
  const promedioGeneral =
    evaluaciones.reduce((acc, eva) => acc + Number(eva.porcentaje), 0) /
    evaluaciones.length;
  const mejorEvaluacion = Math.max(
    ...evaluaciones.map((eva) => Number(eva.porcentaje)),
  );
  const evaluacionesOrdenadas = [...evaluaciones].sort(
    (a, b) => Number(b.anio) - Number(a.anio),
  );

  // Función para obtener color basado en porcentaje
  const getScoreColor = (porcentaje: number) => {
    if (porcentaje >= 90) return "success";
    if (porcentaje >= 80) return "primary";
    if (porcentaje >= 70) return "warning";

    return "danger";
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-2">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-default-900 dark:text-default-100">
              Evaluaciones de Desempeño
            </h2>
            <p className="text-sm text-default-500 dark:text-default-400">
              {evaluaciones.length} evaluación
              {evaluaciones.length !== 1 ? "es" : ""} registrada
              {evaluaciones.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 border border-primary/20 dark:border-primary/30">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-600 dark:text-default-400 mb-1">
                    Promedio General
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {promedioGeneral.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-r from-success/10 to-success/5 dark:from-success/20 dark:to-success/10 border border-success/20 dark:border-success/30">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-600 dark:text-default-400 mb-1">
                    Mejor Evaluación
                  </p>
                  <p className="text-2xl font-bold text-success">
                    {mejorEvaluacion}%
                  </p>
                </div>
                <div className="bg-success/10 dark:bg-success/20 rounded-lg p-2">
                  <ChartBar className="w-5 h-5 text-success" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Lista de evaluaciones */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-default-800 dark:text-default-200 mb-4">
          Historial de Evaluaciones
        </h3>

        <div className="space-y-3">
          {evaluacionesOrdenadas.map((eva, index) => {
            const porcentaje = Number(eva.porcentaje);
            const scoreColor = getScoreColor(porcentaje);
            const isLatest = index === 0;

            return (
              <Card
                key={eva.id}
                className={`
                  bg-default-50/50 dark:bg-default-100/5 
                  border border-default-200/60 dark:border-default-100/10 
                  hover:bg-default-100/60 dark:hover:bg-default-100/10 
                  hover:border-${scoreColor}/30 dark:hover:border-${scoreColor}/40
                  transition-all duration-300 hover:shadow-md dark:hover:shadow-default-500/10
                  ${isLatest ? "ring-2 ring-primary/20 dark:ring-primary/30" : ""}
                `}
                radius="lg"
                shadow="none"
              >
                <CardBody className="p-5">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                    {/* Icono y contenido principal */}
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className={`bg-${scoreColor}/10 dark:bg-${scoreColor}/20 rounded-lg p-3 flex-shrink-0`}
                      >
                        <FileText className={`w-5 h-5 text-${scoreColor}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-default-900 dark:text-default-100">
                            Evaluación {eva.anio}
                          </h4>
                          {isLatest && (
                            <Chip
                              className="bg-primary/10 dark:bg-primary/20 text-primary font-medium"
                              color="primary"
                              size="sm"
                              variant="flat"
                            >
                              Más reciente
                            </Chip>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="w-4 h-4 text-default-400" />
                          <span className="text-sm text-default-600 dark:text-default-400">
                            Año {eva.anio}
                          </span>
                        </div>

                        {/* Progreso visual */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-default-600 dark:text-default-400">
                              Puntuación obtenida
                            </span>
                            <span
                              className={`font-bold text-${scoreColor} text-lg`}
                            >
                              {porcentaje.toLocaleString("es-CL", {
                                maximumFractionDigits: 0,
                              })}
                              %
                            </span>
                          </div>
                          <Progress
                            className="max-w-full"
                            color={scoreColor}
                            size="sm"
                            value={porcentaje}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Botón de acción */}
                    {eva.drive_url && (
                      <div className="w-full lg:w-auto">
                        <Button
                          as="a"
                          className="w-full lg:w-auto bg-default-100/60 dark:bg-default-100/10 hover:bg-default-200/80 dark:hover:bg-default-100/20"
                          color={scoreColor}
                          endContent={<ExternalLink className="w-3 h-3" />}
                          href={eva.drive_url}
                          radius="lg"
                          rel="noopener noreferrer"
                          size="md"
                          startContent={<Eye className="w-4 h-4" />}
                          target="_blank"
                          variant="flat"
                        >
                          Ver drive
                        </Button>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserEvaluations;
