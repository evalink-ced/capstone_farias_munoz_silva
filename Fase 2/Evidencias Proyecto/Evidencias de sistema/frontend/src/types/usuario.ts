// types.ts
export interface UsuarioDias {
  id: number;
  first_name: string;
  last_name: string;
  dias_tomados: number;
  dias_restantes: number;
  dias_cumpleaños: number;
  birthday: string | null;
}
