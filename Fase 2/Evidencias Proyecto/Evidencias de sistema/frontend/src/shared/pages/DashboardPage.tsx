import React, { useMemo } from "react";
// Asegúrate de que estos imports coinciden con tu librería de componentes (HeroUI / NextUI)
import { Card, CardBody } from "@heroui/card";

import { useNavigate } from "react-router-dom";

// Usamos solo iconos estándar de HeroIcons (Outline) para evitar errores
import {

  BuildingOfficeIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

// --- Imports de Lógica de Negocio ---
// Ajusta las rutas (@/...) según la estructura de tu proyecto
import { useSession } from "@/hooks/useSession";
import { usePermissions } from "@/hooks/usePermissions";
import { sections } from "@/data/sections";

// --- Tipos ---
interface DashboardAction {
  id: string;
  category: string;
  title: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

// --- Estilos de Categoría (Colores Educativos/Profesionales) ---
const CATEGORY_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  "RECURSOS HUMANOS": {
    color: "text-fuchsia-600",
    bg: "bg-fuchsia-50",
    border: "border-fuchsia-100"
  },
  "EVALUADOR": {
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100"
  },
  "TRABAJADOR": {
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100"
  },
  "DEFAULT": {
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-100"
  }
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { hasAccess } = usePermissions();
  const { user } = useSession();


  const displayName = user?.nombres?.split(" ")[0] || user?.username || "Docente";
  const companyName = user?.empresa?.name || user?.empresa?.nombre || "Institución Educativa";
  const companyLogoUrl = user?.empresa?.logo || user?.empresa?.logo_url || null;

  // --- Lógica de Descripciones Inspiradoras (Contexto Colegio) ---
  const getInspiringDescription = (title: string, category: string) => {
    const t = title.toLowerCase();
    const c = category.toLowerCase();

    if (t.includes("evaluación de")) {
      return "Reflexiona sobre tu práctica pedagógica, reconoce tus logros en el aula y detecta áreas de crecimiento personal.";
    }
    if (t.includes("evaluar")) {
      return "Brinda una mirada constructiva y guía el desarrollo profesional de tu equipo docente hacia la excelencia.";
    }
    if (t.includes("evaluación mixta")) {
      return "Una visión integral 180°: conecta tu autopercepción con la retroalimentación de tu liderazgo educativo.";
    }
    if (t.includes("plantilla")) {
      return "Crea plantillas de evaluación para facilitar la asignación y seguimiento de las mismas.";
    }
    if (t.includes("asignar")) {
      return "Asigna las evaluaciones de desempeño a los miembros de la comunidad educativa.";
    }
    if (t.includes("usuario")) {
      return "Gestiona los usuarios, roles y permisos dentro de la plataforma.";
    }

    // Fallbacks
    if (c.includes("trabajador")) return "Herramientas para gestionar tu trayectoria y evolución dentro del colegio.";
    if (c.includes("evaluador")) return "Gestiona las evaluaciones de tu equipo y fomenta el talento educativo.";

    return "Explora las herramientas diseñadas para potenciar la calidad educativa.";
  };

  // --- Memoización de Acciones (Botones) ---
  const { groupedActions, totalActions } = useMemo(() => {
    const groups: Record<string, DashboardAction[]> = {};
    let count = 0;

    if (sections && Array.isArray(sections)) {
      sections.forEach((section) => {
        if (!section.buttons) return;
        const validButtons = section.buttons.filter((btn) => hasAccess(btn.permiso));

        if (validButtons.length > 0) {
          const catName = section.title ? section.title.toUpperCase() : "GENERAL";
          if (!groups[catName]) groups[catName] = [];

          validButtons.forEach((btn) => {
            groups[catName].push({
              id: `${section.title}-${btn.label}`,
              category: catName,
              title: btn.label,
              href: btn.href,
              icon: section.icon || <DocumentTextIcon className="w-6 h-6" />,
              description: getInspiringDescription(btn.label, catName),
            });
            count++;
          });
        }
      });
    }
    return { groupedActions: groups, totalActions: count };
  }, [hasAccess]);

  // --- Control de Hidratación ---
  const [isHydrating, setIsHydrating] = React.useState(true);
  React.useEffect(() => {
    if (user) setTimeout(() => setIsHydrating(false), 300);
  }, [user]);

  return (
    <div className="w-full min-h-screen font-sans bg-[#F8FAFC] dark:bg-[#09090b] relative overflow-x-hidden">

      {/* 1. FONDO CON PATRÓN DE PUNTOS MEJORADO (VISIBLE EN MODO CLARO) */}
      {/* Usamos 'text-slate-400' para modo claro y 'dark:text-slate-800' para oscuro. 
          Esto hace que los puntos sean gris medio en fondo claro (visibles) y gris oscuro en fondo oscuro. */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none text-slate-400/40 dark:text-slate-800"
        style={{
          backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          // Opcional: Un mask para que se desvanezca suavemente hacia abajo y no corte de golpe
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)'
        }}>
      </div>

      {/* 2. GRADIENTE SUPERIOR SUAVE (Transparente arriba para ver los puntos) */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-transparent via-white/40 to-white/0 dark:from-transparent dark:via-slate-900/40 dark:to-transparent z-0"></div>

      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">

        {/* HERO BANNER */}
        <div className="mb-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-[2rem] p-6 md:p-8 border border-white/50 dark:border-gray-800 shadow-sm relative overflow-hidden">

          {/* Decoración superior sutil */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-80"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">

            {/* A. LOGO GRANDE */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-center p-4 shadow-sm">
                {companyLogoUrl ? (
                  <img
                    src={companyLogoUrl}
                    alt={companyName}
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                  />
                ) : (
                  <BuildingOfficeIcon className="w-10 h-10 text-gray-400" />
                )}
              </div>
            </div>

            {/* B. TEXTO CENTRAL */}
            <div className="flex-1 space-y-2">
              <span className="inline-block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                {companyName}
              </span>

              <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                Hola, {displayName} <span className="inline-block animate-bounce-slow">👋</span>
              </h1>

              <p className="text-gray-500 dark:text-gray-400 text-sm md:text-lg font-medium max-w-xl">
                Bienvenido a tu centro de excelencia. <span className="text-blue-600 dark:text-blue-400 font-bold">Tu impacto en el aula</span> y tu desarrollo profesional comienzan aquí.
              </p>
            </div>

            {/* C. WIDGET KPI */}
            <div className="w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-800 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3">
              <div className="text-left md:text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Módulos</p>
                <div className="flex items-baseline md:justify-end gap-1">
                  <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{totalActions}</span>
                  <span className="text-sm font-bold text-gray-500">Activos</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 3. GRID DE CONTENIDO */}
        <div className="space-y-10 pb-12">
          {isHydrating ? (
            // Skeleton de carga
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-44 rounded-2xl bg-white/60 animate-pulse border border-gray-100"></div>
              ))}
            </div>
          ) : (
            Object.entries(groupedActions).length > 0 ? (
              Object.entries(groupedActions).map(([category, actions], catIdx) => {
                const style = CATEGORY_STYLES[category] || CATEGORY_STYLES["DEFAULT"];

                return (
                  <div key={category} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${catIdx * 75}ms` }}>

                    {/* Título de Sección */}
                    <div className="flex items-center gap-3 mb-5 pl-1">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest ${style.bg} ${style.color} border ${style.border}`}>
                        {category}
                      </span>
                      <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800 border-t border-dashed border-gray-300 dark:border-gray-700"></div>
                    </div>

                    {/* Grid de Tarjetas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {actions.map((action, idx) => (
                        <Card
                          key={idx}
                          isPressable
                          onPress={() => navigate(action.href)}
                          className="w-full border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 h-full group rounded-2xl"
                        >
                          <CardBody className="p-6 flex flex-col justify-between h-full gap-4">

                            {/* Header de Tarjeta */}
                            <div className="flex justify-between items-start">
                              <div className={`p-3 rounded-xl ${style.bg} ${style.color} group-hover:scale-110 transition-transform duration-300`}>
                                {React.isValidElement(action.icon)
                                  ? React.cloneElement(action.icon as React.ReactElement)
                                  : <DocumentTextIcon className="w-6 h-6" />}
                              </div>
                              <ArrowRightIcon className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors transform group-hover:translate-x-1" />
                            </div>

                            {/* Contenido de Texto */}
                            <div>
                              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                                {action.title}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed line-clamp-3">
                                {action.description}
                              </p>
                            </div>

                            {/* Barra de progreso decorativa */}
                            <div className="w-full h-1 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden mt-1">
                              <div className="h-full w-0 group-hover:w-full transition-all duration-700 ease-out bg-gradient-to-r from-blue-400 to-purple-500"></div>
                            </div>

                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              // Estado vacío
              <div className="col-span-full py-16 flex flex-col items-center justify-center border border-dashed border-gray-200 bg-white/50 rounded-2xl">
                <ShieldCheckIcon className="w-12 h-12 text-gray-300 mb-2" />
                <h3 className="text-gray-900 font-bold">Sin módulos activos</h3>
                <p className="text-gray-500 text-sm mt-1">Todo parece estar en orden por ahora.</p>
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
}