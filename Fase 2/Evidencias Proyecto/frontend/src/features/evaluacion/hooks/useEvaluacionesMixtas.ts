// features/evaluacion/hooks/useEvaluacionesMixtas.ts
import { useEffect, useMemo, useState, useDeferredValue, useCallback } from "react";
import { fetchAsignarEvaluacion } from "@/features/evaluacion/services/asignar/evaluacion";
import { AsignacionEvaluacion } from "@/features/evaluacion/types/asignar/evaluacion";
import { flattenDetalles, filtrarDetalles, paginar } from "@/features/evaluacion/utils/evaluacionMixta";

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
        const data = await fetchAsignarEvaluacion();
        const conJefatura = data.filter(a => a.detalles && a.detalles.length > 0);
        setAsignaciones(conJefatura);
      } catch (e) {
        console.error(e);
        setError("Error al cargar las evaluaciones disponibles");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
    const años = Array.from(añosSet).sort((a, b) => b - a).map(n => ({ id: n.toString(), nombre: n.toString() }));

    return { tipos, años };
  }, [asignaciones]);

  // aplanar + filtrar + paginar
  const { items, total, totalPaginas } = useMemo(() => {
    const detalles = flattenDetalles(asignaciones); // (detalle + asignación)
    const filtrados = filtrarDetalles(detalles, {
      ...filtros,
      busqueda: deferredBusqueda, // suaviza tipeo
    });
    return paginar(filtrados, paginaActual, itemsPorPagina);
  }, [asignaciones, filtros, paginaActual, itemsPorPagina, deferredBusqueda]);

  // helpers para limpiar/actualizar
  const limpiarFiltros = useCallback(() => {
    setFiltros({ busqueda: "", tipoEvaluacion: "", año: "", estado: "" });
    setPaginaActual(1);
  }, []);

  return {
    // estado
    asignaciones, loading, error,
    filtros, setFiltros,
    paginaActual, setPaginaActual,
    vistaActual, setVistaActual,
    opcionesFiltros,
    // data
    items, total, totalPaginas,
    // acciones
    limpiarFiltros,
  };
}
