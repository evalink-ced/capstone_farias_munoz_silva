import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import api from "@/services/google/axiosInstance";
import { BASE_API_URL } from "@/features/evaluacion/services/plantilla/evaluacion";
import useEvaluacionStore from "@/stores/evaluacion/plantilla/useEvaluacionStore";
import {
  CompetenciaHandlers,
  IndicadorHandlers,
  NivelHandlers,
} from "@/features/evaluacion/types/plantilla/plantilla";

export function useEditarTipoEvaluacion() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAutoevaluacion, setIsAutoevaluacion] = useState(false);

  // ⬇️ nuevo estado
  const [isPonderada, setIsPonderada] = useState(
    // si quieres levantarlo desde query param (?pond=true)
    new URLSearchParams(location.search).get("pond") === "true",
  );

  const tipoEvaluacion = location.state?.tipoEvaluacion;
  const id = tipoEvaluacion?.id;

  const {
    nombreTipoEvaluacion,
    setNombre,
    areas,
    setAreas,
    addArea,
    removeArea,
    addCompetencia,
    removeCompetencia,
    addIndicador,
    removeIndicador,
    updateIndicadorTexto,
    updateIndicadorDefinicion,
    updateNivelDescripcion,
    updateNivelPuntaje,
    updateNivelNombre,
    updatePonderacion,
    onCompetenciaChange,
  } = useEvaluacionStore();

  useEffect(() => {
    if (tipoEvaluacion) {
      setNombre(tipoEvaluacion.n_tipo_evaluacion);
      setAreas(tipoEvaluacion.areas);
      setIsAutoevaluacion(tipoEvaluacion.auto);
      setIsPonderada(tipoEvaluacion.ponderada);
    }
  }, [tipoEvaluacion, setNombre, setAreas]);

  const onTogglePonderada = (checked: boolean) => {
    setIsPonderada(checked);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      n_tipo_evaluacion: nombreTipoEvaluacion,
      auto: isAutoevaluacion,
      ponderada: isPonderada,
      areas: areas.map((area) => ({
        n_area: area.n_area,
        ponderacion: area.ponderacion,
        competencias: area.competencias.map((c) => ({
          name: c.name,
          indicadores: c.indicadores.map((i) => ({
            numero: i.numero,
            indicador: i.indicador,
            definicion: i.definicion,
            nvlindicadores: i.nvlindicadores.map((n) => ({
              nombre: n.nombre,
              descripcion: n.descripcion,
              nvl: n.nvl.toString(),
              puntaje: n.puntaje,
            })),
          })),
        })),
      })),
    };

    console.log("Payload enviado:", payload);

    try {
      await api.put(`${BASE_API_URL}tipos-evaluacion/${id}/`, payload);
      setShowModal(true);
      setIsEditing(false);

      setTimeout(() => {
        navigate("/evaluacion-editar");
      }, 2000);
    } catch (err) {
      console.error("Error al actualizar tipo de evaluación", err);
    }
  };

  const onToggleAutoevaluacion = (checked: boolean) => {
    setIsAutoevaluacion(checked);
  };

  const handleAreaChange = (
    i: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newAreas = [...areas];

    newAreas[i].n_area = e.target.value;
    setAreas(newAreas);
  };

  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNombre(e.target.value);
  };

  const handleEnableEditing = () => {
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const competenciaHandlers: CompetenciaHandlers = {
    onAdd: addCompetencia,
    onRemove: removeCompetencia,
    onChange: onCompetenciaChange,
  };

  const indicadorHandlers: IndicadorHandlers = {
    onAdd: addIndicador,
    onRemove: removeIndicador,
    onChange: (
      aIdx: number,
      cIdx: number,
      iIdx: number,
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => updateIndicadorTexto(aIdx, cIdx, iIdx, e.target.value),
    onDefinicionChange: (
      aIdx: number,
      cIdx: number,
      iIdx: number,
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => updateIndicadorDefinicion(aIdx, cIdx, iIdx, e.target.value),
  };

  const nivelHandlers: NivelHandlers = {
    onChange: (
      aIdx: number,
      cIdx: number,
      iIdx: number,
      nIdx: number,
      e: React.ChangeEvent<HTMLTextAreaElement>,
    ) => updateNivelDescripcion(aIdx, cIdx, iIdx, nIdx, e.target.value),
    onPuntajeChange: (
      aIdx: number,
      cIdx: number,
      iIdx: number,
      nIdx: number,
      e: React.ChangeEvent<HTMLInputElement>,
    ) => updateNivelPuntaje(aIdx, cIdx, iIdx, nIdx, e.target.value),
    onNombreChange: (
      aIdx: number,
      cIdx: number,
      iIdx: number,
      nIdx: number,
      e: React.ChangeEvent<HTMLInputElement>,
    ) => updateNivelNombre(aIdx, cIdx, iIdx, nIdx, e.target.value),
  };

  return {
    // State
    showModal,
    isEditing,
    isAutoevaluacion,
    isPonderada,
    nombreTipoEvaluacion,
    areas,
    // Handlers
    handleSubmit,
    onToggleAutoevaluacion,
    onTogglePonderada,
    handleAreaChange,
    handleNombreChange,
    handleEnableEditing,
    handleCancelEditing,
    handleCloseModal,

    // Store actions
    addArea,
    removeArea,
    updatePonderacion,

    // Handler objects
    competenciaHandlers,
    indicadorHandlers,
    nivelHandlers,
  };
}
