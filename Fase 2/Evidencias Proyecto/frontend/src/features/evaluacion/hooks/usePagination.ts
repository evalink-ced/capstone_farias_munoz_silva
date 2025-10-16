// hooks/usePagination.ts
import { useState } from "react";

export function usePagination<T>(items: T[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const total = items.length;

  const next = () => {
    if (currentIndex < total - 1) setCurrentIndex(currentIndex + 1);
  };

  const prev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const progress = Math.round(((currentIndex + 1) / total) * 100);
  const currentItem = items[currentIndex] as T; // <- forzar tipo aquí también

  return {
    currentIndex,
    currentItem,
    total,
    next,
    prev,
    progress,
    isFirst: currentIndex === 0,
    isLast: currentIndex === total - 1,
  };
}
