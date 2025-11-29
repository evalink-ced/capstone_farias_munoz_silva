// features/usuario/components/UserProfile/ListSection.tsx
import React from "react";
import { motion } from "framer-motion";
import { Divider } from "@heroui/divider";

interface ListItem {
  titulo?: string;
  diplomado?: string;
  magister?: string;
  institucion?: string;
  anio?: number | string;
}

interface ListSectionProps {
  title: string;
  items: (string | ListItem)[];
  // nuevo: estilo/branding por sección
  icon?: React.ReactNode;
  accent?: {
    // clases tailwind para color/gradiente
    badgeBg?: string; // ej: "bg-blue-500"
    badgeText?: string; // ej: "text-white"
    cardGradient?: string; // ej: "from-blue-50 to-white dark:from-blue-900/20 dark:to-transparent"
    border?: string; // ej: "border-blue-200/60 dark:border-blue-400/20"
  };
}

const container = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25 },
  },
};

const list = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVar = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.18 } },
};

const ListSection: React.FC<ListSectionProps> = ({
  title,
  items,
  icon,
  accent,
}) => {
  if (!items || items.length === 0) return null;

  const {
    badgeBg = "bg-default-200 dark:bg-default-800",
    badgeText = "text-default-900 dark:text-default-100",
    cardGradient = "from-content1/50 to-content1/30",
    border = "border-divider/30",
  } = accent ?? {};

  const renderItem = (item: string | ListItem, index: number) => {
    if (typeof item === "string") {
      return (
        <motion.div
          key={index}
          className={`px-5 py-3 rounded-xl border ${border} bg-gradient-to-br ${cardGradient}`}
          variants={itemVar}
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-foreground/80">{item}</p>
          </div>
        </motion.div>
      );
    }

    const name = item.titulo || item.diplomado || item.magister || "Sin título";
    const institucion = item.institucion || "Sin institución";
    const anio = item.anio ?? "Sin año";

    return (
      <motion.div
        key={`${name}-${institucion}-${anio}-${index}`}
        className={`px-5 py-4 rounded-xl border ${border} bg-gradient-to-br ${cardGradient} hover:shadow-md transition-shadow`}
        variants={itemVar}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-base font-semibold text-foreground line-clamp-2">
              {name}
            </p>
            <p className="text-sm text-default-500 mt-0.5">
              {institucion} ({anio})
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.section
      animate="show"
      className="mb-8"
      initial="hidden"
      variants={container}
    >
      <Divider className="my-6 opacity-30" />
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${badgeBg} ${badgeText}`}>{icon}</div>
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="text-sm text-default-500">
            {items.length} {items.length === 1 ? "registro" : "registros"}
          </p>
        </div>
      </div>

      <motion.div
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial="hidden"
        variants={list}
      >
        {items.map(renderItem)}
      </motion.div>
    </motion.section>
  );
};

export default ListSection;
