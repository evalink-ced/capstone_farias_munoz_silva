// ModulesPanel: unificado, configurable y con filtro de evaluación/autoevaluación
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { useNavigate } from "react-router-dom";
import { sections } from "@/data/sections";
import { usePermissions } from "@/hooks/usePermissions";
import { useSession } from "@/hooks/useSession";
import { useTheme } from "@/hooks/useTheme";

type ModulesPanelProps = {
    title?: string;
    showCount?: boolean;
    focus?: "eva" | "all";
};

export default function ModulesPanel({
    title = "Accesos",
    showCount = false,
    focus = "all",
}: ModulesPanelProps) {
    const navigate = useNavigate();
    const { hasAccess } = usePermissions();
    const { user } = useSession();
    const themeId = user?.empresa?.theme ?? null;
    const { theme } = useTheme(themeId);

    // Secciones visibles según permisos
    const visibleSections = sections
        .map((section) => {
            const filteredButtons = section.buttons.filter((btn) => hasAccess(btn.permiso));
            return { ...section, buttons: filteredButtons };
        })
        .filter((section) => section.buttons.length > 0);

    // Foco en evaluación/autoevaluación aplicado a nivel de acción dentro de cada sección
    const sectionsWithFocus =
        focus === "eva"
            ? visibleSections
                  .map((s) => ({ ...s, buttons: s.buttons.filter((btn) => /evalu/i.test(btn.label)) }))
                  .filter((s) => s.buttons.length > 0)
            : visibleSections;

    // UNA tarjeta por sección, con TODAS sus acciones visibles dentro
    const moduleCards = sectionsWithFocus.map((s) => ({
        title: s.title,
        icon: s.icon,
        actions: s.buttons.map((btn) => ({ label: btn.label, href: btn.href })),
    }));

    const count = moduleCards.length;

    // Subtítulo contextual según foco
    const subtitle =
        focus === "eva"
            ? "Módulos de evaluación y autoevaluación"
            : "Módulos disponibles";

    // Clases de grid según cantidad para centrar tarjetas
    const gridClass =
        count <= 1
            ? "grid grid-cols-1 justify-items-center"
            : count === 2
                ? "grid grid-cols-1 sm:grid-cols-2 justify-items-center"
                : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

    // Contraste y estilo según tema (sin cambios)
    const getContrastText = (hex: string) => {
        const c = (hex || "#3b82f6").replace("#", "");
        const r = parseInt(c.substring(0, 2), 16);
        const g = parseInt(c.substring(2, 4), 16);
        const b = parseInt(c.substring(4, 6), 16);
        const yiq = (r * 299 + g * 587 + b * 114) / 1000;
        return yiq >= 140 ? "#111827" : "#ffffff";
    };

    const primary = theme?.primary_color ?? "#3b82f6";
    const textOnPrimary = theme?.button_text_color ?? getContrastText(primary);
    const buttonStyle = { backgroundColor: primary, color: textOnPrimary };

    return (
        <div className="w-full">
            {count === 0 && (
                <Card className="rounded-3xl bg-white/80 dark:bg-[#0f172a]/80 supports-[backdrop-filter]:backdrop-blur-xl ring-1 ring-black/10 dark:ring-white/10 shadow-xl max-w-4xl mx-auto">
                    <CardHeader className="px-6 pt-5 flex items-center justify-center text-center gap-2">
                        <span className="inline-flex">
                            <span className="w-5 h-5 rounded-full border-2 border-slate-300/70 dark:border-slate-600/70 border-t-transparent animate-spin" />
                        </span>
                        <span className="text-base font-semibold">Cargando accesos…</span>
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
            )}

            {count > 0 && (
                <Card className="rounded-3xl bg-white/80 dark:bg-[#0f172a]/80 supports-[backdrop-filter]:backdrop-blur-xl ring-1 ring-black/10 dark:ring-white/10 shadow-xl max-w-4xl mx-auto">
                    <CardHeader className="px-6 pt-5 flex flex-col items-center text-center gap-1">
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                            {title} {showCount && <span className="text-xs text-slate-500 dark:text-slate-400">· {count} módulos</span>}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
                    </CardHeader>
                    <CardBody className="px-6 pb-6">
                        <div className={`${gridClass} gap-3 sm:gap-4`}>
                            {moduleCards.map((m, i) => (
                                <div
                                    key={`${m.title}-${i}`}
                                    className="group w-full max-w-sm mx-auto rounded-2xl ring-1 ring-black/5 dark:ring-white/10 bg-white/70 dark:bg-[#0b1220]/70 supports-[backdrop-filter]:backdrop-blur p-4 flex flex-col gap-3 shadow-sm transition hover:shadow-md hover:-translate-y-[1px] text-center"
                                >
                                    <div className="flex items-center justify-center gap-3">
                                        <div
                                            className="w-9 h-9 rounded-lg flex items-center justify-center"
                                            style={{ backgroundColor: "rgba(255,255,255,0.7)", color: primary }}
                                        >
                                            <span className="text-lg">{m.icon}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{m.title}</p>
                                        </div>
                                    </div>

                                    {/* Grupo de acciones dentro del mismo target */}
                                    <div className="flex flex-wrap justify-center items-center gap-2">
                                        {m.actions.map((action, idx) => (
                                            <Button
                                                key={`${m.title}-${action.href}-${idx}`}
                                                className="rounded-full h-8 px-3 text-xs font-semibold shadow-sm hover:opacity-95 active:opacity-90"
                                                style={buttonStyle}
                                                variant="solid"
                                                onPress={() => navigate(action.href)}
                                            >
                                                {action.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    );
}