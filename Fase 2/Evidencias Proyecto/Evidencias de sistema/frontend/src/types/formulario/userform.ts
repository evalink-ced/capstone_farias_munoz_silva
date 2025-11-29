// types/formulario/FormularioUser.ts

export interface FormularioUser {
  email: string;
  jefe: string | null;
  dias_tomados: number;
  dias_restantes: number;
  birthday: string;
  username: string;
}

export interface UserIndex {
  username: string;
  empresa: number;
  group: number;
}

export interface FormularioProfile {
  id: number;
  user: string;
  motivo: string;
  jornada: string;
  fecha: string;
  hora_ingreso: string;
  hora_regreso: string;
  created_at: string;
  estado: string;
  jefe: string | null;
  dias_tomados: number;
  dias_restantes: number;
}
