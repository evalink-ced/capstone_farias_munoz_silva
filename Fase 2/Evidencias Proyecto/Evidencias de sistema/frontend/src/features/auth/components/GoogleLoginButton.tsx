import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { addToast } from "@heroui/toast";

export default function GoogleLoginButton() {
  const handleSuccess = async (credentialResponse: any) => {
    const { credential: id_token } = credentialResponse;

    console.log("Google credential:", credentialResponse);

    try {
      const response = await axios.post(
        import.meta.env.VITE_API_URL + "/api/token/google/",
        { id_token },
        { withCredentials: true },
      );

      const { access, refresh } = response.data;

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      // Redirige al home o dashboard
      window.location.href = "/";
    } catch (error: any) {
      console.error("Error durante el login con Google:", error);

      // Obtener detalles de error del backend
      const status = error.response?.status;
      const data = error.response?.data;

      if (status === 403 && data?.error === "invalid_domain") {
        addToast({
          title: "Dominio no permitido",
          description:
            data.detail || "Tu cuenta no pertenece a un dominio autorizado.",
          color: "danger",
        });
      } else if (status === 403 && data?.error === "no_registered") {
        addToast({
          title: "Usuario no registrado",
          description:
            data.detail ||
            "Tu correo es válido, pero no está registrado en el sistema.",
          color: "danger",
        });
      } else {
        console.error("❌ Error completo:", error);
        console.log("📦 Response data:", error.response?.data);

        addToast({
          title: "Error al iniciar sesión",
          description: "Ocurrió un problema inesperado. Intenta nuevamente.",
          color: "danger",
        });
      }
    }
  };

  return (
    <div className="flex justify-center">
      <GoogleLogin
        logo_alignment="center"
        shape="pill"
        size="large"
        text="continue_with"
        theme="outline"
        onError={() =>
          addToast({
            title: "Falló el inicio de sesión",
            description: "No se pudo completar el inicio con Google.",
            color: "danger",
          })
        }
        onSuccess={handleSuccess}
      />
    </div>
  );
}
