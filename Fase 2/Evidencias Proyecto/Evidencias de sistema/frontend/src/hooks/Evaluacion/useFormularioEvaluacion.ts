import { useState } from "react";

import { AreaEvaluacion } from "@/features/evaluacion/types/evaluacion";

const crearNivel = () => [
  { nombre: "DESTACADO 4 puntos", nvl: 4, puntaje: 4, descripcion: "" },
  { nombre: "COMPETENTE 3 puntos", nvl: 3, puntaje: 3, descripcion: "" },
  { nombre: "BÁSICO 2 puntos", nvl: 2, puntaje: 2, descripcion: "" },
  { nombre: "INSATISFACTORIO 1 punto", nvl: 1, puntaje: 1, descripcion: "" },
];

const crearIndicador = () => ({
  numero: 1,
  id: 1,
  indicador: "",
  nvlindicadores: crearNivel(),
});

const crearCompetencia = () => ({
  id: Date.now() + Math.random(), // Generar un ID único temporal
  name: "",
  indicadores: [crearIndicador()],
});

const crearArea = (): AreaEvaluacion => ({
  n_area: "",
  ponderacion: 0,
  competencias: [crearCompetencia()],
});

export default function useFormularioEvaluacion() {
  const [nombreTipoEvaluacion, setNombreTipoEvaluacion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [areas, setAreas] = useState<AreaEvaluacion[]>([crearArea()]);

  const handleNombreTipoEvaluacionChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setNombreTipoEvaluacion(e.target.value);
  };

  const handleAreaChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newAreas = [...areas];

    newAreas[index].n_area = e.target.value;
    setAreas(newAreas);
  };

  const handleIndicadorChange = (
    areaIndex: number,
    competenciaIndex: number,
    indicadorIndex: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const newAreas = [...areas];
    const { name, value } = e.target;
    const indicador =
      newAreas[areaIndex].competencias[competenciaIndex].indicadores[
        indicadorIndex
      ];

    if (name === "indicador") indicador.indicador = value;
    else if (name === "name")
      newAreas[areaIndex].competencias[competenciaIndex].name = value;
    else if (name === "numero") indicador.numero = parseInt(value);

    setAreas(newAreas);
  };

  const handleNivelChange = (
    areaIndex: number,
    competenciaIndex: number,
    indicadorIndex: number,
    nivelIndex: number,
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const newAreas = [...areas];

    newAreas[areaIndex].competencias[competenciaIndex].indicadores[
      indicadorIndex
    ].nvlindicadores[nivelIndex].descripcion = e.target.value;

    setAreas(newAreas);
  };

  const addArea = () => setAreas([...areas, crearArea()]);

  const removeArea = (index: number) => {
    if (areas.length <= 1) return;
    setAreas(areas.filter((_, i) => i !== index));
  };

  const addCompetencia = (areaIndex: number) => {
    const newAreas = [...areas];

    newAreas[areaIndex].competencias.push(crearCompetencia());
    setAreas(newAreas);
  };

  const removeCompetencia = (areaIndex: number, competenciaIndex: number) => {
    const competencias = areas[areaIndex].competencias;

    if (competencias.length <= 1) return;
    const newAreas = [...areas];

    newAreas[areaIndex].competencias = competencias.filter(
      (_: any, i: number) => i !== competenciaIndex,
    );
    setAreas(newAreas);
  };

  const addIndicador = (areaIndex: number, competenciaIndex: number) => {
    const newAreas = [...areas];

    newAreas[areaIndex].competencias[competenciaIndex].indicadores.push(
      crearIndicador(),
    );
    setAreas(newAreas);
  };

  const removeIndicador = (
    areaIndex: number,
    competenciaIndex: number,
    indicadorIndex: number,
  ) => {
    const indicadores =
      areas[areaIndex].competencias[competenciaIndex].indicadores;

    if (indicadores.length <= 1) return;
    const newAreas = [...areas];

    newAreas[areaIndex].competencias[competenciaIndex].indicadores =
      indicadores.filter((_: any, i: number) => i !== indicadorIndex);
    setAreas(newAreas);
  };

  const resetFormulario = () => {
    setNombreTipoEvaluacion("");
    setAreas([crearArea()]);
  };

  return {
    nombreTipoEvaluacion,
    setNombreTipoEvaluacion,
    handleNombreTipoEvaluacionChange,
    error,
    setError,
    areas,
    setAreas,
    handleAreaChange,
    handleIndicadorChange,
    handleNivelChange,
    addArea,
    removeArea,
    addCompetencia,
    removeCompetencia,
    addIndicador,
    removeIndicador,
    resetFormulario,
  };
}
