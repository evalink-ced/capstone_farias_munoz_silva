import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addToast } from "@heroui/toast";

import axios from "@/services/google/axiosInstance";
import { Respuesta } from "@/features/evaluacion/types/asignar/evaluacion";
import {
  AreaEvaluacion,
  TipoEvaluacion,
  Competencia,
} from "@/features/evaluacion/types/evaluacion";

interface UseEvaluacionBloqueBaseProps {
  area: AreaEvaluacion;
  estructura: TipoEvaluacion;
  respuestas: Respuesta[];
  actualizarPuntaje: (indicadorId: number, puntaje: number) => void;
  evaluacionId: number;
  tipoEvaluacion: "autoevaluacion" | "evaluacion";
  redirectPath: string;
}

export const useEvaluacionBloqueBase = ({
  area,
  estructura,
  respuestas,
  actualizarPuntaje,
  evaluacionId,
  tipoEvaluacion,
  redirectPath,
}: UseEvaluacionBloqueBaseProps) => {
  const navigate = useNavigate();
  const [mostrarTextarea, setMostrarTextarea] = useState(false);
  const [textMejorar, setTextMejorar] = useState("");
  const [textDestacar, setTextDestacar] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const obtenerPuntaje = (indicadorId: number) =>
    respuestas.find((r) => r.indicador === indicadorId)?.puntaje || 0;

  // Función para avanzar al siguiente indicador
  const avanzarAlSiguienteIndicador = (indicadorActualId: number) => {
    // Obtener todos los indicadores de todas las competencias
    const todosLosIndicadores = area.competencias.flatMap(
      (comp) => comp.indicadores,
    );
    const indicadorActualIndex = todosLosIndicadores.findIndex(
      (ind) => ind.id === indicadorActualId,
    );

    // Ir al siguiente indicador en orden secuencial
    if (indicadorActualIndex < todosLosIndicadores.length - 1) {
      const siguienteIndicador = todosLosIndicadores[indicadorActualIndex + 1];

      // Enfocar el siguiente indicador
      setTimeout(() => {
        const elemento = document.querySelector(
          `[data-indicador-id="${siguienteIndicador.id}"]`,
        );

        if (elemento) {
          elemento.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  };

  const manejarCambioPuntaje = (indicadorId: number, puntaje: number) => {
    actualizarPuntaje(indicadorId, puntaje);
    avanzarAlSiguienteIndicador(indicadorId);
  };

  const estaRespondido = (indicadorId: number) => {
    return respuestas.some((r) => r.indicador === indicadorId && r.puntaje > 0);
  };

  const handleFinalizar = async () => {
    // ✅ PREVENIR DOBLE CLIC - Si ya está procesando, no hacer nada
    if (isLoading) {
      return;
    }

    if (!mostrarTextarea) {
      setMostrarTextarea(true); // muestra el textarea antes de enviar
      return;
    }

    // Validar que ambos textareas tengan contenido
    if (!textMejorar.trim() || !textDestacar.trim()) {
      addToast({
        title: "Campos requeridos",
        description:
          "Por favor, completa ambos comentarios antes de finalizar.",
        color: "warning",
        variant: "solid",
      });
      return;
    }

    // ✅ ACTIVAR ESTADO DE LOADING
    setIsLoading(true);

    try {
      const endpoint =
        tipoEvaluacion === "autoevaluacion"
          ? `/evaluacion/api/autoevaluaciones/${evaluacionId}/`
          : `/evaluacion/api/evaluaciones-jefe/${evaluacionId}/`;

      await axios.put(endpoint, {
        completado: true,
        respuestas,
        text_mejorar: textMejorar,
        text_destacar: textDestacar,
      });

      addToast({
        title: `${
          tipoEvaluacion === "autoevaluacion" ? "Autoevaluación" : "Evaluación"
        } finalizada`,
        description: `Tu ${
          tipoEvaluacion === "autoevaluacion" ? "autoevaluación" : "evaluación"
        } se ha enviado correctamente.`,
        color: "success",
        variant: "solid",
      });
      navigate(redirectPath);
    } catch (error) {
      console.error(error);
      addToast({
        title: "Error al finalizar",
        description: `Ocurrió un error al intentar finalizar tu ${
          tipoEvaluacion === "autoevaluacion" ? "autoevaluación" : "evaluación"
        }.`,
        color: "danger",
        variant: "solid",
      });
    } finally {
      // ✅ DESACTIVAR ESTADO DE LOADING
      setIsLoading(false);
    }
  };

  // Cálculos de progreso
  const totalIndicadoresGlobal = estructura.areas.reduce(
    (total: number, area: AreaEvaluacion) =>
      total +
      area.competencias.reduce(
        (sub: number, comp: Competencia) => sub + comp.indicadores.length,
        0,
      ),
    0,
  );

  const respuestasRespondidasGlobal = new Set(
    respuestas.filter((r) => r.puntaje > 0).map((r) => r.indicador),
  ).size;

  const progresoGlobal = Math.round(
    (respuestasRespondidasGlobal / totalIndicadoresGlobal) * 100,
  );

  const totalIndicadoresArea = area.competencias.reduce(
    (acc: number, comp: Competencia) => acc + comp.indicadores.length,
    0,
  );

  // Corrección: contar indicadores únicos del área que tienen respuesta
  const indicadoresRespondidosArea = area.competencias.reduce((acc, comp) => {
    return acc + comp.indicadores.filter((ind) => {
      const respuesta = respuestas.find((r) => r.indicador === ind.id);
      return respuesta && respuesta.puntaje > 0;
    }).length;
  }, 0);

  const progresoArea = Math.round(
    (indicadoresRespondidosArea / totalIndicadoresArea) * 100,
  );

  return {
    // Estado
    mostrarTextarea,
    textMejorar,
    textDestacar,
    // ✅ AGREGAR ESTADO DE LOADING AL RETURN
    isLoading,

    // Setters
    setTextMejorar,
    setTextDestacar,

    // Funciones
    obtenerPuntaje,
    manejarCambioPuntaje,
    estaRespondido,
    handleFinalizar,

    // Cálculos
    progresoGlobal,
    respuestasRespondidasGlobal,
    totalIndicadoresGlobal,
    progresoArea,
  };
};
