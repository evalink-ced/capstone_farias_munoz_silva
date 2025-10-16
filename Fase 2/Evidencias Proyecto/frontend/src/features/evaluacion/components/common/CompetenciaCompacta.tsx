import { JSX, useState } from "react";
import { RadioGroup } from "@heroui/radio";
import { Tooltip } from "@heroui/tooltip";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

import { Competencia } from "@/features/evaluacion/types/evaluacion";
import { RadioNivelCompacto } from "@/features/evaluacion/components/common";

interface RadioNivelProps {
    radioKey: string;
    value: string;
    nombre: string;
    descripcion: string;
    puntaje: number;
}

interface CompetenciaCompactaProps {
    competencia: Competencia;
    obtenerPuntaje: (indicadorId: number) => number;
    manejarCambioPuntaje: (indicadorId: number, puntaje: number) => void;
    estaRespondido: (indicadorId: number) => boolean;
    renderRadioNivel: (props: RadioNivelProps) => JSX.Element;
}

export default function CompetenciaCompacta({
    competencia,
    obtenerPuntaje,
    manejarCambioPuntaje,
    estaRespondido,
}: CompetenciaCompactaProps) {
    const [expandedDefinitions, setExpandedDefinitions] = useState<Set<number>>(new Set());

    const toggleDefinition = (indicadorId: number) => {
        const newExpanded = new Set(expandedDefinitions);
        if (newExpanded.has(indicadorId)) {
            newExpanded.delete(indicadorId);
        } else {
            newExpanded.add(indicadorId);
        }
        setExpandedDefinitions(newExpanded);
    };

    return (
        <div className="bg-default">
            {/* Header responsivo - sticky para desktop */}
            <div className="hidden lg:block sticky top-0 z-20 bg-white dark:bg-default-50 shadow-sm">
                <div className="lg:grid lg:grid-cols-6 gap-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-blue-800/30 dark:to-indigo-800/50 py-6 px-8">
                    <div className="col-span-2 flex items-center">
                        <h3 className="text-base font-semibold text-default-800 uppercase tracking-wide">
                            Indicador
                        </h3>
                    </div>

                    <div className="text-center">
                        <div className="text-sm font-semibold text-default-800">Nivel 4</div>
                        <div className="text-xs text-default-500 mt-1">Destacado</div>
                        <div className="text-xs font-medium text-default-600">4 pts</div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm font-semibold text-default-800">Nivel 3</div>
                        <div className="text-xs text-default-500 mt-1">Competente</div>
                        <div className="text-xs font-medium text-default-600">3 pts</div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm font-semibold text-default-800">Nivel 2</div>
                        <div className="text-xs text-default-500 mt-1">Básico</div>
                        <div className="text-xs font-medium text-default-600">2 pts</div>
                    </div>

                    <div className="text-center">
                        <div className="text-sm font-semibold text-default-800">Nivel 1</div>
                        <div className="text-xs text-default-500 mt-1">Insatisfactorio</div>
                        <div className="text-xs font-medium text-default-600">1 pt</div>
                    </div>
                </div>
            </div>

            {/* Indicadores responsivos */}
            <div className="divide-y divide-default-100">
                {competencia.indicadores.map((indicador) => {
                    const puntajeActual = obtenerPuntaje(indicador.id);
                    const isCompleted = estaRespondido(indicador.id);
                    const isExpanded = expandedDefinitions.has(indicador.id);

                    return (
                        <div
                            key={indicador.id}
                            className={`transition-all duration-200 ${isCompleted ? 'bg-green-50/40 border-l-4 border-l-green-400' : 'border-l-4 border-l-transparent'
                                }`}
                        >
                            {/* Layout para pantallas grandes */}
                            <div className="hidden lg:grid lg:grid-cols-2 gap-6 py-8 px-8 bg-white dark:bg-default-50">
                                {/* Columna del indicador */}
                                <div className="col-span-2  border border-default-300 rounded-xl p-4 shadow bg-primary-100">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center text-base font-bold shadow-sm">
                                            {indicador.numero}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-base font-semibold text-default-900 leading-relaxed mb-3">
                                                {indicador.indicador}
                                            </h4>
                                            {indicador.definicion && (
                                                <div className="flex items-center gap-3">
                                                    <Tooltip
                                                        content={
                                                            <div className="max-w-md p-4">
                                                                <div className="text-md font-medium mb-2">Definición</div>
                                                                <div className="text-md text-default-700 leading-relaxed">{indicador.definicion}</div>
                                                            </div>
                                                        }
                                                        className="max-w-md"
                                                        placement="top"
                                                    >
                                                        <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0 cursor-help" />
                                                    </Tooltip>

                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Radio buttons en horizontal para desktop */}
                                <RadioGroup
                                    value={puntajeActual.toString()}
                                    onValueChange={(value) => manejarCambioPuntaje(indicador.id, parseInt(value))}
                                    orientation="horizontal"
                                    className="col-span-4 flex flex-row gap-6 items-center justify-center"
                                >
                                    {indicador.nvlindicadores.map((nivel) => (
                                        <RadioNivelCompacto
                                            key={nivel.nvl}
                                            value={nivel.puntaje.toString()}
                                            nombre={nivel.nombre}
                                            descripcion={nivel.descripcion}
                                            puntaje={nivel.puntaje}
                                        />
                                    ))}
                                </RadioGroup>
                            </div>

                            {/* Layout para pantallas pequeñas y medianas */}
                            <div className="lg:hidden p-2 space-y-2 bg-white dark:bg-default-50">
                                {/* Información del indicador */}
                                <div className="space-y-4 border border-default-300 rounded-xl p-2 shadow bg-primary-100">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center text-base font-bold shadow-sm">
                                            {indicador.numero}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-base font-semibold text-default-900 leading-relaxed mb-3">
                                                {indicador.indicador}
                                            </h4>
                                            {indicador.definicion && (
                                                <div className="space-y-3">
                                                    <div className="flex items-start gap-3">
                                                        <button
                                                            onClick={() => toggleDefinition(indicador.id)}
                                                            className="flex-shrink-0 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                                            aria-label="Ver definición completa"
                                                        >
                                                            <InformationCircleIcon className="w-5 h-5 text-blue-500 cursor-pointer" />
                                                        </button>
                                                        <p className="text-sm text-default-600 leading-relaxed">
                                                            {!isExpanded && indicador.definicion.length > 80
                                                                ? `${indicador.definicion.substring(0, 80)}...`
                                                                : indicador.definicion
                                                            }
                                                        </p>
                                                    </div>
                                                    {!isExpanded && indicador.definicion.length > 80 && (
                                                        <button
                                                            onClick={() => toggleDefinition(indicador.id)}
                                                            className="text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors"
                                                        >
                                                            Ver más
                                                        </button>
                                                    )}
                                                    {isExpanded && indicador.definicion.length > 80 && (
                                                        <button
                                                            onClick={() => toggleDefinition(indicador.id)}
                                                            className="text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors"
                                                        >
                                                            Ver menos
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Radio buttons responsivos para móvil/tablet */}
                                <div className="space-y-4">
                                    <h5 className="text-sm font-medium text-default-700 text-center">Selecciona el nivel de logro:</h5>
                                    <RadioGroup
                                        value={puntajeActual.toString()}
                                        onValueChange={(value) => manejarCambioPuntaje(indicador.id, parseInt(value))}
                                        orientation="horizontal"
                                        className="w-full grid grid-cols-1 gap-4"
                                    >
                                        {indicador.nvlindicadores.map((nivel) => (
                                            <RadioNivelCompacto
                                                key={nivel.nvl}
                                                value={nivel.puntaje.toString()}
                                                nombre={nivel.nombre}
                                                descripcion={nivel.descripcion}
                                                puntaje={nivel.puntaje}
                                            />
                                        ))}
                                    </RadioGroup>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}