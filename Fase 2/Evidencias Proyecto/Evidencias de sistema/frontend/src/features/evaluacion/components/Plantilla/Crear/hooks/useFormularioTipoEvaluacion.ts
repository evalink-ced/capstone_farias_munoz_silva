import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import api from "@/services/google/axiosInstance";
import { BASE_API_URL } from "@/features/evaluacion/services/plantilla/evaluacion";
import useEvaluacionStore from "@/stores/evaluacion/plantilla/useEvaluacionStore";
import {
  CompetenciaHandlers,
  IndicadorHandlers,
  NivelHandlers,
} from "@/features/evaluacion/types/plantilla/plantilla";

export const useFormularioTipoEvaluacion = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isAutoevaluacion, setIsAutoevaluacion] = useState(
    searchParams.get("auto") === "true",
  );
  // ⬇️ nuevo estado
  const [isPonderada, setIsPonderada] = useState(
    // si quieres levantarlo desde query param (?pond=true)
    searchParams.get("pond") === "true",
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [erroresFormulario, setErroresFormulario] = useState<string[]>([]);

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
    resetEvaluacion,
    onCompetenciaChange,
    updatePonderacion,
    autorellenarAutoevaluacion, // Nueva función del store
  } = useEvaluacionStore();

  useEffect(() => {
    resetEvaluacion();
  }, [resetEvaluacion]);

  // Nuevo useEffect para autorelleno de autoevaluaciones
  useEffect(() => {
    if (isAutoevaluacion) {
      autorellenarAutoevaluacion();
    }
  }, [isAutoevaluacion, autorellenarAutoevaluacion]);

  const onToggleAutoevaluacion = (checked: boolean) => {
    setIsAutoevaluacion(checked);
    // Si se activa autoevaluación, autorrellenar inmediatamente
    if (checked) {
      autorellenarAutoevaluacion();
    } else {
      resetEvaluacion();
    }
  };
  const onTogglePonderada = (checked: boolean) => {
    setIsPonderada(checked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    const errores = useEvaluacionStore.getState().validarFormulario();

    setErroresFormulario(errores);

    if (errores.length > 0) {
      return;
    }

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

    try {
      const response = await api.post(
        `${BASE_API_URL}tipos-evaluacion/`,
        payload,
      );

      console.log("Tipo de evaluación creado:", response.data);
      setShowSuccessModal(true);
      resetEvaluacion();
    } catch (error: any) {
      console.error("❌ Error inesperado al crear la evaluación:", error);

      const data = error.response?.data;

      if (!data) {
        setErroresFormulario(["Error de red o conexión con el servidor."]);

        return;
      }

      let mensaje = "";

      if (data?.n_tipo_evaluacion?.[0]) {
        mensaje = data.n_tipo_evaluacion[0];

        if (mensaje.includes("Ya existe TipoEvaluacion")) {
          mensaje = "Ya existe una evaluación con ese nombre.";
        }
      } else if (typeof data === "string") {
        mensaje = data;
      } else if (data?.detail) {
        mensaje = data.detail;
      } else {
        mensaje = "Ocurrió un error al guardar la evaluación.";
      }

      setErroresFormulario([mensaje]);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate("/evaluacion-editar");
  };

  // Handlers para los componentes
  const competenciaHandlers: CompetenciaHandlers = {
    onAdd: addCompetencia,
    onRemove: removeCompetencia,
    onChange: onCompetenciaChange,
  };

  const indicadorHandlers: IndicadorHandlers = {
    onAdd: addIndicador,
    onRemove: removeIndicador,
    onChange: (aIdx, cIdx, iIdx, e) =>
      updateIndicadorTexto(aIdx, cIdx, iIdx, e.target.value),
    onDefinicionChange: (aIdx, cIdx, iIdx, e) =>
      updateIndicadorDefinicion(aIdx, cIdx, iIdx, e.target.value),
  };

  const nivelHandlers: NivelHandlers = {
    onChange: (aIdx, cIdx, iIdx, nIdx, e) =>
      updateNivelDescripcion(aIdx, cIdx, iIdx, nIdx, e.target.value),
    onPuntajeChange: (aIdx, cIdx, iIdx, nIdx, e) =>
      updateNivelPuntaje(aIdx, cIdx, iIdx, nIdx, e.target.value),
    onNombreChange: (aIdx, cIdx, iIdx, nIdx, e) =>
      updateNivelNombre(aIdx, cIdx, iIdx, nIdx, e.target.value),
  };

  return {
    // State
    isAutoevaluacion,
    showSuccessModal,
    formSubmitted,
    erroresFormulario,
    nombreTipoEvaluacion,
    areas,
    isPonderada,
    onTogglePonderada,
    // Actions
    onToggleAutoevaluacion,
    handleSubmit,
    handleSuccessModalClose,
    setNombre,
    setAreas,
    addArea,
    removeArea,
    updatePonderacion,
    // Handlers
    competenciaHandlers,
    indicadorHandlers,
    nivelHandlers,
  };
};
