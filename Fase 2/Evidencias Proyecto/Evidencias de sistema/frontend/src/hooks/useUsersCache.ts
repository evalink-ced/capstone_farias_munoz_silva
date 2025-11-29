import { useState, useEffect, useCallback, useRef } from "react";

import { User } from "../types/types";

import { fetchAllUsers } from "@/api/user/user";

const CACHE_CONFIG = {
  MEMORY_TTL: 5 * 60 * 1000, // 5 minutos en memoria
  STORAGE_TTL: 30 * 60 * 1000, // 30 minutos en localStorage
  STORAGE_KEY: "users_cache_data",
  TIMESTAMP_KEY: "users_cache_timestamp",
  VERSION_KEY: "users_cache_version",
  CURRENT_VERSION: "1.2.0", // Incrementar versión para limpiar caché corrupto
};

interface CacheData {
  users: User[];
  timestamp: number;
  version: string;
}

// Variables globales para el caché
let memoryCache: CacheData | null = null;

const useUsersCache = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true); // Cambiar a true inicialmente
  const [error, setError] = useState<string | null>(null);
  const [searchTermState, setSearchTermState] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const isInitializedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Función mejorada para obtener usuarios
  const fetchUsers = useCallback(async (searchQuery?: string) => {
    if (import.meta.env.DEV)
      console.log("🔍 Fetching users with query:", searchQuery);

    try {
      // Si hay búsqueda, usar el backend; si no, usar caché
      if (searchQuery && searchQuery.trim()) {
        if (import.meta.env.DEV)
          console.log("📡 Fetching from backend with search query");
        const users = await fetchAllUsers(searchQuery.trim());

        if (import.meta.env.DEV)
          console.log("✅ Search results:", users.length, "users");

        return users;
      } else {
        // Lógica de caché existente para cuando no hay búsqueda
        const now = Date.now();

        // Verificar caché en memoria
        if (
          memoryCache &&
          memoryCache.version === CACHE_CONFIG.CURRENT_VERSION &&
          now - memoryCache.timestamp < CACHE_CONFIG.MEMORY_TTL
        ) {
          if (import.meta.env.DEV)
            console.log(
              "💾 Using memory cache:",
              memoryCache.users.length,
              "users",
            );

          return memoryCache.users;
        }

        // Verificar caché en localStorage
        try {
          const cachedData = localStorage.getItem(CACHE_CONFIG.STORAGE_KEY);
          const cachedTimestamp = localStorage.getItem(
            CACHE_CONFIG.TIMESTAMP_KEY,
          );
          const cachedVersion = localStorage.getItem(CACHE_CONFIG.VERSION_KEY);

          if (
            cachedData &&
            cachedTimestamp &&
            cachedVersion === CACHE_CONFIG.CURRENT_VERSION
          ) {
            const timestamp = parseInt(cachedTimestamp);

            if (now - timestamp < CACHE_CONFIG.STORAGE_TTL) {
              const users = JSON.parse(cachedData);

              if (import.meta.env.DEV)
                console.log(
                  "💽 Using localStorage cache:",
                  users.length,
                  "users",
                );
              // Actualizar caché en memoria
              memoryCache = {
                users,
                timestamp,
                version: CACHE_CONFIG.CURRENT_VERSION,
              };

              return users;
            }
          }
        } catch (error) {
          if (import.meta.env.DEV)
            console.warn("⚠️ Error al leer caché del localStorage:", error);
          // Limpiar caché corrupto
          localStorage.removeItem(CACHE_CONFIG.STORAGE_KEY);
          localStorage.removeItem(CACHE_CONFIG.TIMESTAMP_KEY);
          localStorage.removeItem(CACHE_CONFIG.VERSION_KEY);
        }

        // Obtener datos frescos del servidor
        if (import.meta.env.DEV)
          console.log("📡 Fetching fresh data from server");
        const users = await fetchAllUsers();

        if (import.meta.env.DEV)
          console.log("✅ Fresh data received:", users.length, "users");

        // Validar que los datos sean válidos
        if (!Array.isArray(users)) {
          if (import.meta.env.DEV)
            console.error("❌ Invalid data format received:", users);
          throw new Error("Formato de datos inválido recibido del servidor");
        }

        // Actualizar ambos cachés
        const cacheData = {
          users,
          timestamp: now,
          version: CACHE_CONFIG.CURRENT_VERSION,
        };

        memoryCache = cacheData;

        try {
          localStorage.setItem(CACHE_CONFIG.STORAGE_KEY, JSON.stringify(users));
          localStorage.setItem(CACHE_CONFIG.TIMESTAMP_KEY, now.toString());
          localStorage.setItem(
            CACHE_CONFIG.VERSION_KEY,
            CACHE_CONFIG.CURRENT_VERSION,
          );
          if (import.meta.env.DEV) console.log("💾 Cache updated successfully");
        } catch (error) {
          if (import.meta.env.DEV)
            console.warn("⚠️ Error al guardar en localStorage:", error);
        }

        return users;
      }
    } catch (error) {
      if (import.meta.env.DEV)
        console.error("❌ Error al obtener usuarios:", error);
      throw error;
    }
  }, []);

  // Función de búsqueda con debounce mejorada
  const performSearch = useCallback(
    async (searchTerm: string) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);
        setError(null);
        if (import.meta.env.DEV)
          console.log("🔄 Performing search for:", searchTerm);

        const results = await fetchUsers(searchTerm);

        // Validar resultados
        if (!Array.isArray(results)) {
          throw new Error("Datos inválidos recibidos del servidor");
        }

        setFilteredUsers(results);

        // Si no hay término de búsqueda, también actualizar allUsers
        if (!searchTerm.trim()) {
          setAllUsers(results);
          if (import.meta.env.DEV)
            console.log("📊 Total users loaded:", results.length);
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Error al buscar usuarios";

          setError(errorMessage);
          if (import.meta.env.DEV)
            console.error("❌ Error en búsqueda:", error);

          // En caso de error, intentar usar datos del caché como fallback
          if (!searchTerm.trim() && memoryCache) {
            if (import.meta.env.DEV) console.log("🔄 Using cache as fallback");
            setFilteredUsers(memoryCache.users);
            setAllUsers(memoryCache.users);
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [fetchUsers],
  );

  // Efecto para manejar búsqueda con debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchTermState);
    }, 300); // 300ms de debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTermState, performSearch]);

  // Efecto inicial para cargar usuarios
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    if (import.meta.env.DEV) console.log("🚀 Initializing users cache");
    performSearch(""); // Cargar usuarios iniciales
  }, [performSearch]);

  // Función para refrescar datos
  const refreshUsers = useCallback(async () => {
    if (import.meta.env.DEV) console.log("🔄 Refreshing users data");
    // Limpiar cachés
    memoryCache = null;
    localStorage.removeItem(CACHE_CONFIG.STORAGE_KEY);
    localStorage.removeItem(CACHE_CONFIG.TIMESTAMP_KEY);
    localStorage.removeItem(CACHE_CONFIG.VERSION_KEY);

    // Recargar datos
    await performSearch(searchTermState);
    setLastRefresh(new Date());
  }, [performSearch, searchTermState]);

  // Función para establecer término de búsqueda
  const setSearchTerm = useCallback((term: string) => {
    setSearchTermState(term);
  }, []);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Función para verificar si el caché es válido
  const isCacheValid = useCallback(() => {
    const now = Date.now();

    if (memoryCache && now - memoryCache.timestamp < CACHE_CONFIG.MEMORY_TTL) {
      return true;
    }

    try {
      const cachedTimestamp = localStorage.getItem(CACHE_CONFIG.TIMESTAMP_KEY);
      const cachedVersion = localStorage.getItem(CACHE_CONFIG.VERSION_KEY);

      if (cachedTimestamp && cachedVersion === CACHE_CONFIG.CURRENT_VERSION) {
        const timestamp = parseInt(cachedTimestamp);

        return now - timestamp < CACHE_CONFIG.STORAGE_TTL;
      }
    } catch (error) {
      if (import.meta.env.DEV) console.warn("Error al verificar caché:", error);
    }

    return false;
  }, []);

  // Función para invalidar el caché
  const invalidateCache = useCallback(() => {
    memoryCache = null;
    localStorage.removeItem(CACHE_CONFIG.STORAGE_KEY);
    localStorage.removeItem(CACHE_CONFIG.TIMESTAMP_KEY);
    localStorage.removeItem(CACHE_CONFIG.VERSION_KEY);
  }, []);

  return {
    users: filteredUsers,
    allUsers, // Agregar todos los usuarios
    filteredUsers,
    loading,
    error,
    refreshUsers,
    setSearchTerm,
    searchTerm: searchTermState,
    lastRefresh,
    lastFetch: lastRefresh?.getTime() || 0,
    isCacheValid,
    invalidateCache,
    // Funciones de filtrado específico (mantenidas por compatibilidad)
    titulos: filteredUsers,
    magisters: filteredUsers,
    diplomados: filteredUsers,
  };
};

export default useUsersCache;
