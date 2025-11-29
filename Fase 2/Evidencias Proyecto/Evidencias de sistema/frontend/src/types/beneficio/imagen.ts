export interface ImagenBeneficio {
  id: number;
  name: string;
  description?: string;
  image?: string; // Campo original del modelo (opcional)
  url: string; // URL del archivo de imagen desde el API
  image_url?: string; // URL absoluta del archivo de imagen (para compatibilidad)
  thumbnail_url?: string; // URL de la miniatura
  alt_text?: string;
  width?: number;
  height?: number;
  file_size: string; // Tamaño en formato legible
  file_size_display?: string; // Tamaño en formato legible (opcional)
  created_at: string;
  updated_at?: string;
  is_active?: boolean;
}

export interface ImagenBeneficioCreate {
  nombre: string; // Se mapea a 'name' en el backend
  descripcion?: string; // Se mapea a 'description' en el backend
  archivo: File; // Se mapea a 'image' en el backend
}

export interface ImagenBeneficioUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface ImagenesResponse {
  value: ImagenBeneficio[]; // El API devuelve 'value' en lugar de 'results'
  results?: ImagenBeneficio[]; // Para compatibilidad con versiones anteriores
  count: number;
  Count?: number; // El API puede devolver 'Count' con mayúscula
  next?: string;
  previous?: string;
}

export interface ImagenUploadResponse {
  id: number;
  url: string;
  thumbnail_url?: string;
  message: string;
}
