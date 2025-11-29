import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "@/services/google/axiosInstance";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/services/google/token";
import "@/styles/AuthForm.css";
import google from "@/assets/google.png";

type AuthFormProps = {
  route: string;
  method: "login" | "register";
};

export const handleGoogleLogin = () => {
  window.location.href =
    import.meta.env.VITE_API_URL + "/accounts/google/login/";
};

const AuthForm: React.FC<AuthFormProps> = ({ route, method }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.post(route);

      if (method === "login") {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/");
      }
    } catch (error: any) {
      console.error(error);
      if (error.response) {
        if (error.response.status === 401) {
          setError("Credenciales inválidas.");
        } else if (error.response.status === 400) {
          setError("El usuario ya existe.");
        } else {
          setError("Algo salió mal. Inténtalo nuevamente.");
        }
      } else if (error.request) {
        setError("Error de red. Verifica tu conexión a internet.");
      } else {
        setError("Algo salió mal. Inténtalo nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      {loading && (
        <div className="loading-indicator">
          {error ? (
            <span className="error-message">{error}</span>
          ) : (
            <div className="spinner" />
          )}
        </div>
      )}
      {!loading && (
        <form className="form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button
            className="google-button"
            type="button"
            onClick={handleGoogleLogin}
          >
            <img alt="Google icon" className="google-icon" src={google} />
            {"Iniciar sesión con Google"}
          </button>
        </form>
      )}
    </div>
  );
};

export default AuthForm;
