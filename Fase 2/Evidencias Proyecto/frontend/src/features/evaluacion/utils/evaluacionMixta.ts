// features/evaluacion/utils/evaluacionMixta.ts
import { AsignacionEvaluacion, DetalleAsignacion } from "@/features/evaluacion/types/asignar/evaluacion";
import { FiltrosEvaluacion } from "../hooks/useEvaluacionesMixtas";

export type DetalleConAsignacion = DetalleAsignacion & { asignacion: AsignacionEvaluacion };

export function flattenDetalles(asignaciones: AsignacionEvaluacion[]): DetalleConAsignacion[] {
  const out: DetalleConAsignacion[] = [];
  for (const a of asignaciones) {
    if (a.detalles?.length) {
      for (const d of a.detalles) out.push({ ...d, asignacion: a });
    }
  }
  return out;
}

export function filtrarDetalles(list: DetalleConAsignacion[], filtros: FiltrosEvaluacion): DetalleConAsignacion[] {
  if (filtros.tipoEvaluacion) {
    list = list.filter(item => item.asignacion.tipo_evaluacion.n_tipo_evaluacion === filtros.tipoEvaluacion);
  }
  
  if (filtros.busqueda) {
    const q = filtros.busqueda.toLowerCase();
    list = list.filter(item =>
      `${item.persona.first_name} ${item.persona.last_name}`.toLowerCase().includes(q) ||
      `${item.evaluador.first_name} ${item.evaluador.last_name}`.toLowerCase().includes(q) ||
      item.asignacion.tipo_evaluacion.n_tipo_evaluacion.toLowerCase().includes(q)
    );
  }

  if (filtros.año) {
    list = list.filter(item => new Date(item.asignacion.fecha_evaluacion).getFullYear().toString() === filtros.año);
  }

  // si luego agregas estado:
  if (filtros.estado) {
    // list = list.filter(item => item.estado === filtros.estado);
  }

  return list;
}

export function paginar<T>(arr: T[], paginaActual: number, itemsPorPagina: number) {
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const fin = inicio + itemsPorPagina;
  const items = arr.slice(inicio, fin);
  const total = arr.length;
  const totalPaginas = Math.ceil(total / itemsPorPagina) || 1;
  return { items, total, totalPaginas };
}
