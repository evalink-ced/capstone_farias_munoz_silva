import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { addToast } from "@heroui/toast";
import {
  obtenerEvaluacionesJefe,
  obtenerMisEvaluacionesJefatura
} from "@/features/evaluacion/services/evaluacion";
import type {
  EvaluacionJefe,
  EstadoEvaluacion
} from "@/features/evaluacion/types/evaluacion";

type FiltroEstado = EstadoEvaluacion | 'todas';

interface UseEvaluacionesJefeOptions {
  filtroEstado?: FiltroEstado;
  soloMisEvaluaciones?: boolean;
  debug?: boolean;
}

interface UseEvaluacionesJefeReturn {
  evaluaciones: EvaluacionJefe[];
  evaluacionesFiltradas: EvaluacionJefe[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  // Contadores por estado
  contadores: {
    pendientes: number;
    completadas: number;
    conReunion: number;
    conRetroalimentacion: number;
    cerradasParaFirma: number;
    firmadas: number;
    denegadas: number;
  };
}

function getEstadoEvaluacion(evaluacion: EvaluacionJefe): EstadoEvaluacion {
  // Priorizar el nuevo campo estado_firma si existe
  if (evaluacion.estado_firma) {
    if (evaluacion.estado_firma === 'firmado') return 'finalizado';
  }
  
  // Fallback al campo firmado para compatibilidad
  if (evaluacion.firmado) return 'finalizado';
  if (evaluacion.cerrado_para_firma) return 'firmar';
  if (evaluacion.retroalimentacion_completada) return 'retroalimentar';
  return 'pendiente';
}

export function useEvaluacionesJefe(
  options: UseEvaluacionesJefeOptions = {}
): UseEvaluacionesJefeReturn {
  const {
    filtroEstado = 'todas',
    soloMisEvaluaciones = false,
    debug = false
  } = options;

  const [evaluaciones, setEvaluaciones] = useState<EvaluacionJefe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasFetchedRef = useRef(false);
  const mountedRef = useRef(false);

  const fetchEvaluaciones = useCallback(async () => {
    if (hasFetchedRef.current) {
      if (debug) console.info("[EvaluacionesJefe] fetch omitido (misma key)");
      return;
    }
    hasFetchedRef.current = true;

    setLoading(true);
    setError(null);

    const t0 = performance.now();
    try {
      const data = soloMisEvaluaciones
        ? await obtenerMisEvaluacionesJefatura()
        : await obtenerEvaluacionesJefe();

      if (!mountedRef.current) return;
      setEvaluaciones(data);

      if (debug) {
        console.groupCollapsed(
          "%c[EvaluacionesJefe] fetch OK",
          "color:#16a34a;font-weight:bold;"
        );
        console.log("tipo:", soloMisEvaluaciones ? "mis evaluaciones" : "todas");
        console.log("total:", data.length, "sample:", data.slice(0, 2));
        console.log(`took ${(performance.now() - t0).toFixed(1)} ms`);
        console.groupEnd();
      }
    } catch (err: any) {
      if (!mountedRef.current) return;
      console.error("Error evaluaciones jefe:", err);
      setError("Error al cargar las evaluaciones");
      addToast({
        title: "No se pudo cargar",
        description: "Intenta nuevamente en unos minutos.",
        color: "danger",
        variant: "solid",
      });
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [soloMisEvaluaciones, debug]);

  useEffect(() => {
    mountedRef.current = true;
    fetchEvaluaciones();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchEvaluaciones]);

  const refresh = useCallback(() => {
    hasFetchedRef.current = false;
    fetchEvaluaciones();
  }, [fetchEvaluaciones]);

  // Filtrar evaluaciones por estado
  const evaluacionesFiltradas = useMemo(() => {
    if (filtroEstado === 'todas') return evaluaciones;
    return evaluaciones.filter(
      (evaluacion) => getEstadoEvaluacion(evaluacion) === filtroEstado
    );
  }, [evaluaciones, filtroEstado]);

  // Calcular contadores por estado
  const contadores = useMemo(() => {
    const counts = {
      pendientes: 0,
      completadas: 0,
      conReunion: 0,
      conRetroalimentacion: 0,
      cerradasParaFirma: 0,
      firmadas: 0,
      denegadas: 0,
    };

    evaluaciones.forEach((evaluacion) => {
      const estado = getEstadoEvaluacion(evaluacion);
      switch (estado) {
        case 'pendiente':
          counts.pendientes++;
          break;
        case 'retroalimentar':
          counts.conRetroalimentacion++;
          break;
        case 'firmar':
          counts.cerradasParaFirma++;
          break;
        case 'finalizado':
          counts.firmadas++;
          break;
      }
    });

    return counts;
  }, [evaluaciones]);

  return {
    evaluaciones,
    evaluacionesFiltradas,
    loading,
    error,
    refresh,
    contadores,
  };
}