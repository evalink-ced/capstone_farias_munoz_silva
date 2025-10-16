// src/services/google/axiosInstance.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { addToast } from "@heroui/toast";

import { ACCESS_TOKEN, REFRESH_TOKEN } from "./token";
import { refreshAccessToken } from "./auth";

const PUBLIC_ROUTES = [
  "/api/token/refresh/",
  "/api/google/validate_token/",
  "/api/auth/login/",
  "/api/auth/register/",
  "/api/auth/google/login/",
  "/api/auth/google/callback/",
];

const baseURL = (import.meta.env.VITE_API_URL || "").trim();
if (!baseURL) {
  console.warn("[google/axiosInstance] VITE_API_URL no está definido; las peticiones fallarán.");
}

const api = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

// Control de concurrencia en refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token!),
  );
  failedQueue = [];
};

const isPublicRoute = (url?: string): boolean =>
  !!url && PUBLIC_ROUTES.some((route) => url.includes(route));

const waitForToken = async (
  retries = 5,
  delay = 1000,
): Promise<string | null> => {
  for (let i = 0; i < retries; i++) {
    const token = localStorage.getItem(ACCESS_TOKEN);

    if (token) return token;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  return null;
};

// ✅ REQUEST INTERCEPTOR
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (isPublicRoute(config.url)) return config;

    let token = localStorage.getItem(ACCESS_TOKEN);

    if (!token) {
      token = await waitForToken();
      if (!token) throw new Error("Token no disponible después de esperar");
    }

    config.headers.Authorization = `Bearer ${token}`;

    // Handle FormData properly - remove Content-Type to let axios set it automatically
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ✅ RESPONSE INTERCEPTOR (refresca si hay 401)
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    if (
      error.response?.status !== 401 ||
      isPublicRoute(originalRequest?.url) ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem(REFRESH_TOKEN);

    if (!refreshToken) {
      showExpiredToast();
      redirectToLogin();

      return Promise.reject(new Error("No hay refresh token"));
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const newAccessToken = await refreshAccessToken();

      if (!newAccessToken) throw new Error("Refresh fallido");

      processQueue(null, newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      showExpiredToast();
      redirectToLogin();

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// 🎯 Toast reutilizable
const showExpiredToast = () => {
  addToast({
    title: "Sesión expirada",
    description: "Tu sesión ha caducado. Por favor vuelve a iniciar sesión.",
    color: "danger",
  });
};

// 🔁 Redirección automática
const redirectToLogin = () => {
  localStorage.removeItem(ACCESS_TOKEN);
  localStorage.removeItem(REFRESH_TOKEN);
  setTimeout(() => {
    window.location.href = "/login";
  }, 2000);
};

export default api;
