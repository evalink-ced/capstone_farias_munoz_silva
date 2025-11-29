// features/usuario/components/UserProfile/UserDegrees.tsx
import React from "react";
import { motion } from "framer-motion";
import { Divider } from "@heroui/divider";
import { GraduationCap, Award, BookOpen } from "lucide-react";
import ListSection from "@/features/usuario/components/UserProfile/ListSection";

import { Titulo, Magister, Diplomado } from "@/types/types";



interface Props {
  user: { titulos?: Titulo[]; magisters?: Magister[]; diplomados?: Diplomado[] };
}

const EmptyState: React.FC = () => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
    <div className="w-16 h-16 bg-default-100 dark:bg-default-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <GraduationCap className="w-8 h-8 text-default-400" />
    </div>
    <h3 className="text-lg font-semibold text-default-600 dark:text-default-300 mb-2">Sin información académica</h3>
    <p className="text-sm text-default-400">No hay datos académicos registrados en el sistema.</p>
  </motion.div>
);

// ---- Helpers ----
function yearFrom(dateLike?: string | number | Date): number | string | undefined {
  if (!dateLike) return undefined;
  const d = new Date(dateLike);
  return isNaN(d.getTime()) ? undefined : d.getFullYear();
}

function toListItems(items: any[] = []) {
  return items.map((it) => ({
    titulo: it?.nombre ?? it?.titulo ?? it?.diplomado ?? it?.magister ?? "Sin título",
    institucion: it?.institucion ?? it?.universidad ?? "Sin institución",
    anio: it?.anio ?? yearFrom(it?.fecha_obtencion) ?? yearFrom(it?.fecha) ?? "Sin año",
  }));
}

const UserDegrees: React.FC<Props> = ({ user }) => {
  const titulos = toListItems(user?.titulos);
  const magisters = toListItems(user?.magisters);
  const diplomados = toListItems(user?.diplomados);

  const hasData = (titulos.length + magisters.length + diplomados.length) > 0;
  if (!hasData) return <EmptyState />;

  // colores por sección
  const accents = {
    titulos: {
      badgeBg: "bg-blue-500",
      badgeText: "text-white",
      cardGradient: "from-blue-50 to-white dark:from-blue-900/20 dark:to-transparent",
      border: "border-blue-200/60 dark:border-blue-400/20",
    },
    magister: {
      badgeBg: "bg-purple-500",
      badgeText: "text-white",
      cardGradient: "from-purple-50 to-white dark:from-purple-900/20 dark:to-transparent",
      border: "border-purple-200/60 dark:border-purple-400/20",
    },
    diplomados: {
      badgeBg: "bg-green-500",
      badgeText: "text-white",
      cardGradient: "from-green-50 to-white dark:from-green-900/20 dark:to-transparent",
      border: "border-green-200/60 dark:border-green-400/20",
    },
  };

  // Resumen superior con animación y color
  const summary = [
    { icon: <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-300" />, label: "Títulos", count: titulos.length, ring: "ring-blue-200/60 dark:ring-blue-400/20" },
    { icon: <Award className="w-4 h-4 text-purple-600 dark:text-purple-300" />, label: "Magíster", count: magisters.length, ring: "ring-purple-200/60 dark:ring-purple-400/20" },
    { icon: <BookOpen className="w-4 h-4 text-green-600 dark:text-green-300" />, label: "Diplomados", count: diplomados.length, ring: "ring-green-200/60 dark:ring-green-400/20" },
  ];

  return (
    <div className="space-y-8">
      {/* Resumen */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.08 } }
        }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {summary.map((s) => (
          <motion.div key={s.label}
            variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.22 } } }}
            className={`p-4 rounded-xl border border-divider/30 bg-content1/50 dark:bg-content1/30 ring-1 ${s.ring}`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-default-200/50 dark:bg-default-800/50">{s.icon}</div>
              <div>
                <p className="text-sm font-medium text-default-600 dark:text-default-300">{s.label}</p>
                <p className="text-2xl font-bold">{s.count}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <Divider className="opacity-30" />

      {/* Secciones con ListSection + colores/animaciones */}
      <div className="space-y-2">
        <ListSection
          title="Títulos Universitarios"
          items={titulos}
          icon={<GraduationCap className="w-5 h-5 text-white" />}
          accent={accents.titulos}
        />
        <ListSection
          title="Magíster"
          items={magisters}
          icon={<Award className="w-5 h-5 text-white" />}
          accent={accents.magister}
        />
        <ListSection
          title="Diplomados y Certificaciones"
          items={diplomados}
          icon={<BookOpen className="w-5 h-5 text-white" />}
          accent={accents.diplomados}
        />
      </div>
    </div>
  );
};

export default UserDegrees;
