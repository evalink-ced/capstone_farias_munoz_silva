import { memo, useState } from "react";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { Button } from "@heroui/button";
import { RefreshCw, Database, Trash2 } from "lucide-react";

import useUsersCache from "@/hooks/useUsersCache";
import useImageCache from "@/hooks/useImageCache";

interface CacheIndicatorProps {
  showDetails?: boolean;
  className?: string;
}

const CacheIndicator = memo(
  ({ showDetails = false, className = "" }: CacheIndicatorProps) => {
    const {
      lastFetch,
      isCacheValid,
      refreshUsers,
      invalidateCache: invalidateUsersCache,
    } = useUsersCache();

    const {
      cacheStats,
      clearCache: clearImageCache,
      clearCorsFailures,
    } = useImageCache();

    const [isRefreshing, setIsRefreshing] = useState(false);
    const hasCorsErrors = cacheStats.corsFailedCount > 0;

    // Función para formatear el tiempo transcurrido
    const getTimeAgo = (timestamp: number): string => {
      if (!timestamp) return "Nunca";

      const now = Date.now();
      const diff = now - timestamp;
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(minutes / 60);

      if (hours > 0) {
        return `Hace ${hours}h ${minutes % 60}m`;
      } else if (minutes > 0) {
        return `Hace ${minutes}m`;
      } else {
        return "Ahora mismo";
      }
    };

    // Función para formatear bytes
    const formatBytes = (bytes: number): string => {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    // Función para refrescar datos
    const handleRefresh = async () => {
      setIsRefreshing(true);
      try {
        await refreshUsers();
      } finally {
        setIsRefreshing(false);
      }
    };

    // Función para limpiar todos los cachés
    const handleClearCache = () => {
      invalidateUsersCache();
      clearImageCache();
    };

    // Determinar el color del indicador basado en el estado del caché
    const getCacheColor = (): "success" | "warning" | "danger" => {
      if (isCacheValid()) return "success"; // Agregar () para llamar la función
      if (lastFetch > 0) return "warning";

      return "danger";
    };

    // Determinar el texto del estado
    const getCacheStatus = (): string => {
      if (isCacheValid()) return "Caché válido"; // Agregar () para llamar la función
      if (lastFetch > 0) return "Caché expirado";

      return "Sin caché";
    };

    if (!showDetails) {
      return (
        <Tooltip
          className={className}
          content={
            <div className="p-2">
              <div className="font-semibold mb-1">Estado del Caché</div>
              <div className="text-sm space-y-1">
                <div>Usuarios: {getCacheStatus()}</div>
                <div>Última actualización: {getTimeAgo(lastFetch)}</div>
                <div>
                  Imágenes en caché: {cacheStats.size}/{cacheStats.maxSize}
                </div>
                <div>Tamaño: {formatBytes(cacheStats.totalBytes)}</div>
                {hasCorsErrors && (
                  <div className="text-orange-600">
                    URLs CORS: {cacheStats.corsFailedCount} (se reintentarán
                    automáticamente)
                  </div>
                )}
              </div>
            </div>
          }
        >
          <Chip
            color={getCacheColor()}
            size="sm"
            startContent={<Database size={14} />}
            variant="flat"
          >
            Caché
          </Chip>
        </Tooltip>
      );
    }

    return (
      <div
        className={`flex items-center gap-2 p-3 bg-default-50 rounded-lg ${className}`}
      >
        <div className="flex items-center gap-2">
          <Database className="text-default-600" size={16} />
          <div className="text-sm">
            <div className="font-medium">Sistema de Caché</div>
            <div className="text-default-500 text-xs">
              Usuarios: {getCacheStatus()} • Última actualización:{" "}
              {getTimeAgo(lastFetch)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <Chip color={getCacheColor()} size="sm" variant="flat">
            {cacheStats.size} imágenes
          </Chip>

          <Chip color="default" size="sm" variant="flat">
            {formatBytes(cacheStats.totalBytes)}
          </Chip>

          <Button
            isIconOnly
            className="min-w-unit-8 w-unit-8 h-unit-8"
            isLoading={isRefreshing}
            size="sm"
            variant="light"
            onPress={handleRefresh}
          >
            <RefreshCw size={14} />
          </Button>

          {hasCorsErrors && (
            <Button
              isIconOnly
              className="min-w-unit-8 w-unit-8 h-unit-8"
              color="warning"
              size="sm"
              title="Limpiar URLs CORS fallidas"
              variant="light"
              onPress={clearCorsFailures}
            >
              <RefreshCw size={12} />
            </Button>
          )}

          <Button
            isIconOnly
            className="min-w-unit-8 w-unit-8 h-unit-8"
            color="danger"
            size="sm"
            title="Limpiar todo el caché"
            variant="light"
            onPress={handleClearCache}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    );
  },
);

CacheIndicator.displayName = "CacheIndicator";

export default CacheIndicator;
