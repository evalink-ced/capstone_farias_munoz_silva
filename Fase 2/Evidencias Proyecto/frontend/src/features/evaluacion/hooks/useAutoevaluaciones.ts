// features/evaluacion/autoevaluacion/hooks/useAutoevaluaciones.ts
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "@/services/google/axiosInstance";
import { addToast } from "@heroui/toast";
import type { Evaluacion } from "@/features/evaluacion/types/evaluacion";

export function useAutoevaluaciones() {
  const [pendientes, setPendientes] = useState<Evaluacion[]>([]);
  const [finalizadas, setFinalizadas] = useState<Evaluacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoadingUI, setShowLoadingUI] = useState(false);
  const timerRef = useRef<number | null>(null);

  const fetchData = useCallback(async (signal: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);

      const [p, f] = await Promise.all([
        axios.get("/evaluacion/api/autoevaluaciones/?completado=false", { signal }),
        axios.get("/evaluacion/api/autoevaluaciones/?completado=true", { signal }),
      ]);

      setPendientes(p.data ?? []);
      setFinalizadas(f.data ?? []);
    } catch (err: any) {
      if (err?.name === "CanceledError" || err?.message === "canceled") return;
      console.error("Error fetching autoevaluaciones:", err);
      setError("Error al cargar las autoevaluaciones");
      addToast({
        title: "Error al cargar las autoevaluaciones",
        description: "Ocurrió un problema al intentar cargar las autoevaluaciones.",
        color: "danger",
        variant: "solid",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    const ac = new AbortController();
    timerRef.current = window.setTimeout(() => setShowLoadingUI(true), 180);
    fetchData(ac.signal).finally(() => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      window.setTimeout(() => setShowLoadingUI(false), 120);
    });
    return () => ac.abort();
  }, [fetchData]);

  useEffect(() => {
    const cancel = refresh();
    return () => {
      cancel();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [refresh]);

  return { pendientes, finalizadas, loading, error, showLoadingUI, refresh } as const;
}
