import React, { memo, useState, useEffect, useCallback, useMemo } from "react";
import { User as HeroUser } from "@heroui/user";
import { Avatar } from "@heroui/avatar";
import { UserIcon } from "lucide-react";
import { Skeleton } from "@heroui/skeleton";

import useImageCache from "@/hooks/useImageCache";

// Tipos más específicos y constantes
type AvatarSize = "sm" | "md" | "lg";
type AvatarRadius = "none" | "sm" | "md" | "lg" | "full";
type AvatarColor =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger";

interface OptimizedAvatarProps {
  src?: string | null;
  name?: string;
  description?: React.ReactNode;
  size?: AvatarSize;
  radius?: AvatarRadius;
  className?: string;
  showFallback?: boolean;
  color?: AvatarColor;
  showName?: boolean;
  onImageLoad?: () => void;
  onImageError?: (error: Error) => void;
}
const OptimizedAvatar = memo<OptimizedAvatarProps>(function OptimizedAvatar({
  src,
  name,
  description,
  size = "md",
  radius = "lg",
  className = "",
  showFallback = true,
  color = "default",
  showName = true,
  onImageLoad,
  onImageError,
}) {
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [imageError, setImageError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const { cacheImage, getCachedImage } = useImageCache();

  // Validar y normalizar la URL - SIMPLIFICADO
  const normalizedSrc = useMemo(() => {
    if (!src || typeof src !== "string") {
      if (import.meta.env.DEV)
        console.log("OptimizedAvatar: No src provided or invalid type:", src);

      return undefined;
    }

    const trimmedSrc = src.trim();

    if (!trimmedSrc) {
      if (import.meta.env.DEV)
        console.log("OptimizedAvatar: Empty src after trim");

      return undefined;
    }

    if (import.meta.env.DEV)
      console.log("OptimizedAvatar: Using normalized src:", trimmedSrc);

    return trimmedSrc;
  }, [src]);

  const isCorsProne = useMemo(() => {
    if (!normalizedSrc) return false;

    return (
      normalizedSrc.includes("storage.googleapis.com") ||
      normalizedSrc.includes("googleusercontent.com") ||
      normalizedSrc.includes("drive.google.com") ||
      normalizedSrc.includes("lh3.googleusercontent.com")
    );
  }, [normalizedSrc]);

  // Manejar errores de imagen
  const handleImageError = useCallback(() => {
    if (import.meta.env.DEV)
      console.warn(`OptimizedAvatar: Image failed to load: ${normalizedSrc}`);
    setImageError(true);
    setImageSrc(undefined);
    setIsImageLoading(false);

    const error = new Error(
      `Failed to load image: ${normalizedSrc || "unknown"}`,
    );

    onImageError?.(error);
  }, [normalizedSrc, onImageError]);

  // Manejar carga exitosa
  const handleImageLoad = useCallback(() => {
    if (import.meta.env.DEV)
      console.log("OptimizedAvatar: Image loaded successfully:", normalizedSrc);
    setImageError(false);
    setIsImageLoading(false);
    onImageLoad?.();
  }, [normalizedSrc, onImageLoad]);

  // Efecto para cargar imagen con caché
  useEffect(() => {
    setImageError(false);
    setIsImageLoading(false);
    setImageSrc(undefined);

    if (!normalizedSrc) {
      if (import.meta.env.DEV)
        console.log("OptimizedAvatar: No normalized src, showing fallback");
      setImageError(true);

      return;
    }

    // Si es una URL propensa a CORS, no intentar cachear: usar src directo
    if (isCorsProne) {
      setImageSrc(normalizedSrc);
      setIsImageLoading(false);

      return;
    }

    if (import.meta.env.DEV)
      console.log(
        "OptimizedAvatar: Starting cached image load for:",
        normalizedSrc,
      );
    setIsImageLoading(true);

    const cached = getCachedImage(normalizedSrc);

    if (cached) {
      setImageSrc(cached);
      handleImageLoad();

      return;
    }

    let cancelled = false;

    cacheImage(normalizedSrc)
      .then((dataUrl) => {
        if (cancelled) return;
        setImageSrc(dataUrl);
        handleImageLoad();
      })
      .catch((err) => {
        if (cancelled) return;
        if (import.meta.env.DEV)
          console.error("OptimizedAvatar: cacheImage error", err);
        handleImageError();
      });

    return () => {
      cancelled = true;
    };
  }, [
    normalizedSrc,
    isCorsProne,
    getCachedImage,
    cacheImage,
    handleImageError,
    handleImageLoad,
  ]);

  // Props del avatar
  const avatarProps = useMemo(
    () => ({
      showFallback: showFallback,
      radius,
      size,
      src: imageError ? undefined : imageSrc,
      color,
      icon: <UserIcon className="text-default-500" />,
      className,
    }),
    [showFallback, imageError, radius, size, imageSrc, color, className],
  );

  // Mostrar skeleton mientras carga
  if (isImageLoading) {
    const sizeClasses = {
      sm: "w-8 h-8",
      md: "w-10 h-10",
      lg: "w-12 h-12",
    };

    return (
      <div
        aria-label="Cargando avatar"
        className="flex items-center gap-3"
        role="status"
      >
        <Skeleton className={`rounded-${radius} ${sizeClasses[size]}`} />
        {showName && (name || description) && (
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-32 rounded" />
            {description && <Skeleton className="h-3 w-24 rounded" />}
          </div>
        )}
      </div>
    );
  }

  if (!showName) {
    return (
      <Avatar
        className={className}
        color={color as any}
        radius={radius as any}
        showFallback={showFallback}
        size={size as any}
        src={imageError ? undefined : imageSrc}
      >
        <UserIcon className="text-default-500" />
      </Avatar>
    );
  }

  return (
    <HeroUser
      avatarProps={avatarProps}
      description={description}
      name={name || ""}
    />
  );
});

OptimizedAvatar.displayName = "OptimizedAvatar";

export default OptimizedAvatar;
export type { OptimizedAvatarProps, AvatarSize, AvatarRadius, AvatarColor };
