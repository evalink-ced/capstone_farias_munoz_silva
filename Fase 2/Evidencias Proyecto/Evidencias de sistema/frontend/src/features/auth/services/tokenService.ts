// services/auth/tokenService.ts
export const ACCESS_TOKEN = "access_token";
export const REFRESH_TOKEN = "refresh_token";
export const GOOGLE_ACCESS_TOKEN = "google_access_token";
const REFRESH_FAIL_COUNT = "refresh_fail_count";

export const keys = {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  GOOGLE_ACCESS_TOKEN,
  REFRESH_FAIL_COUNT,
};

type Tokens = { access?: string; refresh?: string; google?: string };

let inMemory: Tokens = {};

export function getTokens(): Tokens {
  return {
    access: inMemory.access ?? localStorage.getItem(ACCESS_TOKEN) ?? undefined,
    refresh:
      inMemory.refresh ?? localStorage.getItem(REFRESH_TOKEN) ?? undefined,
    google:
      inMemory.google ?? localStorage.getItem(GOOGLE_ACCESS_TOKEN) ?? undefined,
  };
}

export function setTokens(t: Tokens) {
  if (t.access) {
    inMemory.access = t.access;
    localStorage.setItem(ACCESS_TOKEN, t.access);
  }
  if (t.refresh) {
    inMemory.refresh = t.refresh;
    localStorage.setItem(REFRESH_TOKEN, t.refresh);
  }
  if (t.google) {
    inMemory.google = t.google;
    localStorage.setItem(GOOGLE_ACCESS_TOKEN, t.google);
  }
}

export function clearTokens() {
  inMemory = {};
  localStorage.removeItem(ACCESS_TOKEN);
  localStorage.removeItem(REFRESH_TOKEN);
  localStorage.removeItem(GOOGLE_ACCESS_TOKEN);
  localStorage.removeItem(REFRESH_FAIL_COUNT);
}

export function getRefreshFailCount() {
  return Number(localStorage.getItem(REFRESH_FAIL_COUNT) || "0");
}
export function bumpRefreshFailCount() {
  const n = getRefreshFailCount() + 1;

  localStorage.setItem(REFRESH_FAIL_COUNT, String(n));

  return n;
}
export function resetRefreshFailCount() {
  localStorage.setItem(REFRESH_FAIL_COUNT, "0");
}

/** Devuelve exp del JWT (segundos epoch) o null si no se pudo. */
export function getJwtExp(token?: string): number | null {
  if (!token) return null;
  try {
    const [, payload] = token.split(".");
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    );

    return typeof json?.exp === "number" ? json.exp : null;
  } catch {
    return null;
  }
}
