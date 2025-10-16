import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { addToast } from "@heroui/toast";
import { Capacitor } from "@capacitor/core";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";

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


    const isNative = Capacitor.isNativePlatform();

    const handleNativeLogin = async () => {
        const rawClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();
        const base = (import.meta.env.VITE_API_URL || "").trim();
        const callbackUrl = `${window.location.origin}/login/api/callback`;

        if (!rawClientId || !rawClientId.endsWith(".apps.googleusercontent.com")) {
            console.error("[GoogleAuth] Client ID inválido para Android:", rawClientId);
            addToast({
                title: "Client ID inválido",
                description:
                    "Usa un 'Web application' Client ID que termine en .apps.googleusercontent.com",
                color: "danger",
            });
            return;
        }

        try {
            await GoogleAuth.initialize({
                clientId: rawClientId,
                scopes: ["profile", "email"],
            });

            const result = await GoogleAuth.signIn();
            const id_token = result?.authentication?.idToken;
            if (!id_token) throw new Error("No se recibió idToken de Google");

            const response = await axios.post(
                `${base}/api/token/google/`,
                { id_token },
                { withCredentials: true },
            );

            const { access, refresh } = response.data;
            localStorage.setItem("access_token", access);
            localStorage.setItem("refresh_token", refresh);

            window.location.href = "/";
        } catch (error: any) {
            console.error("Error login nativo Google:", {
                message: error?.message,
                code: error?.code,
                name: error?.name,
            });

            addToast({
                title: "Error al iniciar sesión",
                description: "Inicio nativo falló. Usaremos el flujo web como alternativa.",
                color: "danger",
            });

            if (base) {
                // Ajusta la ruta si tu backend usa /api/auth/google/login/
                const loginUrl = `${base}/accounts/google/login/?redirect=${encodeURIComponent(callbackUrl)}`;
                window.location.href = loginUrl;
            }
        }
    };

    return (
        <div className="flex justify-center">
            {isNative ? (
                <button
                    type="button"
                    onClick={handleNativeLogin}
                    className="px-4 py-2 rounded-md border border-blue-500 text-blue-600 bg-white hover:bg-slate-50"
                >
                    Iniciar sesión con Google
                </button>
            ) : (
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
            )}
        </div>
    );
}
