import { useEffect, useRef } from "react";
import { Button } from "@heroui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { Input } from "@heroui/input";

import IndicadorTabs from "./IndicadorTabs";

import { Competencia } from "@/features/evaluacion/types/evaluacion";
import useEvaluacionStore from "@/stores/evaluacion/plantilla/useEvaluacionStore";
import {
  CompetenciaHandlers,
  IndicadorHandlers,
  NivelHandlers,
} from "@/features/evaluacion/types/plantilla/plantilla";

interface Props {
  isEditing: boolean;
  areaIndex: number;
  competencias: Competencia[];
  competenciaHandlers: CompetenciaHandlers;
  indicadorHandlers: IndicadorHandlers;
  nivelHandlers: NivelHandlers;
}

export default function CompetenciaTabs({
  areaIndex,
  competencias,
  competenciaHandlers,
  indicadorHandlers,
  nivelHandlers,
  isEditing,
}: Props) {
  const { activeCompetenciaIndex, setActiveCompetenciaIndex } =
    useEvaluacionStore();

  const prevCompetenciaCount = useRef(competencias.length);

  useEffect(() => {
    if (competencias.length > prevCompetenciaCount.current) {
      setActiveCompetenciaIndex(competencias.length - 1);
    }
    prevCompetenciaCount.current = competencias.length;
  }, [competencias.length, setActiveCompetenciaIndex]);

  const {
    onAdd: onAddCompetencia,
    onRemove: onRemoveCompetencia,
    onChange: onCompetenciaChange,
  } = competenciaHandlers;

  return (
    <div>
      <h3 className="text-base font-semibold text-default-800 mt-6">
        Competencias
      </h3>

      {/* Grid de botones en lugar de Tabs */}
      <div className="flex flex-wrap gap-3 mt-4">
        {competencias.map((competencia, index) => (
          <Button
            key={index}
            className={`px-4 py-2 rounded-md border text-sm font-medium transition-all
              ${
                activeCompetenciaIndex === index
                  ? "bg-secondary text-white border-secondary"
                  : "text-default-800 border-default-300 hover:bg-default-100"
              }`}
            type="button"
            onPress={() => setActiveCompetenciaIndex(index)}
          >
            📗 {competencia.name || `Competencia ${index + 1}`}
          </Button>
        ))}
      </div>

      {/* Contenido de la competencia activa */}
      {competencias[activeCompetenciaIndex] && (
        <div className="space-y-4 mt-6">
          <Input
            required
            id={`competencia-${activeCompetenciaIndex}-name`}
            isDisabled={!isEditing}
            label="Nombre de la Competencia"
            labelPlacement="outside"
            name="name"
            placeholder="Ej: Responsabilidad"
            type="text"
            value={competencias[activeCompetenciaIndex].name}
            variant="faded"
            onChange={(e) =>
              onCompetenciaChange(areaIndex, activeCompetenciaIndex, e)
            }
          />

          <div className="flex flex-wrap gap-3">
            {isEditing && (
              <Button
                color="primary"
                startContent={<PlusCircle size={16} />}
                variant="shadow"
                onPress={() => onAddCompetencia(areaIndex)}
              >
                Agregar Competencia
              </Button>
            )}
            {competencias.length > 1 && isEditing && (
              <Button
                color="danger"
                startContent={<Trash2 size={16} />}
                variant="shadow"
                onPress={() =>
                  onRemoveCompetencia(areaIndex, activeCompetenciaIndex)
                }
              >
                Borrar Competencia
              </Button>
            )}
          </div>

          <IndicadorTabs
            areaIndex={areaIndex}
            competenciaIndex={activeCompetenciaIndex}
            indicadorHandlers={indicadorHandlers}
            indicadores={competencias[activeCompetenciaIndex].indicadores}
            isEditing={isEditing}
            nivelHandlers={nivelHandlers}
          />
        </div>
      )}
    </div>
  );
}
