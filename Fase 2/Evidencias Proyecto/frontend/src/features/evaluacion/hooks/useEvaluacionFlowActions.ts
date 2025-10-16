import { useState, useCallback } from "react";
import { addToast } from "@heroui/toast";
import {
  marcarReunionRealizada,
  completarRetroalimentacion,
  cerrarParaFirma,
  ejecutarAccionEvaluacion
} from "@/features/evaluacion/services/evaluacion";
import type {
  AccionEvaluacion,
  RespuestaAccion,
  EvaluacionJefe
} from "@/features/evaluacion/types/evaluacion";

interface UseEvaluacionFlowActionsReturn {
  loading: boolean;
  marcarReunion: (evaluacionId: number, fechaReunion: string) => Promise<boolean>;
  completarRetro: (evaluacionId: number, retroalimentacion: string) => Promise<boolean>;
  cerrarParaFirmar: (evaluacionId: number) => Promise<boolean>;
  ejecutarAccion: (accion: AccionEvaluacion) => Promise<boolean>;
}

export function useEvaluacionFlowActions(
  onSuccess?: (evaluacion?: EvaluacionJefe) => void,
  onError?: (message: string) => void
): UseEvaluacionFlowActionsReturn {
  const [loading, setLoading] = useState(false);

  const handleResponse = useCallback(
    (response: RespuestaAccion): boolean => {
      if (response.success) {
        addToast({
          title: "Éxito",
          description: response.message,
          color: "success",
          variant: "solid",
        });
        onSuccess?.(response.evaluacion);
        return true;
      } else {
        addToast({
          title: "Error",
          description: response.message,
          color: "danger",
          variant: "solid",
        });
        onError?.(response.message);
        return false;
      }
    },
    [onSuccess, onError]
  );

  const marcarReunion = useCallback(
    async (evaluacionId: number, fechaReunion: string): Promise<boolean> => {
      setLoading(true);
      try {
        const response = await marcarReunionRealizada(evaluacionId, fechaReunion);
        return handleResponse(response);
      } catch (error) {
        const message = "Error inesperado al marcar reunión";
        addToast({
          title: "Error",
          description: message,
          color: "danger",
          variant: "solid",
        });
        onError?.(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [handleResponse, onError]
  );

  const completarRetro = useCallback(
    async (evaluacionId: number, retroalimentacion: string): Promise<boolean> => {
      setLoading(true);
      try {
        const response = await completarRetroalimentacion(evaluacionId, retroalimentacion);
        return handleResponse(response);
      } catch (error) {
        const message = "Error inesperado al completar retroalimentación";
        addToast({
          title: "Error",
          description: message,
          color: "danger",
          variant: "solid",
        });
        onError?.(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [handleResponse, onError]
  );

  const cerrarParaFirmar = useCallback(
    async (evaluacionId: number): Promise<boolean> => {
      setLoading(true);
      try {
        const response = await cerrarParaFirma(evaluacionId);
        return handleResponse(response);
      } catch (error) {
        const message = "Error inesperado al cerrar para firma";
        addToast({
          title: "Error",
          description: message,
          color: "danger",
          variant: "solid",
        });
        onError?.(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [handleResponse, onError]
  );

  const ejecutarAccion = useCallback(
    async (accion: AccionEvaluacion): Promise<boolean> => {
      setLoading(true);
      try {
        const response = await ejecutarAccionEvaluacion(accion);
        return handleResponse(response);
      } catch (error) {
        const message = "Error inesperado al ejecutar acción";
        addToast({
          title: "Error",
          description: message,
          color: "danger",
          variant: "solid",
        });
        onError?.(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [handleResponse, onError]
  );

  return {
    loading,
    marcarReunion,
    completarRetro,
    cerrarParaFirmar,
    ejecutarAccion,
  };
}