
import { JSX } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Progress } from "@heroui/progress";
import { Chip } from "@heroui/chip";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline";

import { Respuesta } from "@/features/evaluacion/types/asignar/evaluacion";
import {
  AreaEvaluacion,
  TipoEvaluacion,
} from "@/features/evaluacion/types/evaluacion";
import ProgressIndicator from "@/features/evaluacion/components/common/ProgressIndicator";
import FinalComments from "@/features/evaluacion/components/common/FinalComments";
import { useEvaluacionBloqueBase } from "@/features/evaluacion/components/common/hooks/useEvaluacionBloqueBase";
import { CompetenciaCompacta } from "@/features/evaluacion/components/common";

interface RadioNivelProps {
  radioKey: string;
  value: string;
  nombre: string;
  descripcion: string;
  puntaje: number;
}

interface EvaluacionBloqueBaseProps {
  area: AreaEvaluacion;
  estructura: TipoEvaluacion;
  respuestas: Respuesta[];
  actualizarPuntaje: (indicadorId: number, puntaje: number) => void;
  evaluacionId: number;
  tipoEvaluacion: "autoevaluacion" | "evaluacion";
  renderRadioNivel: (props: RadioNivelProps) => JSX.Element;
  redirectPath: string;
  // ✅ AGREGAR PROP PARA ESTADO DE GUARDANDO
  guardando?: boolean;
}

export default function EvaluacionBloqueBase({
  area,
  estructura,
  respuestas,
  actualizarPuntaje,
  evaluacionId,
  tipoEvaluacion,
  renderRadioNivel,
  redirectPath,
  guardando = false,
}: EvaluacionBloqueBaseProps) {
  const {
    mostrarTextarea,
    textMejorar,
    textDestacar,
    setTextMejorar,
    setTextDestacar,
    obtenerPuntaje,
    manejarCambioPuntaje,
    estaRespondido,
    handleFinalizar,
    progresoGlobal,
    respuestasRespondidasGlobal,
    totalIndicadoresGlobal,
    progresoArea,
    // ✅ OBTENER ESTADO DE LOADING DEL HOOK
    isLoading,
  } = useEvaluacionBloqueBase({
    area,
    estructura,
    respuestas,
    actualizarPuntaje,
    evaluacionId,
    tipoEvaluacion,
    redirectPath,
  });

  // Calcular progreso por competencia
  const getCompetenciaProgress = (competencia: any) => {
    const totalIndicadores = competencia.indicadores.length;
    const respondidos = competencia.indicadores.filter((ind: any) =>
      estaRespondido(ind.id)
    ).length;
    const porcentaje = totalIndicadores > 0 ? (respondidos / totalIndicadores) * 100 : 0;
    return { respondidos, total: totalIndicadores, porcentaje };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/50 rounded-xl">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header mejorado */}
        <div className="text-center space-y-4 py-6">
          <div className="inline-flex items-center gap-3 bg-default rounded-full px-6 py-3 shadow-sm border border-default-200">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <h1 className="text-2xl font-semibold text-default-900">{area.n_area}</h1>
          </div>
          <div className="max-w-md mx-auto">
            <ProgressIndicator area={area} progresoArea={progresoArea} guardando={guardando} />
          </div>
        </div>

        {/* Competencias en layout mejorado */}
        <div className="space-y-8">
          {area.competencias.map((competencia, index) => {
            const progress = getCompetenciaProgress(competencia);
            const isCompleted = progress.respondidos === progress.total;

            return (
              <Card key={competencia.id} className="shadow-lg border-0 overflow-hidden relative">
                {/* Header sticky que se mantiene visible */}
                <div className="sticky top-0 z-10">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 shadow-lg">
                    <div className="w-full space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm text-white rounded-xl flex items-center justify-center font-bold text-lg border border-white/30">
                            {index + 1}
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold">
                              {competencia.name}
                            </h2>
                          </div>
                        </div>
                        <Chip
                          size="lg"
                          variant="flat"
                          color={isCompleted ? "success" : "warning"}
                          className="bg-white/20 backdrop-blur-sm text-white font-semibold"
                          startContent={
                            isCompleted ?
                              <CheckCircleIcon className="w-4 h-4" /> :
                              <ClockIcon className="w-4 h-4" />
                          }
                        >
                          {progress.respondidos}/{progress.total}
                        </Chip>
                      </div>
                      <div className="bg-white/20 rounded-full p-1">
                        <Progress
                          value={progress.porcentaje}
                          color={isCompleted ? "success" : "warning"}
                          size="sm"
                          className="w-full"
                          classNames={{
                            track: "bg-white/30",
                            indicator: isCompleted ? "bg-green-400" : "bg-yellow-400"
                          }}
                        />
                      </div>
                    </div>
                  </CardHeader>
                </div>

                {/* Contenido de la competencia */}
                <CardBody className="p-0 max-h-[70vh] overflow-y-auto">
                  <CompetenciaCompacta
                    competencia={competencia}
                    obtenerPuntaje={obtenerPuntaje}
                    manejarCambioPuntaje={manejarCambioPuntaje}
                    estaRespondido={estaRespondido}
                    renderRadioNivel={renderRadioNivel}
                  />
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* Comentarios finales mejorados */}
        <Card className="shadow-lg border-0 bg-default-100">
          <CardHeader className="bg-black text-white py-4">
            <h3 className="text-xl font-semibold">Comentarios Finales</h3>
          </CardHeader>
          <CardBody className="p-6">
            <FinalComments
              handleFinalizar={handleFinalizar}
              mostrarTextarea={mostrarTextarea}
              progresoGlobal={progresoGlobal}
              respuestasRespondidasGlobal={respuestasRespondidasGlobal}
              setTextDestacar={setTextDestacar}
              setTextMejorar={setTextMejorar}
              textDestacar={textDestacar}
              textMejorar={textMejorar}
              tipoEvaluacion={tipoEvaluacion}
              totalIndicadoresGlobal={totalIndicadoresGlobal}
              // ✅ PASAR AMBOS ESTADOS DE LOADING
              isLoading={isLoading}
              guardando={guardando}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
