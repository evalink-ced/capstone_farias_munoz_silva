import { useState, useEffect, useCallback, useRef } from "react";

// Configuración del caché de imágenes
const IMAGE_CACHE_CONFIG = {
  MAX_CACHE_SIZE: 50, // Máximo 50 imágenes en caché
  CACHE_DURATION: 6 * 60 * 60 * 1000, // 6 horas
  STORAGE_KEY: "image_cache_data",
  TIMESTAMP_KEY: "image_cache_timestamp",
  CORS_FAILED_KEY: "cors_failed_urls",
  RETRY_DELAY: 5 * 60 * 1000, // 5 minutos antes de reintentar CORS
  MAX_RETRIES: 2, // Máximo 2 reintentos para URLs CORS
};

interface CachedImage {
  dataUrl: string;
  timestamp: number;
  size: number;
}

interface CorsFailedEntry {
  timestamp: number;
  retryCount: number;
}

interface ImageCacheData {
  [url: string]: CachedImage;
}

// Caché en memoria global para imágenes
let imageMemoryCache: ImageCacheData = {};
let cacheSize = 0;

// Lista mejorada de URLs que han fallado por CORS con timestamp y conteo de reintentos
let corsFailedUrls: Map<string, CorsFailedEntry> = new Map();

// Detectar dominios conocidos que causan CORS
const CORS_PRONE_DOMAINS = [
  "storage.googleapis.com",
  "googleusercontent.com",
  "drive.google.com",
  "lh3.googleusercontent.com",
];

// Función para verificar si una URL es propensa a CORS
const isCorsProneUrl = (url: string): boolean => {
  return CORS_PRONE_DOMAINS.some((domain) => url.includes(domain));
};

