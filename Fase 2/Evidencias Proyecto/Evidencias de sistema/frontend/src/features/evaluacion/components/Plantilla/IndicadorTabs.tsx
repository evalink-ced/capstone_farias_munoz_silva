import { forwardRef, useImperativeHandle } from "react";
import { Button } from "@heroui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { Textarea } from "@heroui/input";

import NivelesTable from "./NivelesTable";
import { useIndicadorTabs } from "./hooks/useIndicadorTabs";

import {
  IndicadorHandlers,
  NivelHandlers,
} from "@/features/evaluacion/types/plantilla/plantilla";
import { Indicador } from "@/features/evaluacion/types/evaluacion";

interface Props {
  isEditing: boolean;
  areaIndex: number;
  competenciaIndex: number;
  indicadores: Indicador[];
  indicadorHandlers: IndicadorHandlers;
  nivelHandlers: NivelHandlers;
}

export type IndicadorTabsRef = {
  validate: () => boolean;
  scrollToError: () => void;
};

const IndicadorTabs = forwardRef<IndicadorTabsRef, Props>(
  function IndicadorTabs(
    {
      isEditing,
      areaIndex,
      competenciaIndex,
      indicadores,
      indicadorHandlers,
      nivelHandlers,
    },
    ref,
  ) {
    const {
      activeIndicadorIndex,
      indicadorActual,
      errorIndicador,
      textareaIndicadorRef,
      textareaDefinicionRef,
      validate,
      scrollToError,
      handleIndicadorTabClick,
      handleAddIndicador,
      handleRemoveIndicador,
      handleIndicadorChange,
      handleDefinicionChange,
      handleNivelChange,
    } = useIndicadorTabs({
      areaIndex,
      competenciaIndex,
      indicadores,
      indicadorHandlers,
      nivelHandlers,
    });

    useImperativeHandle(ref, () => ({
      validate,
      scrollToError,
    }));

    return (
      <div>
        <h4 className="text-sm font-semibold text-default-800 mt-6">
          Indicadores
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2 mt-3">
          {indicadores.map((_, index) => (
            <Button
              key={index}
              className={`px-4 py-2 rounded-md border text-sm font-medium transition-all
              ${
                activeIndicadorIndex === index
                  ? "bg-secondary text-white border-secondary"
                  : "text-default-800 border-default-300 hover:bg-default-100"
              }`}
              type="button"
              onPress={() => handleIndicadorTabClick(index)}
            >
              📌 Indicador {index + 1}
            </Button>
          ))}
        </div>

        {indicadorActual && (
          <div className="space-y-4 mt-6">
            <Textarea
              ref={textareaIndicadorRef}
              isRequired
              color={errorIndicador ? "danger" : "secondary"}
              errorMessage={
                errorIndicador ? "Este campo es obligatorio" : undefined
              }
              id={`indicador-${activeIndicadorIndex}-indicador`}
              isDisabled={!isEditing}
              label="Indicador"
              labelPlacement="outside"
              name="indicador"
              placeholder="Ej: Cumple con su asistencia al lugar de trabajo..."
              rows={4}
              value={indicadorActual?.indicador}
              variant="faded"
              onChange={handleIndicadorChange}
            />

            <Textarea
              ref={textareaDefinicionRef}
              color="secondary"
              id={`indicador-${activeIndicadorIndex}-definicion`}
              isDisabled={!isEditing}
              label="Definición"
              labelPlacement="outside"
              name="definicion"
              placeholder="Ej: Definición del indicador..."
              rows={4}
              value={indicadorActual?.definicion}
              variant="faded"
              onChange={handleDefinicionChange}
            />

            <div className="flex flex-wrap gap-3">
              {isEditing && (
                <Button
                  color="primary"
                  startContent={<PlusCircle size={16} />}
                  variant="shadow"
                  onPress={handleAddIndicador}
                >
                  Agregar Indicador
                </Button>
              )}
              {indicadores.length > 1 && isEditing && (
                <Button
                  color="danger"
                  startContent={<Trash2 size={16} />}
                  variant="shadow"
                  onPress={handleRemoveIndicador}
                >
                  Borrar Indicador
                </Button>
              )}
            </div>

            <NivelesTable
              isEditing={isEditing}
              niveles={indicadorActual?.nvlindicadores}
              onChange={handleNivelChange}
            />
          </div>
        )}
      </div>
    );
  },
);

export default IndicadorTabs;
