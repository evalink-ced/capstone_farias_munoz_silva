export interface User {
  id: number;
  foto: string;
  foto_thumbnail: string;
  first_name: string;
  last_name: string;
  genero: string | null;

  is_superuser: boolean;
  edad: Date;
  empresa: Empresa | string | null | number;

  date_joined: string;
  username: string;
  cargo: string | null;
  email: string;
  telefono?: string;
  evaluacion: Evaluation[];

  jefe: string | null;
  group: number;
  rut: string;
  tiempo_en: string;
}

export interface Empresa {
  id: number;
  logo: string;
  empresa: string;
  name: string;
}



export interface Competencia {
  id: number;
  aeva: number;
  aeva_name: string;
  name: string;
  compeindicador_set: {
    id: number;
    competencia: number;
    indicador: string;
    numero: number;
    nvlindicadores: {
      id: number;
      descripcion: string;
      compe_indicador: number;
      nvl: number;
    }[];
  }[];
}

export interface Evaluation {
  id: number;
  porcentaje: number;
  drive_url?: string; // URL del archivo
  anio: string; // Ej: "202407"
  fecha_creacion: string;
}
