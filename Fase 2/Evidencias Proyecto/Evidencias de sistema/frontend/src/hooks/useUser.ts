import { useState, useEffect } from "react";

import { User } from "../types/types";

import { fetchUserProfile } from "@/api/user/profile";
import { ACCESS_TOKEN } from "@/services/google/token";

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem(ACCESS_TOKEN);

        if (!token) {
          setUser(null);
          setLoading(false);

          return;
        }

        const userData = await fetchUserProfile();

        if (userData) {
          setUser(userData);
        } else {
          console.error("Invalid user data received:", userData);
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Recargar los datos cuando cambie el token
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === ACCESS_TOKEN) {
        getUser();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return { user, loading };
};
