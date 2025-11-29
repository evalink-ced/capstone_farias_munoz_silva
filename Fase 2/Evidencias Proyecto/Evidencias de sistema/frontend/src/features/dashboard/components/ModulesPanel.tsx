import { useMemo } from "react";
import { Button } from "@heroui/button";
import { Skeleton } from "@heroui/skeleton";
import { Divider } from "@heroui/divider";
import { useNavigate } from "react-router-dom";

import { sections } from "@/data/sections";
import { usePermissions } from "@/hooks/usePermissions";
import { useSession } from "@/hooks/useSession";
import { useTheme } from "@/hooks/useTheme";

// Tipado seguro
type ModulesPanelProps = {
  title?: string;
  showCount?: boolean;
  focus?: "eva" | "all";
  className?: string; // Para inyectar clases extra si es necesario
};

export default function ModulesPanel({
  title, // Opcional: si se pasa, renderiza un título interno
  showCount = false,
  focus = "all",
  className = "",
}: ModulesPanelProps) {
  const navigate = useNavigate();
  const { hasAccess } = usePermissions();
  const { user } = useSession();

  // Theme Logic
  const themeId = user?.empresa?.theme ?? null;
  const { theme } = useTheme(themeId);
  const primaryColor = theme?.primary_color ?? "#3b82f6"; // Fallback a azul estándar

  // 1. Optimización: Filtrado de Secciones con useMemo
  const filteredModules = useMemo(() => {
    // A. Filtrar por permisos globales
    const accessibleSections = sections
      .map((section) => ({
        ...section,
        buttons: section.buttons.filter((btn) => hasAccess(btn.permiso)),
      }))
      .filter((section) => section.buttons.length > 0);

    // B. Filtrar por Foco (Evaluación vs Todo)
    if (focus === "eva") {
      return accessibleSections
        .map((s) => ({
          ...s,
          buttons: s.buttons.filter((btn) => /evalu/i.test(btn.label)),
        }))
        .filter((s) => s.buttons.length > 0);
    }

    return accessibleSections;
  }, [focus, hasAccess]); // Dependencias correctas

  const count = filteredModules.length;
  const isLoading = !user; // O tu lógica de loading específica

  // --- RENDER: Loading State ---
  if (isLoading) {
    return (
      <div
        className={`w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-100 p-4 space-y-3 bg-white/50"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="rounded-lg w-10 h-10" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-24 rounded-lg" />
                <Skeleton className="h-2 w-16 rounded-lg" />
              </div>
            </div>
            <Skeleton className="h-8 w-full rounded-full mt-2" />
          </div>
        ))}
      </div>
    );
  }

  // --- RENDER: Empty State ---
  if (count === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
        <span className="text-4xl mb-2">🔒</span>
        <p className="text-gray-500 font-medium">No hay módulos disponibles</p>
        <p className="text-xs text-gray-400">
          Contacta a tu administrador si crees que es un error.
        </p>
      </div>
    );
  }

  // --- RENDER: Content Grid ---
  return (
    <div className={`w-full ${className}`}>
      {/* Título opcional interno (útil si se usa fuera del Hero) */}
      {title && (
        <div className="mb-4 flex items-center gap-2">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            {title}
          </h3>
          {showCount && (
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
              {count}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModules.map((module, idx) => (
          <ModuleCard
            key={`${module.title}-${idx}`}
            module={module}
            primaryColor={primaryColor}
            onNavigate={navigate}
          />
        ))}
      </div>
    </div>
  );
}

// --- Subcomponente: Module Card (Para mantener limpio el código) ---
type ModuleCardProps = {
  module: any; // Define tu tipo Section aquí si lo tienes
  primaryColor: string;
  onNavigate: (path: string) => void;
};

const ModuleCard = ({ module, primaryColor, onNavigate }: ModuleCardProps) => {
  return (
    <div className="group relative flex flex-col p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md hover:border-blue-200 hover:-translate-y-1">
      {/* Header de la Card */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-colors group-hover:bg-opacity-20 bg-gray-50 dark:bg-gray-700"
            style={{ color: primaryColor }} // Icono toma el color de la marca
          >
            {module.icon}
          </div>
          <div>
            <h4 className="font-bold text-gray-800 dark:text-white text-sm leading-tight">
              {module.title}
            </h4>
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
              {module.buttons.length} Acciones
            </span>
          </div>
        </div>
      </div>

      {/* Separador sutil */}
      <Divider className="my-2 bg-gray-50 dark:bg-gray-700" />

      {/* Lista de Botones */}
      <div className="flex flex-col gap-2 mt-auto">
        {module.buttons.map((btn: any, btnIdx: number) => (
          <Button
            key={btnIdx}
            className="justify-start h-9 w-full bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium"
            size="sm"
            startContent={
              // Pequeño punto de color indicador
              <span
                className="w-1.5 h-1.5 rounded-full mr-1"
                style={{ backgroundColor: primaryColor }}
              />
            }
            variant="flat"
            onPress={() => onNavigate(btn.href)}
          >
            {btn.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
