// src/hooks/useSession.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { jwtDecode } from "jwt-decode";
import { Spinner } from "@heroui/spinner";

import {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  GOOGLE_ACCESS_TOKEN,
} from "@/services/google/token";
import { refreshAccessToken } from "@/services/google/auth";
import api from "@/services/google/axiosInstance";

interface User {
  username: string;
  email: string;
  jefe?: string;
  [key: string]: any;
}

interface SessionContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshToken: () => Promise<boolean>;
  logout: () => void;
}
const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    localStorage.removeItem(GOOGLE_ACCESS_TOKEN);
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = "/login";
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    const newToken = await refreshAccessToken();

    if (newToken) {
      setIsAuthenticated(true);
      await fetchUser();

      return true;
    }
    setIsAuthenticated(false);

    return false;
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get("/api/auth/user/");

      setUser(res.data);
      setIsAuthenticated(true);
    } catch (error) {
      const anyErr: any = error as any;

      if (anyErr?.code === "ERR_NETWORK" || !anyErr?.response) {
        console.error("Backend no disponible (ERR_NETWORK)");
      } else {
        console.error("Error fetching user:", error);
      }
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);

    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);

      return;
    }

    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      const now = Date.now() / 1000;

      if (decoded.exp - now < 300) {
        const success = await refreshToken();

        if (!success) setIsAuthenticated(false);
      } else {
        await fetchUser();
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      const success = await refreshToken();

      if (!success) setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [refreshToken, fetchUser]);

  useEffect(() => {
    checkAuth();
    const interval = setInterval(checkAuth, 4 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkAuth]);

  return (
    <SessionContext.Provider
      value={{ user, isAuthenticated, isLoading, refreshToken, logout }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);

  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }

  return context;
};

export const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen">
    <Spinner color="warning" label="Cargando..." />
  </div>
);
