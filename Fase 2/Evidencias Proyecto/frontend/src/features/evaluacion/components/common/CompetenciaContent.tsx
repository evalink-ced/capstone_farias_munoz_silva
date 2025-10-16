import { Card, CardBody, CardHeader } from "@heroui/card";
import { Progress } from "@heroui/progress";
import { Chip } from "@heroui/chip";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { JSX } from "react";

import { Competencia } from "@/features/evaluacion/types/evaluacion";
import IndicadorItem from "@/features/evaluacion/components/common/IndicadorItem";

interface RadioNivelProps {
    radioKey: string;
    value: string;
    nombre: string;
    descripcion: string;
    puntaje: number;
}

interface CompetenciaContentProps {
    competencia: Competencia;
    obtenerPuntaje: (indicadorId: number) => number;
    manejarCambioPuntaje: (indicadorId: number, puntaje: number) => void;
    estaRespondido: (indicadorId: number) => boolean;
    renderRadioNivel: (props: RadioNivelProps) => JSX.Element;
}

export default function CompetenciaContent({
    competencia,
    obtenerPuntaje,
    manejarCambioPuntaje,
    estaRespondido,
    renderRadioNivel,
}: CompetenciaContentProps) {
    // Calcular progreso de la competencia
    const totalIndicadores = competencia.indicadores.length;
    const indicadoresRespondidos = competencia.indicadores.filter(ind =>
        estaRespondido(ind.id)
    ).length;
    const progreso = (indicadoresRespondidos / totalIndicadores) * 100;

    return (
        <div className="space-y-6">
            {/* Header de la competencia */}
            <Card className="bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between w-full">
                        <div>
                            <h1 className="text-xl font-semibold text-primary-800">
                                {competencia.name}
                            </h1>
                            {competencia.indicadores && (
                                <p className="text-sm text-primary-600 mt-1">
                                    {competencia.name}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <Chip
                                size="sm"
                                variant="flat"
                                color={progreso === 100 ? "success" : "warning"}
                                startContent={progreso === 100 ? <CheckCircleIcon className="w-4 h-4" /> : undefined}
                            >
                                {indicadoresRespondidos}/{totalIndicadores}
                            </Chip>
                        </div>
                    </div>
                </CardHeader>
                <CardBody className="pt-0">
                    <Progress
                        value={progreso}
                        color={progreso === 100 ? "success" : "warning"}
                        size="sm"
                        className="w-full"
                    />
                </CardBody>
            </Card>

            {/* Lista de indicadores */}
            <div className="grid gap-4">
                {competencia.indicadores.map((indicador) => (
                    <Card
                        key={indicador.id}
                        className={`transition-all duration-200 hover:shadow-md ${estaRespondido(indicador.id)
                                ? 'border-success-200 bg-success-50/50'
                                : 'border-warning-200 bg-warning-50/30'
                            }`}
                    >
                        <CardBody className="p-0">
                            <IndicadorItem
                                indicador={indicador}
                                estaRespondido={estaRespondido}
                                manejarCambioPuntaje={manejarCambioPuntaje}
                                obtenerPuntaje={obtenerPuntaje}
                                renderRadioNivel={renderRadioNivel}
                            />
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    );
}