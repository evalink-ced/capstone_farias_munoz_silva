// types/formulario.ts

export type Userlicencia = {
  id: number;
  username: string;
  rut: string;
  codigo: string;
  ciclo: string;
  empresa: string;
};

// Payload que se envía al backend
export type LicenciaPayload = {
  user: number;
  folio_licencia: string;
  desde: string; // ID (PK) del motivo seleccionado
  hasta: string; // ID (PK) de la jornada seleccionada
  jornada: string; // Fecha en formato 'YYYY-MM-DD'
  tipo: string;
  dias: string;
};

export type LicenciaResponse = {
  message: string;
};

export type OpcionJornada = {
  id: number;
  jornada: string;
};

export type OpcionTipo = {
  id: number;
  tipo: string;
};
