import React, { useState, Suspense, useEffect, JSX } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
// import { Divider } from "@heroui/divider"; // ← no usado
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { addToast } from "@heroui/toast";

import { title } from "@/shared/utils/primitives";
import { Button } from "@heroui/button";
import { ThemeSwitch } from "@/shared/components/ui/theme-switch";

// ⬇ Lazy load de componentes secundarios
const GoogleLoginButton = React.lazy(
  () => import("@/features/auth/components/GoogleLoginButton"),
);
const TermsModal = React.lazy(
  () => import("@/shared/components/ui/Legal/TermsModal"),
);
const Footer = React.lazy(() => import("@/shared/components/layout/footer"));

const showErrorToast = (type: string) => {
  const messages: Record<
    string,
    { title: string; description: string; color: "danger" | "warning"; timeout: number }
  > = {
    invalid_domain: {
      title: "Acceso Denegado",
      description: "Cuenta no registrada y correo electrónico no pertenece a un dominio autorizado.",
      color: "danger",
      timeout: 5000,
    },
    no_registered: {
      title: "Cuenta no registrada",
      description: "Tu correo no está registrado en nuestra plataforma. Contacta con Recursos Humanos.",
      color: "warning",
      timeout: 4000,
    },
    default: {
      title: "Error de acceso",
      description: "Ocurrió un error inesperado. Intenta nuevamente.",
      color: "danger",
      timeout: 3000,
    },
  };

  const msg = messages[type] || messages.default;
  addToast({ ...msg, shouldShowTimeoutProgress: true });
};

// Burbujas animadas
const EnhancedBubbles = () => {
  const [bubbles, setBubbles] = useState<JSX.Element[] | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const isDark = document.documentElement.classList.contains("dark");

    const newBubbles = [...Array(10)].map((_, i) => {
      const size = 40 + Math.random() * 40;
      const depth = i / 10;
      const colors = isDark
        ? [
            "rgba(59,130,246,0.25)",   // blue-500
            "rgba(147,51,234,0.20)",   // purple-600
            "rgba(16,185,129,0.18)",   // emerald-500
            "rgba(99,102,241,0.22)",   // indigo-500
          ]
        : [
            "rgba(59, 130, 246, 0.2)",   // blue-500
            "rgba(147, 51, 234, 0.15)",  // purple-600
            "rgba(16, 185, 129, 0.12)",  // emerald-500
            "rgba(99, 102, 241, 0.18)",  // indigo-500
          ];

      return (
        <motion.div
          key={i}
          animate={{
            x: [i % 2 === 0 ? -100 : screenWidth + 100, i % 2 === 0 ? screenWidth + 100 : -100],
            y: [Math.random() * screenHeight, Math.random() * screenHeight],
            scale: [1, 1.2, 1],
          }}
          className="absolute rounded-full pointer-events-none"
          initial={{ x: i % 2 === 0 ? -100 : screenWidth + 100, y: Math.random() * screenHeight }}
          style={{
            width: size,
            height: size,
            backgroundColor: colors[i % colors.length],
            boxShadow: `0 0 40px ${colors[i % colors.length]}`,
            zIndex: -depth * 10,
            mixBlendMode: isDark ? "screen" : "normal",
            filter: "blur(0.5px)",
          }}
          transition={{ duration: 15 - depth * 5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        />
      );
    });

    setBubbles(newBubbles);
  }, []);

  return <AnimatePresence>{bubbles}</AnimatePresence>;
};

const Welcome: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorParam = params.get("error");
    const loggedOut = params.get("logged_out");

    if (loggedOut && !sessionStorage.getItem("logged_out_handled")) {
      localStorage.clear();
      sessionStorage.clear();
      addToast({ title: "Sesión cerrada", description: "Has cerrado sesión exitosamente.", color: "success", timeout: 3000 });
      sessionStorage.setItem("logged_out_handled", "true");
      setTimeout(() => navigate("/login", { replace: true }), 100);
    } else {
      sessionStorage.removeItem("logged_out_handled");
    }

    if (errorParam && !sessionStorage.getItem(`error_handled_${errorParam}`)) {
      showErrorToast(errorParam);
      sessionStorage.setItem(`error_handled_${errorParam}`, "true");
      setTimeout(() => navigate("/login", { replace: true }), 100);
    } else {
      sessionStorage.removeItem("error_handled_invalid_domain");
      sessionStorage.removeItem("error_handled_no_registered");
    }
  }, [location.search, navigate]);

  return (
    <>
      {/* Fondo animado */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-[#0b1220] dark:via-[#0f1831] dark:to-[#0b1220]">
        <EnhancedBubbles />
      </div>

      {/* Layout principal */}
      <div className="min-h-screen flex flex-col">
        {/* Contenido principal centrado */}
        <main className="flex-1 flex items-center justify-center px-6 py-8">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-[480px]"  // ← ancho ampliado
          >
            <Card className="rounded-2xl backdrop-blur-xl bg-white/95 dark:bg-[#111827]/90 shadow-xl dark:shadow-[0_20px_80px_rgba(0,0,0,0.7)] border border-white/50 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5">
              {/* Header del card */}
              <CardHeader className="text-center justify-center py-10 px-8">
                <div className="space-y-6">
                  {/* Logo arriba del título */}
                  <img
                    src="/CED.png"
                    alt="Logo Evalink"
                    className="mx-auto w-20 h-20 sm:w-24 sm:h-24 object-contain"
                    draggable={false}
                  />

                  {/* Título principal */}
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold leading-tight">
                      <span className={title({ size: "sm", color: "blue" })}>Evalink</span>
                    </h1>
                  </div>
                </div>
              </CardHeader>

              {/* Body del card */}
              <CardBody className="px-8 pb-10">
                <div className="space-y-8">
                  {/* Sección de autenticación */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        Para continuar, inicia sesión con tu cuenta institucional
                      </p>
                    </div>

                    <Suspense
                      fallback={
                        <div className="flex items-center justify-center py-4 gap-2">
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm text-slate-600 dark:text-slate-300">Cargando...</span>
                        </div>
                      }
                    >
                      <GoogleLoginButton />
                    </Suspense>
                  </div>

                  {/* Divider + Términos */}
                  <div className="border-t border-slate-200 dark:border-slate-600 pt-6 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Al iniciar sesión, aceptas nuestros{" "}
                      <Button
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline font-medium transition-colors"
                        type="button"
                        onClick={() => setShowTerms(true)}
                        variant="light"
                        color="primary"
                      >
                        Términos y Condiciones
                      </Button>
                    </p>
                  </div>

                  {/* Fila de settings: Cambiar tema */}
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-zinc-800/60 px-3 py-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Cambiar tema
                    </span>
                    <ThemeSwitch />
                  </div>
                </div>

                <Suspense fallback={null}>
                  <TermsModal isOpen={showTerms} onClose={setShowTerms} />
                </Suspense>
              </CardBody>
            </Card>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="flex-shrink-0 py-4">
          <Suspense fallback={null}>
            <Footer />
          </Suspense>
        </footer>
      </div>
    </>
  );
};

export default Welcome;
