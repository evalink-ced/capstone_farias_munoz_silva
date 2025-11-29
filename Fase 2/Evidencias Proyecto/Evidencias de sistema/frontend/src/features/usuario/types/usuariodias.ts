// Usuario Dias Interface

export interface UsuarioDias {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  rut: string;
  ciclo: string;
  empresa: string;
  dias_disponibles: number;
  dias_tomados: number;
}
