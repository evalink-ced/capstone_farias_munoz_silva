// src/pages/DashboardPage.tsx
import React from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { AcademicCapIcon, ClipboardDocumentListIcon, HeartIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { useSession } from "@/hooks/useSession";
import { usePermissions } from "@/hooks/usePermissions";
import ModulesPanel from "@/features/dashboard/components/ModulesPanel";
import { Logo } from "@/shared/components/Icons/icons";

// Error Boundary para encapsular el bloque
class DashboardBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    console.error("Error cargando el panel:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full p-6 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-200">
          Ocurrió un problema al cargar los módulos. Intenta recargar la página.
        </div>
      );
    }
    return this.props.children;
  }
}

export default function DashboardPage() {
  const { permisos } = usePermissions();
  const { user } = useSession();
  const displayName =
    (user?.nombres as string) ||
    (user?.nombre as string) ||
    (user?.name as string) ||
    (user?.username as string) ||
    "Usuario";

  const companyName =
    (user?.empresa?.name as string) ||
    (user?.empresa?.empresa as string) ||
    (user?.empresa?.nombre as string) ||
    "";



  const hasAny = (prefix: string) => permisos?.some((p) => p.startsWith(prefix));




  const featureCards = (() => {
    if (hasAny("directivo.")) {
      return [
        {
          icon: <ClipboardDocumentListIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
          title: "Gestión de procesos",
          desc: "Operaciones del portal y seguimiento general.",
          bg: "bg-blue-50/70 dark:bg-blue-900/20",
          titleColor: "text-blue-700 dark:text-blue-300",
          descColor: "text-blue-800/80 dark:text-blue-200/80",
        },
        {
          icon: <AcademicCapIcon className="w-5 h-5 text-amber-600 dark:text-amber-300" />,
          title: "Indicadores y seguimiento",
          desc: "Visualización consolidada sin detalles sensibles.",
          bg: "bg-amber-50/70 dark:bg-amber-900/20",
          titleColor: "text-amber-700 dark:text-amber-200",
          descColor: "text-amber-800/80 dark:text-amber-200/80",
        },
        {
          icon: <ShieldCheckIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />,
          title: "Privacidad y acceso",
          desc: "Accesos y protección por roles.",
          bg: "bg-emerald-50/70 dark:bg-emerald-900/20",
          titleColor: "text-emerald-700 dark:text-emerald-200",
          descColor: "text-emerald-800/80 dark:text-emerald-200/80",
        },
      ];
    }
    if (hasAny("portal.")) {
      return [
        {
          icon: <HeartIcon className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
          title: "Mi espacio",
          desc: "Vista personal y herramientas del portal.",
          bg: "bg-rose-50/70 dark:bg-rose-900/20",
          titleColor: "text-rose-700 dark:text-rose-300",
          descColor: "text-rose-800/80 dark:text-rose-200/80",
        },
        {
          icon: <ClipboardDocumentListIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
          title: "Progreso general",
          desc: "Seguimiento de actividad sin exponer detalle.",
          bg: "bg-indigo-50/70 dark:bg-indigo-900/20",
          titleColor: "text-indigo-700 dark:text-indigo-300",
          descColor: "text-indigo-800/80 dark:text-indigo-200/80",
        },
        {
          icon: <ShieldCheckIcon className="w-5 h-5 text-sky-600 dark:text-sky-400" />,
          title: "Privacidad",
          desc: "Datos protegidos conforme a políticas de acceso.",
          bg: "bg-sky-50/70 dark:bg-sky-900/20",
          titleColor: "text-sky-700 dark:text-sky-300",
          descColor: "text-sky-800/80 dark:text-sky-200/80",
        },
      ];
    }
    return [
      {
        icon: <ShieldCheckIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />,
        title: "Gobernanza y seguridad",
        desc: "Gestión de accesos y resguardo de datos.",
        bg: "bg-emerald-50/70 dark:bg-emerald-900/20",
        titleColor: "text-emerald-700 dark:text-emerald-200",
        descColor: "text-emerald-800/80 dark:text-emerald-200/80",
      },
      {
        icon: <ClipboardDocumentListIcon className="w-5 h-5 text-amber-600 dark:text-amber-300" />,
        title: "Operaciones",
        desc: "Procesos y coordinación del portal.",
        bg: "bg-amber-50/70 dark:bg-amber-900/20",
        titleColor: "text-amber-700 dark:text-amber-200",
        descColor: "text-amber-800/80 dark:text-amber-200/80",
      },
      {
        icon: <AcademicCapIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
        title: "Calidad de servicio",
        desc: "Mejora continua y soporte.",
        bg: "bg-blue-50/70 dark:bg-blue-900/20",
        titleColor: "text-blue-700 dark:text-blue-300",
        descColor: "text-blue-800/80 dark:text-blue-200/80",
      },
    ];
  })();

  // Rutas de recursos visuales (ajusta según tus archivos en /public)
  const bannerIllustration = "/images/teacher.png";

  // Puerta de hidratación: sincroniza loaders de hero y módulos
  const [isHydrating, setIsHydrating] = React.useState(true);
  React.useEffect(() => {
    const ready = !!user && Array.isArray(permisos);
    if (ready) {
      const t = setTimeout(() => setIsHydrating(false), 350);
      return () => clearTimeout(t);
    }
  }, [user, permisos]);


  const quickStartSteps = ["Explora módulos disponibles", "Revisa la guía rápida", "Comienza tu primera evaluación"];




  return (
    <main
      className="w-full min-h-screen bg-mesh"
    >
      <section className="relative isolate overflow-visible text-white">
        {/* Fondo mesh azul→morado */}
        <div
          className="absolute inset-0 -z-10 dark:hidden"
          style={{
            backgroundImage: `
              radial-gradient(60% 80% at 12% 15%, rgba(59,130,246,0.25) 0%, rgba(59,130,246,0.12) 30%, transparent 70%),
              radial-gradient(80% 60% at 88% 20%, rgba(124,58,237,0.25) 0%, rgba(124,58,237,0.12) 35%, transparent 70%),
              radial-gradient(100% 80% at 50% 90%, rgba(99,102,241,0.20) 0%, rgba(99,102,241,0.10) 40%, transparent 75%),
              linear-gradient(120deg, #0e3aa7 0%, #2443b8 40%, #3b82f6 60%, #7c3aed 85%, #4c1d95 100%)
            `,
            backgroundBlendMode: "screen, screen, screen, normal",
          }}
        />
        <div
          className="absolute inset-0 -z-10 hidden dark:block"
          style={{
            backgroundImage: `
              radial-gradient(60% 80% at 12% 15%, rgba(59,130,246,0.18) 0%, rgba(30,64,175,0.12) 30%, transparent 70%),
              radial-gradient(80% 60% at 88% 20%, rgba(124,58,237,0.18) 0%, rgba(76,29,149,0.12) 35%, transparent 70%),
              radial-gradient(100% 80% at 50% 90%, rgba(99,102,241,0.16) 0%, rgba(99,102,241,0.08) 40%, transparent 75%),
              linear-gradient(120deg, #0b1220 0%, #0f172a 40%, #1e3a8a 60%, #312e81 85%, #0b1220 100%)
            `,
            backgroundBlendMode: "screen, screen, screen, normal",
          }}
        />
        {/* Textura y viñetas */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.05]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 2px)",
          }}
        />
        {/* Acento flotante sutil */}
        <svg
          className="pointer-events-none absolute top-6 left-6 w-24 h-24 opacity-20"
          viewBox="0 0 100 100"
        >
          <defs>
            <linearGradient id="heroAccent" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="32" fill="none" stroke="url(#heroAccent)" strokeWidth="3" />
        </svg>

        <div className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/4 translate-x-[50%] z-0 hidden md:block text-center">
          <div className="rounded-3xl bg-white/15 dark:bg-[#0b1220]/40 ring-1 ring-black/10 dark:ring-white/10 supports-[backdrop-filter]:backdrop-blur-sm p-5 shadow-xl">
            <Logo size={120} className="rounded-2xl" />
          </div>
        </div>

        {/* Hero más compacto */}
        <div className="max-w-screen-lg mx-auto px-4 pt-6 pb-12 min-h-[420px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">
            <div>
              <div className="flex items-center gap-10">
                <p className="text-[32px] font-semibold tracking-widest uppercase text-sky-200">Bienvenido</p>
                <h3 className="mt-1 text-2xl md:text-3xl font-bold leading-tight">{displayName}</h3>
              </div>
              {companyName && (
                <p className="mt-1 text-sm text-sky-100/90">{companyName}</p>
              )}

              {/* Guía breve – tres pasos (rellena sin métricas) */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sky-100/90">
                {quickStartSteps.map((step, idx) => (
                  <div key={idx} className="rounded-lg p-3 bg-white/12">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-white/20 text-[11px]">{idx + 1}</span>
                      <span className="text-xs">{step}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tarjetas “Qué encontrarás” integradas al hero */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isHydrating ? (
                  <>
                    {[0, 1, 2].map((i) => (
                      <Card
                        key={i}
                        className="rounded-2xl backdrop-blur-xl shadow-md ring-1 ring-black/5 dark:ring-white/10 bg-white/70 dark:bg-[#0b1220]/70"
                      >
                        <CardHeader className="px-4 pt-4">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded bg-slate-200/70 dark:bg-slate-700/50 animate-pulse" />
                            <div className="h-4 w-28 rounded bg-slate-200/70 dark:bg-slate-700/50 animate-pulse" />
                          </div>
                        </CardHeader>
                        <CardBody className="px-4 pb-4">
                          <div className="h-3 w-3/4 rounded bg-slate-200/70 dark:bg-slate-700/50 animate-pulse" />
                        </CardBody>
                      </Card>
                    ))}
                  </>
                ) : (
                  featureCards.map((f, idx) => (
                    <Card
                      key={idx}
                      className={`rounded-2xl backdrop-blur-xl shadow-md ring-1 ring-black/5 dark:ring-white/10 ${f.bg}`}
                    >
                      <CardHeader className="px-4 pt-4">
                        {f.icon}
                        <div className="flex items-center gap-3 text-center">

                          <h2 className={`text-sm font-semibold ${f.titleColor}`}>{f.title}</h2>
                        </div>
                      </CardHeader>
                      <CardBody className="px-4 pb-4 text-center">
                        <p className={`text-xs ${f.descColor}`}>{f.desc}</p>
                      </CardBody>
                    </Card>
                  ))
                )}
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="pointer-events-none absolute -z-10 inset-0">
                {/* fondos decorativos del hero */}
                <div className="absolute left-8 top-6 w-48 h-48 rounded-full bg-gradient-to-tr from-sky-400/40 to-violet-500/40 blur-2xl opacity-70" />
                <svg className="absolute right-6 top-8 w-40 h-40 opacity-20" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#ffffff" strokeOpacity="0.20" strokeWidth="2" />
                  <circle cx="60" cy="60" r="35" fill="none" stroke="#ffffff" strokeOpacity="0.15" strokeWidth="2" />
                </svg>
                <svg className="absolute left-0 bottom-0 w-36 h-24 opacity-20" viewBox="0 0 140 80">
                  <defs>
                    <pattern id="dots" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                      <circle cx="1.5" cy="1.5" r="1.5" fill="#ffffff" opacity="0.18" />
                    </pattern>
                  </defs>
                  <rect x="0" y="0" width="140" height="80" fill="url(#dots)" />
                </svg>
              </div>

              {/* Ilustración del teacher restaurada y mejorada */}
              <div className="relative">
                <div className="absolute -inset-5 rounded-[28px] bg-gradient-to-tr from-sky-400/25 via-indigo-400/25 to-violet-500/25 blur-2xl" />
                <img
                  src={bannerIllustration}
                  alt="Ilustración del portal"
                  className="relative z-10 w-full max-w-[20rem] lg:max-w-[24rem] rounded-2xl object-contain drop-shadow-xl"
                />

              </div>
            </div>
          </div>
        </div>

        {/* Onda decorativa inferior para cerrar el hero */}
        <svg
          className="absolute inset-x-0 bottom-0 -z-10"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z"
            className="fill-white/85 dark:fill-[#0f172a]/85"
          />
        </svg>

        {/* Panel flotante divisorio */}
        <div className="pointer-events-auto absolute left-1/2 bottom-0 z-40 w-full max-w-screen-lg -translate-x-1/2 translate-y-1/2 px-5 mt-8">
          {isHydrating ? (
            <Card className="rounded-3xl bg-white/80 dark:bg-[#0f172a]/80 supports-[backdrop-filter]:backdrop-blur-xl ring-1 ring-black/10 dark:ring-white/10 shadow-xl max-w-4xl mx-auto">
              <CardHeader className="px-6 pt-5 flex items-center justify-center text-center gap-2">
                <span className="inline-flex">
                  <span className="w-5 h-5 rounded-full border-2 border-slate-300/70 dark:border-slate-600/70 border-t-transparent animate-spin" />
                </span>
                <span className="text-xl font-semibold">Preparando accesos…</span>
              </CardHeader>
              <CardBody className="px-6 pb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 justify-items-center">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-full max-w-sm rounded-2xl ring-1 ring-black/5 dark:ring-white/10 bg-white/70 dark:bg-[#0b1220]/70 supports-[backdrop-filter]:backdrop-blur p-4 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white/80 dark:bg-slate-700/40" />
                        <div className="h-4 w-28 rounded bg-slate-200/70 dark:bg-slate-700/50 animate-pulse" />
                      </div>
                      <div className="mt-3 h-8 w-36 rounded-full bg-slate-200/70 dark:bg-slate-700/50 animate-pulse" />
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          ) : (
            <DashboardBoundary>
              <ModulesPanel />
            </DashboardBoundary>
          )}
        </div>
      </section>

      {/* Separador para evitar solape con el panel flotante */}
      <div aria-hidden className="h-28 sm:h-40 lg:h-48" />



      {/* Oculto la sección independiente para evitar duplicados */}
      <section className="hidden w-full px-5 pt-8 pb-6 max-w-screen-lg mx-auto">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Qué encontrarás aquí</h3>
            <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">Capacidades del portal según tu rol.</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featureCards.map((f, idx) => (
            <Card key={idx} className={`rounded-2xl backdrop-blur-xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 ${f.bg}`}>
              <CardHeader className="px-5 pt-5">
                <div className="flex items-center gap-3">
                  {f.icon}
                  <h2 className={`text-base font-semibold ${f.titleColor}`}>{f.title}</h2>
                </div>
              </CardHeader>
              <CardBody className="px-5 pb-5">
                <p className={`text-xs ${f.descColor}`}>{f.desc}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>


    </main>
  );
}
