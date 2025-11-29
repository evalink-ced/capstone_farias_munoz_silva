import { JSX } from "react";
import { Card, CardBody } from "@heroui/card";
import { Square3Stack3DIcon } from "@heroicons/react/24/outline";

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



  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0D14] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* --- HEADER DEL ÁREA --- */}
        <div className="bg-white dark:bg-default-50 rounded-2xl shadow-sm border border-default-200 p-6 relative overflow-hidden">
           {/* Decoración fondo */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-50/50 via-indigo-50/30 to-transparent dark:from-blue-900/10 dark:to-transparent rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
           
           <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 shadow-sm">
                    <Square3Stack3DIcon className="w-8 h-8" />
                 </div>
                 <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-default-900 leading-tight">
                      {area.n_area}
                    </h1>
                    <p className="text-default-500 text-sm mt-1">
                      Completa las competencias asignadas a esta área.
                    </p>
                 </div>
              </div>

              {/* Indicador Global del Área */}
              <div className="w-full md:w-auto min-w-[280px]">
                 <ProgressIndicator
                    area={area}
                    guardando={guardando}
                    progresoArea={progresoArea}
                 />
              </div>
           </div>
        </div>

        {/* --- LISTA DE COMPETENCIAS --- */}
        <div className="space-y-10">
          {area.competencias.map((competencia) => {
            return (
              <Card
                key={competencia.id}
                className="bg-transparent shadow-none border-none overflow-visible"
              >


                {/* Cuerpo de la Competencia */}
                <CardBody className="p-0 pt-4 overflow-visible">
                  <div className="bg-white dark:bg-default-50 rounded-2xl border border-default-200 shadow-sm overflow-hidden">
                    <CompetenciaCompacta
                      competencia={competencia}
                      estaRespondido={estaRespondido}
                      manejarCambioPuntaje={manejarCambioPuntaje}
                      obtenerPuntaje={obtenerPuntaje}
                      renderRadioNivel={renderRadioNivel}
                    />
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* --- COMENTARIOS FINALES --- */}
        <div className="pt-4">
            <Card className="bg-white dark:bg-default-50 border border-default-200 shadow-sm overflow-visible">
                <CardBody className="p-0">
                    <FinalComments
                        guardando={guardando}
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
                        isLoading={isLoading}
                    />
                </CardBody>
            </Card>
        </div>

      </div>
    </div>
  );
}