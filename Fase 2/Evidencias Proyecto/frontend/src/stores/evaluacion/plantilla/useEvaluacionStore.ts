import { create } from "zustand";
import type { AreaEvaluacion } from "@/features/evaluacion/types/evaluacion";
import { defaultArea } from "@/features/evaluacion/utils/defaultArea";
import { cloneNiveles } from "@/features/evaluacion/constants/defaults";
import { buildDemoAutoevaluacion } from "@/features/evaluacion/services/autofill";

interface EvaluacionState {
  nombreTipoEvaluacion: string;
  areas: AreaEvaluacion[];
  activeAreaIndex: number;
  activeCompetenciaIndex: number;
  activeIndicadorIndex: number;

  setNombre: (nombre: string) => void;
  setAreas: (areas: AreaEvaluacion[]) => void;

  setActiveAreaIndex: (i: number) => void;
  setActiveCompetenciaIndex: (i: number) => void;
  setActiveIndicadorIndex: (i: number) => void;

  addArea: () => void;
  removeArea: (index: number) => void;

  onCompetenciaChange: (
    areaIndex: number,
    competenciaIndex: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;

  addCompetencia: (areaIndex: number) => void;
  removeCompetencia: (areaIndex: number, compIndex: number) => void;

  addIndicador: (areaIndex: number, compIndex: number) => void;
  removeIndicador: (
    areaIndex: number,
    compIndex: number,
    indIndex: number,
  ) => void;

  updateIndicadorTexto: (
    aIdx: number,
    cIdx: number,
    iIdx: number,
    texto: string,
  ) => void;
  updateIndicadorDefinicion: (
    aIdx: number,
    cIdx: number,
    iIdx: number,
    definicion: string,
  ) => void;
  updateNivelDescripcion: (
    aIdx: number,
    cIdx: number,
    iIdx: number,
    nIdx: number,
    descripcion: string,
  ) => void;
  updateNivelPuntaje: (
    aIdx: number,
    cIdx: number,
    iIdx: number,
    nIdx: number,
    puntaje: string,
  ) => void;
  updateNivelNombre: (
    aIdx: number,
    cIdx: number,
    iIdx: number,
    nIdx: number,
    nombre: string,
  ) => void;
  validarFormulario: () => string[];
  resetEvaluacion: () => void;

  updatePonderacion: (index: number, value: number) => void;
  autorellenarAutoevaluacion: () => void;
}

const useEvaluacionStore = create<EvaluacionState>((set) => ({
  nombreTipoEvaluacion: "",
  areas: [JSON.parse(JSON.stringify(defaultArea))],
  activeAreaIndex: 0,
  activeCompetenciaIndex: 0,
  activeIndicadorIndex: 0,

  setNombre: (nombre) => set({ nombreTipoEvaluacion: nombre }),
  setAreas: (areas) => set({ areas }),
  setActiveAreaIndex: (i) => set({ activeAreaIndex: i }),
  setActiveCompetenciaIndex: (i) => set({ activeCompetenciaIndex: i }),
  setActiveIndicadorIndex: (i) => set({ activeIndicadorIndex: i }),

  validarFormulario: () => {
    const { nombreTipoEvaluacion, areas } = useEvaluacionStore.getState();
    let errores: string[] = [];

    if (!nombreTipoEvaluacion.trim()) {
      errores.push("El nombre de la evaluación es obligatorio.");
    }

    areas.forEach((area, aIdx) => {
      if (!area.n_area.trim()) {
        errores.push(`Área ${aIdx + 1} debe tener un nombre.`);
      }
      area.competencias.forEach((comp, cIdx) => {
        if (!comp.name.trim()) {
          errores.push(
            `Competencia ${cIdx + 1} del Área ${aIdx + 1} debe tener un nombre.`,
          );
        }
        comp.indicadores.forEach((ind, iIdx) => {
          if (!ind.indicador.trim()) {
            errores.push(
              `Indicador ${iIdx + 1} en Competencia ${cIdx + 1} del Área ${aIdx + 1} debe tener texto.`,
            );
          }
        });
      });
    });

    return errores;
  },

  addArea: () =>
    set((state) => {
      const updated = [...state.areas, JSON.parse(JSON.stringify(defaultArea))];

      return {
        areas: updated,
        activeAreaIndex: updated.length - 1,
        activeCompetenciaIndex: 0,
        activeIndicadorIndex: 0,
      };
    }),

  updatePonderacion: (index: number, value: number) =>
    set((state) => {
      const updated = [...state.areas];

      updated[index].ponderacion = value;

      return { areas: updated };
    }),

  onCompetenciaChange: (
    areaIndex: number,
    competenciaIndex: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) =>
    set((state) => {
      const updated = [...state.areas];

      updated[areaIndex].competencias[competenciaIndex].name = e.target.value;

      return { areas: updated };
    }),

  removeArea: (index) =>
    set((state) => {
      const updated = state.areas.filter((_, i) => i !== index);

      return {
        areas:
          updated.length > 0
            ? updated
            : [JSON.parse(JSON.stringify(defaultArea))],
        activeAreaIndex: 0,
      };
    }),

  addCompetencia: (areaIndex) =>
    set((state) => {
      const updated = [...state.areas];

      updated[areaIndex].competencias.push({
        id: Date.now() + Math.random(), // Generar un ID único temporal
        name: "",
        indicadores: [
          {
            numero: 1,
            id: 1,
            indicador: "",
            definicion: "",
            nvlindicadores: cloneNiveles(), // ✅ usar clon también aquí
          },
        ],
      });

      return {
        areas: updated,
        activeCompetenciaIndex: updated[areaIndex].competencias.length - 1,
        activeIndicadorIndex: 0,
      };
    }),

  removeCompetencia: (areaIndex, compIndex) =>
    set((state) => {
      const updated = [...state.areas];

      updated[areaIndex].competencias = updated[areaIndex].competencias.filter(
        (_, i) => i !== compIndex,
      );

      return { areas: updated, activeCompetenciaIndex: 0 };
    }),

  addIndicador: (areaIndex, compIndex) =>
    set((state) => {
      // Clonar profundamente solo la parte afectada
      const areas = [...state.areas];
      const competencias = [...areas[areaIndex].competencias];
      const indicadores = competencias[compIndex].indicadores.map((i) => ({
        ...i,
        nvlindicadores: i.nvlindicadores.map((n) => ({ ...n })),
      }));

      indicadores.push({
        numero: indicadores.length + 1, // opcional: numeración automática
        id: Date.now(), // opcional: id único
        indicador: "",
        definicion: "",
        nvlindicadores: cloneNiveles(),
      });

      competencias[compIndex] = {
        ...competencias[compIndex],
        indicadores,
      };

      areas[areaIndex] = {
        ...areas[areaIndex],
        competencias,
      };

      return {
        areas,
        activeIndicadorIndex: indicadores.length - 1,
      };
    }),

  removeIndicador: (areaIndex, compIndex, indIndex) =>
    set((state) => {
      const updated = [...state.areas];

      updated[areaIndex].competencias[compIndex].indicadores = updated[
        areaIndex
      ].competencias[compIndex].indicadores.filter((_, i) => i !== indIndex);

      return { areas: updated, activeIndicadorIndex: 0 };
    }),

  updateIndicadorTexto: (aIdx, cIdx, iIdx, texto) =>
    set((state) => {
      const updated = [...state.areas];

      updated[aIdx].competencias[cIdx].indicadores[iIdx].indicador = texto;

      return { areas: updated };
    }),

  updateIndicadorDefinicion: (
    areaIndex: number,
    competenciaIndex: number,
    indicadorIndex: number,
    definicion: string,
  ) =>
    set((state) => {
      const updatedAreas = [...state.areas];

      updatedAreas[areaIndex].competencias[competenciaIndex].indicadores[
        indicadorIndex
      ].definicion = definicion;

      return { areas: updatedAreas };
    }),

  updateNivelDescripcion: (aIdx, cIdx, iIdx, nIdx, descripcion) =>
    set((state) => {
      const updated = [...state.areas];

      updated[aIdx].competencias[cIdx].indicadores[iIdx].nvlindicadores[
        nIdx
      ].descripcion = descripcion;

      return { areas: updated };
    }),

  updateNivelPuntaje: (aIdx, cIdx, iIdx, nIdx, puntaje) =>
    set((state) => {
      const updated = [...state.areas];

      updated[aIdx].competencias[cIdx].indicadores[iIdx].nvlindicadores[
        nIdx
      ].puntaje = Number(puntaje);

      return { areas: updated };
    }),
  updateNivelNombre: (
    aIdx: number,
    cIdx: number,
    iIdx: number,
    nIdx: number,
    nombre: string,
  ) =>
    set((state) => {
      const updated = [...state.areas];

      updated[aIdx].competencias[cIdx].indicadores[iIdx].nvlindicadores[
        nIdx
      ].nombre = nombre;

      return { areas: updated };
    }),

  autorellenarAutoevaluacion: () =>
    set(() => {
      const { nombreTipoEvaluacion, areas } = buildDemoAutoevaluacion();
      return {
        nombreTipoEvaluacion,
        areas,
        activeAreaIndex: 0,
        activeCompetenciaIndex: 0,
        activeIndicadorIndex: 0,
      };
    }),
  resetEvaluacion: () =>
    set({
      nombreTipoEvaluacion: "",
      areas: [JSON.parse(JSON.stringify(defaultArea))],
      activeAreaIndex: 0,
      activeCompetenciaIndex: 0,
      activeIndicadorIndex: 0,
    }),
}));

export default useEvaluacionStore;
