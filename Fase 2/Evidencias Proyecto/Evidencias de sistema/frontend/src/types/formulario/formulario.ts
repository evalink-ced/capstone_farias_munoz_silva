// types/formulario.ts
import { DateValue } from "@internationalized/date";

// Payload que se envía al backend
export type FormularioPayload = {
  user: string;
  jefe: string;
  motivo: number; // ID (PK) del motivo seleccionado
  jornada: number; // ID (PK) de la jornada seleccionada
  fecha: DateValue; // Fecha en formato 'YYYY-MM-DD'
  hora_ingreso: string;
  hora_regreso: string;
  observacion: string;
};
export interface FormularioBackendPayload {
  user: string;
  jefe: string;
  fecha: string; // en formato ISO: "2025-07-15"
  motivo: number;
  jornada: number;
  hora_ingreso: string;
  hora_regreso: string;
  observacion: string;
}
// Respuesta de envío exitoso
export type FormularioResponse = {
  message: string;
};

// Motivos y jornadas (opciones)
export type OpcionMotivo = {
  id: number;
  motivo: string;
};

export type OpcionJornada = {
  id: number;
  jornada: string;
};

export type FormularioOpciones = {
  motivos: OpcionMotivo[];
  jornadas: OpcionJornada[];
  mensaje_beneficio: string;
};
