import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  GOOGLE_ACCESS_TOKEN,
} from "@/services/google/token";
import { fetchUsuarioActual } from "@/api/user/user";

const GoogleRedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const error = params.get("error");
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const googleAccessToken = params.get("google_token");

      if (error) {
        console.error("Error en la autenticación:", error);
        localStorage.clear();
        navigate("/login?error=" + error, { replace: true }); // Solo navegar

        return;
      }

      if (accessToken && refreshToken) {
        try {
          // Almacenar tokens
          localStorage.setItem(ACCESS_TOKEN, accessToken);
          localStorage.setItem(REFRESH_TOKEN, refreshToken);
          if (googleAccessToken) {
            localStorage.setItem(GOOGLE_ACCESS_TOKEN, googleAccessToken);
          }

          const user = await fetchUsuarioActual();

          localStorage.setItem("user", JSON.stringify(user));

          // Verificar que el token sea válido
          const response = await fetch(
            import.meta.env.VITE_API_URL + "/api/auth/user/",
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          );

          if (response.ok) {
            // Redirigir al usuario a la página principal
            navigate("/", { replace: true });
          } else {
            throw new Error("Token inválido");
          }
        } catch (error) {
          console.error("Error validando el token:", error);
          localStorage.removeItem(ACCESS_TOKEN);
          localStorage.removeItem(REFRESH_TOKEN);
          localStorage.removeItem(GOOGLE_ACCESS_TOKEN);
          navigate("/login?error=InvalidToken");
        }
      } else {
        console.error("No se recibieron los tokens necesarios");
        navigate("/login?error=NoTokens");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div
        style={{
          padding: "20px",
          borderRadius: "8px",
          backgroundColor: "white",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
        }}
      >
        <div>Procesando autenticación...</div>
      </div>
    </div>
  );
};

export default GoogleRedirectHandler;