const useImageCache = () => {
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  // Función para obtener el tamaño estimado de una imagen en bytes
  const getImageSize = useCallback((dataUrl: string): number => {
    // Estimación basada en la longitud del data URL
    return dataUrl.length * 0.75; // Base64 es ~75% del tamaño real
  }, []);

  // Función para limpiar caché cuando está lleno
  const cleanupCache = useCallback(() => {
    const entries = Object.entries(imageMemoryCache);

    // Ordenar por timestamp (más antiguos primero)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Eliminar las imágenes más antiguas hasta llegar al 70% del límite
    const targetCount = Math.floor(IMAGE_CACHE_CONFIG.MAX_CACHE_SIZE * 0.7);
    const toRemove = entries.length - targetCount;

    for (let i = 0; i < toRemove; i++) {
      const [url, cachedImage] = entries[i];

      cacheSize -= cachedImage.size;
      delete imageMemoryCache[url];
    }
  }, []);

  // Función para guardar en localStorage
  const saveToStorage = useCallback(() => {
    try {
      const now = Date.now();
      const validCache: ImageCacheData = {};

      // Filtrar imágenes expiradas
      Object.entries(imageMemoryCache).forEach(([url, cachedImage]) => {
        if (now - cachedImage.timestamp < IMAGE_CACHE_CONFIG.CACHE_DURATION) {
          validCache[url] = cachedImage;
        }
      });

      // Filtrar URLs CORS fallidas expiradas
      const validCorsFailedUrls: Record<string, CorsFailedEntry> = {};

      corsFailedUrls.forEach((entry, url) => {
        if (now - entry.timestamp < IMAGE_CACHE_CONFIG.RETRY_DELAY * 3) {
          validCorsFailedUrls[url] = entry;
        }
      });

      localStorage.setItem(
        IMAGE_CACHE_CONFIG.STORAGE_KEY,
        JSON.stringify(validCache),
      );
      localStorage.setItem(IMAGE_CACHE_CONFIG.TIMESTAMP_KEY, now.toString());
      localStorage.setItem(
        IMAGE_CACHE_CONFIG.CORS_FAILED_KEY,
        JSON.stringify(validCorsFailedUrls),
      );
    } catch (error) {
      if (import.meta.env.DEV)
        console.warn("Error saving image cache to localStorage:", error);
      // Si localStorage está lleno, intentar limpiar
      try {
        localStorage.removeItem(IMAGE_CACHE_CONFIG.STORAGE_KEY);
        localStorage.removeItem(IMAGE_CACHE_CONFIG.TIMESTAMP_KEY);
        localStorage.removeItem(IMAGE_CACHE_CONFIG.CORS_FAILED_KEY);
      } catch (cleanupError) {
        if (import.meta.env.DEV)
          console.warn("Error cleaning localStorage:", cleanupError);
      }
    }
  }, []);

  // Función para cargar desde localStorage
  const loadFromStorage = useCallback(() => {
    try {
      const cachedData = localStorage.getItem(IMAGE_CACHE_CONFIG.STORAGE_KEY);
      const timestamp = localStorage.getItem(IMAGE_CACHE_CONFIG.TIMESTAMP_KEY);
      const corsFailedData = localStorage.getItem(
        IMAGE_CACHE_CONFIG.CORS_FAILED_KEY,
      );

      if (cachedData && timestamp) {
        const now = Date.now();
        const cacheTimestamp = parseInt(timestamp, 10);

        // Verificar si el caché no ha expirado
        if (now - cacheTimestamp < IMAGE_CACHE_CONFIG.CACHE_DURATION) {
          const parsedCache: ImageCacheData = JSON.parse(cachedData);

          // Filtrar imágenes expiradas individualmente
          Object.entries(parsedCache).forEach(([url, cachedImage]) => {
            if (
              now - cachedImage.timestamp <
              IMAGE_CACHE_CONFIG.CACHE_DURATION
            ) {
              imageMemoryCache[url] = cachedImage;
              cacheSize += cachedImage.size;
            }
          });
        }
      }

      // Cargar URLs CORS fallidas
      if (corsFailedData) {
        try {
          const parsedCorsData: Record<string, CorsFailedEntry> =
            JSON.parse(corsFailedData);
          const now = Date.now();

          Object.entries(parsedCorsData).forEach(([url, entry]) => {
            // Solo mantener entradas que no hayan expirado
            if (now - entry.timestamp < IMAGE_CACHE_CONFIG.RETRY_DELAY * 3) {
              corsFailedUrls.set(url, entry);
            }
          });
        } catch (corsError) {
          if (import.meta.env.DEV)
            console.warn("Error loading CORS failed URLs:", corsError);
        }
      }
    } catch (error) {
      if (import.meta.env.DEV)
        console.warn("Error loading image cache from localStorage:", error);
    }
  }, []);

  // Función para convertir imagen a data URL
  const imageToDataUrl = useCallback((img: HTMLImageElement): string => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("Could not get canvas context");

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.drawImage(img, 0, 0);

    return canvas.toDataURL("image/jpeg", 0.8); // Comprimir a 80% de calidad
  }, []);

  // Función para verificar si se puede reintentar una URL CORS fallida
  const canRetryCorsUrl = useCallback((url: string): boolean => {
    const corsEntry = corsFailedUrls.get(url);

    if (!corsEntry) return true;

    const now = Date.now();
    const timeSinceFailure = now - corsEntry.timestamp;

    // Si han pasado más de RETRY_DELAY minutos y no hemos excedido MAX_RETRIES
    return (
      timeSinceFailure > IMAGE_CACHE_CONFIG.RETRY_DELAY &&
      corsEntry.retryCount < IMAGE_CACHE_CONFIG.MAX_RETRIES
    );
  }, []);

  // Función para marcar una URL como fallida por CORS
  const markCorsFailure = useCallback(
    (url: string) => {
      const now = Date.now();
      const existingEntry = corsFailedUrls.get(url);

      corsFailedUrls.set(url, {
        timestamp: now,
        retryCount: existingEntry ? existingEntry.retryCount + 1 : 1,
      });

      // Guardar en localStorage ocasionalmente
      if (Math.random() < 0.2) {
        saveToStorage();
      }
    },
    [saveToStorage],
  );

  // Función para precargar y cachear una imagen
  const cacheImage = useCallback(
    async (url: string): Promise<string> => {
      // Verificar si esta URL ya falló por CORS y no se puede reintentar
      if (corsFailedUrls.has(url) && !canRetryCorsUrl(url)) {
        throw new Error("CORS_FAILED");
      }

      // Verificar si ya está en caché
      const cached = imageMemoryCache[url];

      if (cached) {
        const now = Date.now();

        if (now - cached.timestamp < IMAGE_CACHE_CONFIG.CACHE_DURATION) {
          return cached.dataUrl;
        } else {
          // Eliminar caché expirado
          cacheSize -= cached.size;
          delete imageMemoryCache[url];
        }
      }

      // Verificar si ya se está cargando
      if (loadingImages.has(url)) {
        // Esperar a que termine la carga actual
        return new Promise((resolve, reject) => {
          const checkInterval = setInterval(() => {
            if (!loadingImages.has(url)) {
              clearInterval(checkInterval);
              const cachedAfterLoad = imageMemoryCache[url];

              if (cachedAfterLoad) {
                resolve(cachedAfterLoad.dataUrl);
              } else {
                reject(new Error("Image failed to load"));
              }
            }
          }, 100);

          // Timeout después de 10 segundos
          setTimeout(() => {
            clearInterval(checkInterval);
            reject(new Error("Image loading timeout"));
          }, 10000);
        });
      }

      // Marcar como cargando
      setLoadingImages((prev) => new Set(prev).add(url));

      try {
        // Cancelar carga anterior si existe
        const existingController = abortControllersRef.current.get(url);

        if (existingController) {
          existingController.abort();
        }

        // Crear nuevo AbortController
        const abortController = new AbortController();

        abortControllersRef.current.set(url, abortController);

        // Cargar imagen
        const img = new Image();

        img.crossOrigin = "anonymous";

        const imagePromise = new Promise<string>((resolve, reject) => {
          img.onload = () => {
            try {
              const dataUrl = imageToDataUrl(img);
              const size = getImageSize(dataUrl);
              const now = Date.now();

              // Verificar si necesitamos limpiar caché
              if (
                Object.keys(imageMemoryCache).length >=
                IMAGE_CACHE_CONFIG.MAX_CACHE_SIZE
              ) {
                cleanupCache();
              }

              // Guardar en caché
              imageMemoryCache[url] = {
                dataUrl,
                timestamp: now,
                size,
              };
              cacheSize += size;

              // Guardar en localStorage periódicamente
              if (Math.random() < 0.1) {
                // 10% de probabilidad
                saveToStorage();
              }

              resolve(dataUrl);
            } catch (error) {
              reject(error);
            }
          };

          img.onerror = () => {
            // Marcar como fallida por CORS si es de un dominio propenso a CORS
            if (isCorsProneUrl(url)) {
              markCorsFailure(url);
              reject(new Error("CORS_FAILED"));
            } else {
              reject(new Error(`Failed to load image: ${url}`));
            }
          };

          // Manejar abort
          abortController.signal.addEventListener("abort", () => {
            reject(new Error("Image loading aborted"));
          });
        });

        img.src = url;

        const result = await imagePromise;

        // Limpiar AbortController
        abortControllersRef.current.delete(url);

        return result;
      } catch (error) {
        // Si es un error CORS, marcar la URL como fallida
        if (
          error instanceof Error &&
          (error.message.includes("CORS") || error.message === "CORS_FAILED")
        ) {
          if (isCorsProneUrl(url)) {
            markCorsFailure(url);
            const corsEntry = corsFailedUrls.get(url);

            if (import.meta.env.DEV)
              console.warn(
                `CORS error for image ${url}, retry ${corsEntry?.retryCount}/${IMAGE_CACHE_CONFIG.MAX_RETRIES}`,
              );
          }
        } else {
          if (import.meta.env.DEV)
            console.warn(`Error caching image ${url}:`, error);
        }
        throw error;
      } finally {
        // Marcar como no cargando
        setLoadingImages((prev) => {
          const newSet = new Set(prev);

          newSet.delete(url);

          return newSet;
        });
      }
    },
    [
      loadingImages,
      imageToDataUrl,
      getImageSize,
      cleanupCache,
      saveToStorage,
      canRetryCorsUrl,
      markCorsFailure,
    ],
  );

  // Función para obtener imagen cacheada (sin cargar si no existe)
  const getCachedImage = useCallback((url: string): string | null => {
    const cached = imageMemoryCache[url];

    if (cached) {
      const now = Date.now();

      if (now - cached.timestamp < IMAGE_CACHE_CONFIG.CACHE_DURATION) {
        return cached.dataUrl;
      } else {
        // Eliminar caché expirado
        cacheSize -= cached.size;
        delete imageMemoryCache[url];
      }
    }

    return null;
  }, []);

  // Función para limpiar todo el caché
  const clearCache = useCallback(() => {
    imageMemoryCache = {};
    cacheSize = 0;
    corsFailedUrls.clear(); // Limpiar también las URLs fallidas por CORS
    localStorage.removeItem(IMAGE_CACHE_CONFIG.STORAGE_KEY);
    localStorage.removeItem(IMAGE_CACHE_CONFIG.TIMESTAMP_KEY);
    localStorage.removeItem(IMAGE_CACHE_CONFIG.CORS_FAILED_KEY);

    // Cancelar todas las cargas en progreso
    abortControllersRef.current.forEach((controller) => {
      controller.abort();
    });
    abortControllersRef.current.clear();
    setLoadingImages(new Set());
  }, []);

  // Cargar caché desde localStorage al inicializar
  useEffect(() => {
    loadFromStorage();

    // Guardar caché al cerrar la página
    const handleBeforeUnload = () => {
      saveToStorage();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);

      // Cancelar todas las cargas en progreso
      abortControllersRef.current.forEach((controller) => {
        controller.abort();
      });
      abortControllersRef.current.clear();
    };
  }, [loadFromStorage, saveToStorage]);

  // Función para limpiar solo las URLs CORS fallidas
  const clearCorsFailures = useCallback(() => {
    corsFailedUrls.clear();
    localStorage.removeItem(IMAGE_CACHE_CONFIG.CORS_FAILED_KEY);
  }, []);

  return {
    cacheImage,
    getCachedImage,
    clearCache,
    clearCorsFailures,
    isLoading: (url: string) => loadingImages.has(url),
    cacheStats: {
      size: Object.keys(imageMemoryCache).length,
      maxSize: IMAGE_CACHE_CONFIG.MAX_CACHE_SIZE,
      totalBytes: cacheSize,
      corsFailedCount: corsFailedUrls.size,
    },
  };
};

export default useImageCache;
