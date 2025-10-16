import { Button } from "@heroui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { Input } from "@heroui/input";

import CompetenciaTabs from "./CompetenciaTabs";

import { AreaEvaluacion } from "@/features/evaluacion/types/evaluacion";
import useEvaluacionStore from "@/stores/evaluacion/plantilla/useEvaluacionStore";
import {
  IndicadorHandlers,
  NivelHandlers,
  CompetenciaHandlers,
} from "@/features/evaluacion/types/plantilla/plantilla";

interface Props {
  isEditing: boolean;
  areas: AreaEvaluacion[];
  onAreaChange: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddArea: () => void;
  onRemoveArea: (index: number) => void;
  competenciaHandlers: CompetenciaHandlers;
  indicadorHandlers: IndicadorHandlers;
  nivelHandlers: NivelHandlers;
  updatePonderacion?: (index: number, value: number) => void;
}

export default function AreaTabs({
  isEditing,
  areas,
  onAreaChange,
  onAddArea,
  onRemoveArea,
  competenciaHandlers,
  indicadorHandlers,
  nivelHandlers,
  updatePonderacion,
}: Props) {
  const { activeAreaIndex, setActiveAreaIndex } = useEvaluacionStore();

  const handleAddArea = () => {
    onAddArea();
    setActiveAreaIndex(areas.length); // cambiar a la nueva pestaña
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-default-800 mt-8">
        Áreas de Evaluación
      </h2>

      {/* Grid de botones que simula tabs */}
      <div className="flex flex-wrap gap-3 mt-4">
        {areas.map((area, areaIndex) => (
          <Button
            key={areaIndex}
            className={`px-4 py-2 rounded-md border text-sm font-medium transition-all
              ${activeAreaIndex === areaIndex
                ? "bg-secondary text-white border-secondary"
                : "text-default-800 border-default-300 hover:bg-default-100"
              }`}
            type="button"
            onPress={() => setActiveAreaIndex(areaIndex)}
          >
            📘 {area.n_area || `Área ${areaIndex + 1}`}
          </Button>
        ))}
      </div>

      {/* Contenido del área activa */}
      {areas[activeAreaIndex] && (
        <div className="space-y-4 mt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                required
                id={`area-${activeAreaIndex}-n_area`}
                isDisabled={!isEditing}
                label="Nombre del Área"
                labelPlacement="outside"
                name="n_area"
                placeholder="Ej: I.CUMPLIMIENTO"
                type="text"
                value={areas[activeAreaIndex].n_area}
                variant="faded"
                onChange={(e) => onAreaChange(activeAreaIndex, e)}
              />
            </div>


            <div className="w-40">
              <Input
                // no usamos required para evitar validaciones molestas
                endContent={
                  <span className="text-default-500 text-sm pr-1">%</span>
                }
                id={`area-${activeAreaIndex}-ponderacion`}
                isDisabled={!isEditing}
                label="Ponderación (%)"
                labelPlacement="outside"
                max={100}
                min={0}
                name="ponderacion"
                placeholder="Ej: 25"
                type="number"
                value={(areas[activeAreaIndex].ponderacion ?? 0).toString()}
                variant="faded"
                onChange={(e) => {
                  const value = Math.min(
                    Math.max(parseInt(e.target.value || "0", 10), 0),
                    100,
                  );
                  // solo si el handler existe
                  updatePonderacion?.(activeAreaIndex, value);
                }}
              />
            </div>

          </div>

          <div className="flex flex-wrap gap-3">
            {isEditing && (
              <Button
                color="primary"
                startContent={<PlusCircle size={16} />}
                variant="shadow"
                onPress={handleAddArea}
              >
                Agregar Área
              </Button>
            )}

            {isEditing && areas.length > 1 && (
              <Button
                color="danger"
                startContent={<Trash2 size={16} />}
                variant="shadow"
                onPress={() => onRemoveArea(activeAreaIndex)}
              >
                Borrar Área
              </Button>
            )}
          </div>

          <CompetenciaTabs
            areaIndex={activeAreaIndex}
            competenciaHandlers={competenciaHandlers}
            competencias={areas[activeAreaIndex].competencias}
            indicadorHandlers={indicadorHandlers}
            isEditing={isEditing}
            nivelHandlers={nivelHandlers}
          />
        </div>
      )}
    </div>
  );
}
