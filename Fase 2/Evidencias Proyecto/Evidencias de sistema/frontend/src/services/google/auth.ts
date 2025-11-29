// src/services/auth/auth.ts
import { useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";

import {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  GOOGLE_ACCESS_TOKEN,
  USER,
} from "./token";

interface DecodedToken {
  exp: number;
}

export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN);

  if (!refreshToken) return null;

  try {
    const res = await fetch(
      import.meta.env.VITE_API_URL + "/api/token/refresh/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ refresh: refreshToken }),
      },
    );

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();

    if (data.access) {
      localStorage.setItem(ACCESS_TOKEN, data.access);
      if (data.refresh) localStorage.setItem(REFRESH_TOKEN, data.refresh);

      return data.access;
    }

    return null;
  } catch (error) {
    console.error("Error refreshing token:", error);

    return null;
  }
};

export const useAuthentication = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(GOOGLE_ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    localStorage.removeItem(USER);
    setIsAuthorized(false);
    window.location.href = "/login";
  }, []);

  const validateGoogleToken = useCallback(
    async (token: string): Promise<boolean> => {
      try {
        const res = await fetch(
          import.meta.env.VITE_API_URL + "/api/google/validate_token/",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token: token }),
          },
        );
        const data = await res.json();
        const isValid = res.ok && data.valid === true;

        if (!isValid) {
          console.warn("Google token inválido. Cerrando sesión.");
          logout(); // 🔥 esto es lo que corta el loop
        }

        return isValid;
      } catch (error) {
        console.error("Error validando Google token:", error);
        logout(); // 🔥 también cerramos sesión si hay error

        return false;
      }
    },
    [logout],
  );

  const refreshToken = useCallback(async (): Promise<boolean> => {
    let attempts = 0;

    while (attempts < 2) {
      const newToken = await refreshAccessToken();

      if (newToken) {
        setIsAuthorized(true);

        return true;
      }
      attempts++;
    }

    // Si llega aquí, falló 2 veces
    console.warn("Token refresh failed twice, logging out.");
    logout();

    return false;
  }, [logout]);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    const googleToken = localStorage.getItem(GOOGLE_ACCESS_TOKEN);

    if (!token && !googleToken) {
      setIsAuthorized(false);

      return;
    }

    if (token) {
      try {
        const { exp } = jwtDecode<DecodedToken>(token);
        const now = Date.now() / 1000;

        if (exp - now < 300) {
          const refreshed = await refreshToken();

          if (!refreshed && googleToken) {
            setIsAuthorized(await validateGoogleToken(googleToken));
          }
        } else {
          const res = await fetch(
            import.meta.env.VITE_API_URL + "/api/auth/user/",
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          setIsAuthorized(res.ok);
        }
      } catch (e) {
        const refreshed = await refreshToken();

        if (!refreshed && googleToken) {
          setIsAuthorized(await validateGoogleToken(googleToken));
        }
      }
    } else if (googleToken) {
      setIsAuthorized(await validateGoogleToken(googleToken));
    }

    setIsInitialized(true);
  }, [refreshToken, validateGoogleToken]);

  useEffect(() => {
    checkAuth();
    const interval = setInterval(checkAuth, 240000); // cada 4 min

    return () => clearInterval(interval);
  }, [checkAuth]);

  return { isAuthorized, isInitialized, logout, refreshToken, checkAuth };
};
