import { create } from "zustand";

import { TipoEvaluacion } from "@/features/evaluacion/types/evaluacion";
import { Usuario } from "@/features/evaluacion/types/asignar/evaluacion";

interface EvaluacionAsignadaState {
  tipoEvaluacion: TipoEvaluacion | null;
  fechaEvaluacion: string;
  usuariosSeleccionados: Usuario[];

  setTipoEvaluacion: (tipo: TipoEvaluacion) => void;
  setFechaEvaluacion: (fecha: string) => void;
  setUsuariosSeleccionados: (usuarios: Usuario[]) => void;
  toggleUsuario: (usuario: Usuario) => void;
  agregarUsuarios: (usuarios: Usuario[]) => void;
  removerUsuariosPorId: (ids: number[]) => void;
  resetAsignacion: () => void;
}

const useEvaluacionAsignadaStore = create<EvaluacionAsignadaState>((set) => ({
  tipoEvaluacion: null,
  fechaEvaluacion: "",
  usuariosSeleccionados: [],

  setTipoEvaluacion: (tipo) => set({ tipoEvaluacion: tipo }),
  setFechaEvaluacion: (fecha) => set({ fechaEvaluacion: fecha }),
  setUsuariosSeleccionados: (usuarios) =>
    set({ usuariosSeleccionados: usuarios }),

  agregarUsuarios: (nuevos) =>
    set((state) => {
      const existentes = state.usuariosSeleccionados.map((u) => u.id);
      const filtrados = nuevos.filter((u) => !existentes.includes(u.id));

      return {
        usuariosSeleccionados: [...state.usuariosSeleccionados, ...filtrados],
      };
    }),

  removerUsuariosPorId: (ids) =>
    set((state) => ({
      usuariosSeleccionados: state.usuariosSeleccionados.filter(
        (u) => !ids.includes(u.id),
      ),
    })),

  toggleUsuario: (usuario) =>
    set((state) => {
      const existe = state.usuariosSeleccionados.find(
        (u) => u.id === usuario.id,
      );

      return {
        usuariosSeleccionados: existe
          ? state.usuariosSeleccionados.filter((u) => u.id !== usuario.id)
          : [...state.usuariosSeleccionados, usuario],
      };
    }),

  resetAsignacion: () =>
    set({
      tipoEvaluacion: null,
      fechaEvaluacion: "",
      usuariosSeleccionados: [],
    }),
}));

export default useEvaluacionAsignadaStore;
