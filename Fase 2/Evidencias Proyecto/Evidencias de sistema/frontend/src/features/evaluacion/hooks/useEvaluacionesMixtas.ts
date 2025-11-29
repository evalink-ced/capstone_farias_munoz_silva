// features/evaluacion/hooks/useEvaluacionesMixtas.ts
import {
  useEffect,
  useMemo,
  useState,
  useDeferredValue,
  useCallback,
} from "react";

import { listarEvaluacionesMixtas } from "@/features/evaluacion/services/evaluacionMixta";
import { AsignacionEvaluacion } from "@/features/evaluacion/types/asignar/evaluacion";
import {
  flattenDetalles,
  paginar,
} from "@/features/evaluacion/utils/evaluacionMixta";

export type Vista = "tarjetas" | "tabla";

export interface FiltrosEvaluacion {
  busqueda: string;
  tipoEvaluacion: string;
  año: string;
  estado: string; // reservado por si luego filtras por estado
}

export function useEvaluacionesMixtas(itemsPorPagina = 6) {
  const [asignaciones, setAsignaciones] = useState<AsignacionEvaluacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingGate] = useState(false);

  const [filtros, setFiltros] = useState<FiltrosEvaluacion>({
    busqueda: "",
    tipoEvaluacion: "",
    año: "",
    estado: "",
  });

  const [paginaActual, setPaginaActual] = useState(1);
  const [vistaActual, setVistaActual] = useState<Vista>("tarjetas");

  // optimiza búsquedas largas
  const deferredBusqueda = useDeferredValue(filtros.busqueda);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await listarEvaluacionesMixtas({
          q: deferredBusqueda || undefined,
          tipo: filtros.tipoEvaluacion || undefined,
          anio: filtros.año || undefined,
          scope: "all",
        });

        setAsignaciones(data);
      } catch (e) {
        console.error(e);
        setError("Error al cargar las evaluaciones disponibles");
      } finally {
        setLoading(false);
      }
    })();
  }, [deferredBusqueda, filtros.tipoEvaluacion, filtros.año]);

  // opciones únicas para selects
  const opcionesFiltros = useMemo(() => {
    const tiposMap = new Map<string, { id: string; nombre: string }>();
    const añosSet = new Set<number>();

    for (const a of asignaciones) {
      // Use n_tipo_evaluacion as both key and value since TipoEvaluacionLite doesn't have id
      tiposMap.set(a.tipo_evaluacion.n_tipo_evaluacion, {
        id: a.tipo_evaluacion.n_tipo_evaluacion,
        nombre: a.tipo_evaluacion.n_tipo_evaluacion,
      });
      añosSet.add(new Date(a.fecha_evaluacion).getFullYear());
    }

    const tipos = Array.from(tiposMap.values());
    const años = Array.from(añosSet)
      .sort((a, b) => b - a)
      .map((n) => ({ id: n.toString(), nombre: n.toString() }));

    return { tipos, años };
  }, [asignaciones]);

  const { items, total, totalPaginas } = useMemo(() => {
    const detalles = flattenDetalles(asignaciones);

    return paginar(detalles, paginaActual, itemsPorPagina);
  }, [asignaciones, paginaActual, itemsPorPagina]);

  // helpers para limpiar/actualizar
  const limpiarFiltros = useCallback(() => {
    setFiltros({ busqueda: "", tipoEvaluacion: "", año: "", estado: "" });
    setPaginaActual(1);
  }, []);

  return {
    // estado
    asignaciones,
    loading: loading || loadingGate,
    error,
    filtros,
    setFiltros,
    paginaActual,
    setPaginaActual,
    vistaActual,
    setVistaActual,
    opcionesFiltros,
    // data
    items,
    total,
    totalPaginas,
    // acciones
    limpiarFiltros,
  };
}
