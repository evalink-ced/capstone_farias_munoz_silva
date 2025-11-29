export interface Usuario {
  nombre: string;
  cargo: string;
}

export interface AnioGroup {
  anio: number;
}

export interface CapacitacionPorTitulo {
  nombre: string;
  anios: AnioGroup[];
}

export interface TituloGroup {
  titulo: string;
  capacitaciones: CapacitacionPorTitulo[];
}
