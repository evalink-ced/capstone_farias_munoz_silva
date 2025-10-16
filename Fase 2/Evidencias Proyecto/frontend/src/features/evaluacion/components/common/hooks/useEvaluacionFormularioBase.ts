import { useEffect, useState } from "react";
import { addToast } from "@heroui/toast";

import axios from "@/services/google/axiosInstance";
import { Respuesta } from "@/features/evaluacion/types/asignar/evaluacion";

interface UseEvaluacionFormularioBaseProps {
  evaluacionId: number;
  tipoEvaluacion: "autoevaluacion" | "evaluacion";
}

export function useEvaluacionFormularioBase({
  evaluacionId,
  tipoEvaluacion,
}: UseEvaluacionFormularioBaseProps) {
  const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
  const [estructura, setEstructura] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paginaActual] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  useEffect(() => {
    const cargarEvaluacion = async () => {
      if (!evaluacionId) {
        addToast({
          title: "ID no válido",
          description:
            "No se pudo cargar la evaluación porque no se proporcionó un ID.",
          color: "danger",
          variant: "solid",
        });

        return;
      }

      try {
        const endpoint =
          tipoEvaluacion === "autoevaluacion"
            ? `/evaluacion/api/autoevaluaciones/${evaluacionId}/`
            : `/evaluacion/api/evaluaciones-jefe/${evaluacionId}/`;

        const response = await axios.get(endpoint);

        setEstructura(response.data.estructura_json);
        setRespuestas(response.data.respuestas || []);
      } catch (error) {
        addToast({
          title: `Error al cargar ${tipoEvaluacion === "autoevaluacion"
              ? "autoevaluación"
              : "evaluación"
            }`,
          description: `Hubo un error al cargar la ${tipoEvaluacion === "autoevaluacion"
              ? "autoevaluación"
              : "evaluación"
            }`,
          variant: "solid",
          color: "danger",
        });
      } finally {
        setLoading(false);
      }
    };

    cargarEvaluacion();
  }, [evaluacionId, tipoEvaluacion]);

  const actualizarPuntaje = (indicadorId: number, puntaje: number) => {
    setRespuestas((prev) => {
      const index = prev.findIndex((r) => r.indicador === indicadorId);

      // Si ya existe una respuesta para este indicador
      if (index >= 0) {
        const nuevasRespuestas = [...prev];
        const respuestaActual = nuevasRespuestas[index];

        // Si el puntaje seleccionado es el mismo que ya tenía, lo deseleccionamos (puntaje = 0)
        if (respuestaActual.puntaje === puntaje) {
          nuevasRespuestas[index] = { ...respuestaActual, puntaje: 0 };
        } else {
          // Si es un puntaje diferente, actualizamos al nuevo valor
          nuevasRespuestas[index] = { ...respuestaActual, puntaje };
        }

        return nuevasRespuestas;
      } else {
        // Si no existe una respuesta previa, creamos una nueva
        return [...prev, { indicador: indicadorId, puntaje }];
      }
    });
  };

  // Guardado automático cuando cambian las respuestas
  useEffect(() => {
    const guardarAutomaticamente = async () => {
      if (respuestas.length === 0 || !evaluacionId) return;

      setGuardando(true);
      setGuardadoExitoso(false);

      try {
        const endpoint =
          tipoEvaluacion === "autoevaluacion"
            ? `/evaluacion/api/autoevaluaciones/${evaluacionId}/`
            : `/evaluacion/api/evaluaciones-jefe/${evaluacionId}/`;

        await axios.put(endpoint, {
          respuestas,
          completado: false,
        });

        setGuardadoExitoso(true);
        // Ocultar el indicador de éxito después de 3 segundos
        setTimeout(() => setGuardadoExitoso(false), 3000);
      } catch (error) {
        console.error("Error en guardado automático:", error);
      } finally {
        setGuardando(false);
      }
    };

    // Debounce para no hacer demasiadas peticiones
    const timeoutId = setTimeout(() => {
      guardarAutomaticamente();
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [respuestas, evaluacionId, tipoEvaluacion]);

  return {
    respuestas,
    estructura,
    loading,
    paginaActual,
    guardando,
    guardadoExitoso,
    actualizarPuntaje,
  };
}
