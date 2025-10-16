import { useRef, useEffect, useState } from "react";

import useEvaluacionStore from "@/stores/evaluacion/plantilla/useEvaluacionStore";
import { Indicador } from "@/features/evaluacion/types/evaluacion";
import {
  IndicadorHandlers,
  NivelHandlers,
} from "@/features/evaluacion/types/plantilla/plantilla";

interface UseIndicadorTabsProps {
  areaIndex: number;
  competenciaIndex: number;
  indicadores: Indicador[];
  indicadorHandlers: IndicadorHandlers;
  nivelHandlers: NivelHandlers;
}

export function useIndicadorTabs({
  areaIndex,
  competenciaIndex,
  indicadores,
  indicadorHandlers,
  nivelHandlers,
}: UseIndicadorTabsProps) {
  const { activeIndicadorIndex, setActiveIndicadorIndex } =
    useEvaluacionStore();
  const textareaIndicadorRef = useRef<HTMLTextAreaElement | null>(null);
  const textareaDefinicionRef = useRef<HTMLTextAreaElement | null>(null);
  const prevIndicadorCount = useRef(indicadores.length);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  useEffect(() => {
    if (indicadores.length > prevIndicadorCount.current) {
      setActiveIndicadorIndex(indicadores.length - 1);
    }
    prevIndicadorCount.current = indicadores.length;
  }, [indicadores.length, setActiveIndicadorIndex]);

  const {
    onChange: onIndicadorChange,
    onDefinicionChange,
    onAdd: onAddIndicador,
    onRemove: onRemoveIndicador,
  } = indicadorHandlers;

  const {
    onChange: onNivelChange,
    onPuntajeChange,
    onNombreChange: onNombreNivelChange,
  } = nivelHandlers;

  const indicadorActual = indicadores[activeIndicadorIndex] ?? null;
  const errorIndicador =
    showValidationErrors && indicadorActual?.indicador?.trim() === "";

  const validate = () => {
    const valido = indicadorActual?.indicador?.trim() !== "";

    setShowValidationErrors(true);

    return valido;
  };

  const scrollToError = () => {
    if (
      indicadorActual?.indicador?.trim() === "" &&
      textareaIndicadorRef.current
    ) {
      textareaIndicadorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      textareaIndicadorRef.current.focus();
    } else if (
      indicadorActual?.definicion?.trim() === "" &&
      textareaDefinicionRef.current
    ) {
      textareaDefinicionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      textareaDefinicionRef.current.focus();
    }
  };

  const handleIndicadorTabClick = (index: number) => {
    setActiveIndicadorIndex(index);
    setShowValidationErrors(false);
  };

  const handleAddIndicador = () => {
    onAddIndicador(areaIndex, competenciaIndex);
    setShowValidationErrors(false);
  };

  const handleRemoveIndicador = () => {
    onRemoveIndicador(areaIndex, competenciaIndex, activeIndicadorIndex);
  };

  const handleIndicadorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onIndicadorChange(areaIndex, competenciaIndex, activeIndicadorIndex, e);
  };

  const handleDefinicionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDefinicionChange(areaIndex, competenciaIndex, activeIndicadorIndex, e);
  };

  const handleNivelChange = (
    nivelIndex: number,
    field: string,
    value: string,
  ) => {
    const e = { target: { value } } as React.ChangeEvent<any>;

    if (field === "descripcion") {
      onNivelChange(
        areaIndex,
        competenciaIndex,
        activeIndicadorIndex,
        nivelIndex,
        e,
      );
    } else if (field === "puntaje") {
      onPuntajeChange(
        areaIndex,
        competenciaIndex,
        activeIndicadorIndex,
        nivelIndex,
        e,
      );
    } else if (field === "nombre") {
      onNombreNivelChange(
        areaIndex,
        competenciaIndex,
        activeIndicadorIndex,
        nivelIndex,
        e,
      );
    }
  };

  return {
    // State
    activeIndicadorIndex,
    indicadorActual,
    errorIndicador,
    showValidationErrors,

    // Refs
    textareaIndicadorRef,
    textareaDefinicionRef,

    // Methods
    validate,
    scrollToError,
    handleIndicadorTabClick,
    handleAddIndicador,
    handleRemoveIndicador,
    handleIndicadorChange,
    handleDefinicionChange,
    handleNivelChange,
  };
}
