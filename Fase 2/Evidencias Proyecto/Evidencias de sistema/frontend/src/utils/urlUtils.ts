/**
 * Utilidades para manejo de URLs de imágenes y archivos
 */

/**
 * Construye una URL completa para un archivo, manejando automáticamente:
 * - URLs completas de Google Cloud Storage
 * - URLs relativas del backend local
 * - URLs ya completas con protocolo
 *
 * @param fileUrl - La URL del archivo (puede ser relativa o absoluta)
 * @param baseUrl - URL base para URLs relativas (opcional, usa VITE_API_URL por defecto)
 * @returns URL completa y válida
 */
export const buildFileUrl = (fileUrl?: string, baseUrl?: string): string => {
  if (!fileUrl) {
    console.warn("buildFileUrl recibió un valor undefined o vacío");

    return "";
  }

  // Limpiar la URL de espacios en blanco y caracteres extraños
  const cleanUrl = fileUrl.trim();

  // evitar logs en producción

  // Si ya es una URL completa (http/https), devolverla tal como está
  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
    return cleanUrl;
  }

  // Si contiene googleapis.com, es una URL de GCS que no necesita prefijo
  if (
    cleanUrl.includes("googleapis.com") ||
    cleanUrl.includes("storage.googleapis.com")
  ) {
    // Si no tiene protocolo, agregarlo
    const result = cleanUrl.startsWith("//")
      ? `https:${cleanUrl}`
      : `https://${cleanUrl}`;

    return result;
  }

  // Para URLs relativas del backend local
  const apiBaseUrl =
    baseUrl || import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
  const fullUrl = `${apiBaseUrl}${cleanUrl.startsWith("/") ? cleanUrl : "/" + cleanUrl}`;

  return fullUrl;
};

/**
 * Alias específico para URLs de imágenes
 * @param imageUrl - URL de la imagen
 * @returns URL completa de la imagen
 */
export const getImageUrl = (imageUrl?: string): string => {
  return buildFileUrl(imageUrl);
};

/**
 * Alias específico para URLs de miniaturas
 * @param thumbnailUrl - URL de la miniatura
 * @returns URL completa de la miniatura
 */
export const getThumbnailUrl = (thumbnailUrl?: string): string => {
  return buildFileUrl(thumbnailUrl);
};

/**
 * Verifica si una URL es de Google Cloud Storage
 * @param url - URL a verificar
 * @returns true si es una URL de GCS
 */
export const isGoogleCloudStorageUrl = (url: string): boolean => {
  return (
    url.includes("googleapis.com") || url.includes("storage.googleapis.com")
  );
};

/**
 * Verifica si una URL es absoluta (tiene protocolo)
 * @param url - URL a verificar
 * @returns true si es una URL absoluta
 */
export const isAbsoluteUrl = (url: string): boolean => {
  return url.startsWith("http") || url.startsWith("//");
};
