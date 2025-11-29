import { Spinner } from "@heroui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";

interface LoadingOverlayProps {
  isLoading: boolean;
  onFadeOutComplete?: () => void;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  onFadeOutComplete,
}) => {
  const [visible, setVisible] = useState(isLoading);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!isLoading) {
      timeout = setTimeout(() => {
        setVisible(false);
        onFadeOutComplete?.(); // Ejecuta navegación después del fade
      }, 600); // Coincide con duración exit
    } else {
      setVisible(true);
    }

    return () => clearTimeout(timeout);
  }, [isLoading, onFadeOutComplete]);

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-neutral-900"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6"
            exit={{ opacity: 0, scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeInOut", delay: 0.1 }}
          >
            <Spinner color="primary" size="lg" variant="gradient" />
            <div className="flex flex-col items-center text-center">
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Estamos preparando todo para ti
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Cargando, por favor espera unos segundos...
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;
