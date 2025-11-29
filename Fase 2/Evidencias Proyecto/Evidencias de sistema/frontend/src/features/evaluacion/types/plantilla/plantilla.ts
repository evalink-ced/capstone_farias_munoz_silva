// types/evaluacion/handlers.ts

export interface IndicadorHandlers {
  onChange: IndicadorChangeHandler;
  onDefinicionChange: IndicadorChangeHandler;
  onAdd: (areaIndex: number, competenciaIndex: number) => void;
  onRemove: (
    areaIndex: number,
    competenciaIndex: number,
    indicadorIndex: number,
  ) => void;
}

export type IndicadorChangeHandler = (
  areaIndex: number,
  competenciaIndex: number,
  indicadorIndex: number,

  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
) => void;

export interface NivelHandlers {
  onChange: (
    areaIndex: number,
    competenciaIndex: number,
    indicadorIndex: number,
    nivelIndex: number,
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  onPuntajeChange: (
    areaIndex: number,
    competenciaIndex: number,
    indicadorIndex: number,
    nivelIndex: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  onNombreChange: (
    areaIndex: number,
    competenciaIndex: number,
    indicadorIndex: number,
    nivelIndex: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
}

export interface CompetenciaHandlers {
  onChange: (
    areaIndex: number,
    competenciaIndex: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  onAdd: (areaIndex: number) => void;
  onRemove: (areaIndex: number, competenciaIndex: number) => void;
}
