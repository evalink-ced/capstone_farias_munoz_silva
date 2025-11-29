export interface Asociacion {
  id: number;
  title: string;
  text: string;
  file?: string;
  url?: string;
  icono?: string;
  thumbnail?: string;
  archivo: string | null; // 👈 importante
  has_file: false;
  empresas?: {
    id: number;
    nombre: string;
  }[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BeneficiosResponse {
  emp: Asociacion[];
  css_file?: string;
}

export interface BeneficiosApiResponse {
  results: Asociacion[];
  count: number;
  css_file?: string;
}
