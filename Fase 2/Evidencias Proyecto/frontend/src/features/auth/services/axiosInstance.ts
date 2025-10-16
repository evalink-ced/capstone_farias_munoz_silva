// services/google/axiosInstance.ts
import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosRequestHeaders,
} from "axios";

import {
  getTokens, setTokens, clearTokens,
  bumpRefreshFailCount, resetRefreshFailCount
} from "@/features/auth/services/tokenService";


const baseURL = (import.meta.env.VITE_API_URL || "").trim();
if (!baseURL) {
  console.warn("[axiosInstance] VITE_API_URL no está definido; las peticiones fallarán.");
}

const api = axios.create({
  baseURL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;
let requestQueue: ((token: string) => void)[] = [];
let logoutOnce = false;

function onRefreshed(newAccess: string) {
  requestQueue.forEach(cb => cb(newAccess));
  requestQueue = [];
}

function isRefreshUrl(url?: string) {
  const refreshPath = "/api/token/refresh/";
  try {
    const u = new URL(url!, api.defaults.baseURL);
    return u.pathname.endsWith(refreshPath);
  } catch {
    return !!url && url.includes(refreshPath);
  }
}

function isPublicAuthUrl(url?: string) {
  if (!url) return false;
  try {
    const u = new URL(url, api.defaults.baseURL);
    const p = u.pathname;
    return (
      p.startsWith("/accounts/") ||
      p.startsWith("/login") ||
      p.startsWith("/register")
    );
  } catch {
    return false;
  }
}

function hardLogout() {
  requestQueue = [];
  clearTokens();
  if (!logoutOnce) {
    logoutOnce = true;
    window.location.replace("/login?error=RefreshFailed");
  }
}

async function refreshToken(): Promise<string> {
  const { refresh } = getTokens();
  if (!refresh) throw new Error("No refresh token");

  const res = await axios.post(
    `${import.meta.env.VITE_API_URL}/api/token/refresh/`,
    { refresh },
    { withCredentials: true }
  );

  const newAccess = res.data?.access;
  const newRefresh = res.data?.refresh || refresh;
  if (!newAccess) throw new Error("No access in refresh");

  setTokens({ access: newAccess, refresh: newRefresh });
  resetRefreshFailCount();
  return newAccess;
}

api.interceptors.request.use((config) => {
  const { access } = getTokens();

  if (access) {
    // Asegura que headers exista y sea mutable
    if (!config.headers) config.headers = {} as AxiosRequestHeaders;

    // Setea la cabecera sin reemplazar el objeto
    (config.headers as AxiosRequestHeaders).Authorization = `Bearer ${access}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    // Si no hay response (network/timeout), no es caso de refresh
    if (!error.response) return Promise.reject(error);

    const original = (error.config || {}) as AxiosRequestConfig & { _retry?: boolean };
    const status = error.response.status;

    // Sólo manejamos 401 aquí; el resto sigue su curso
    if (status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // No refrescar en endpoints de refresh o públicos
    if (isRefreshUrl(original.url)) {
      const n = bumpRefreshFailCount();
      if (n >= 2) hardLogout();
      return Promise.reject(error);
    }
    if (isPublicAuthUrl(original.url)) {
      return Promise.reject(error);
    }

    original._retry = true;

    // Si ya hay un refresh en curso, encola
    if (isRefreshing && refreshPromise) {
      return new Promise((resolve, reject) => {
        requestQueue.push((newAccess) => {
          if (!original.headers) original.headers = {};
          original.headers.Authorization = `Bearer ${newAccess}`;
          api.request(original).then(resolve).catch(reject);
        });
      });
    }

    // Dispara el refresh una sola vez
    isRefreshing = true;
    refreshPromise = refreshToken();

    try {
      const newAccess = await refreshPromise;
      onRefreshed(newAccess);
      if (!original.headers) original.headers = {};
      original.headers.Authorization = `Bearer ${newAccess}`;
      return api.request(original);
    } catch (e) {
      const n = bumpRefreshFailCount();
      if (n >= 2) hardLogout();
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  }
);

export default api;
