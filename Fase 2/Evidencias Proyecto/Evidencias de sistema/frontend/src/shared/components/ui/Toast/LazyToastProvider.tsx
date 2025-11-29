// components/LazyToastProvider.tsx
import { lazy, Suspense } from "react";

const LazyToast = lazy(() => import("./ToastWrapper"));

export default function LazyToastProvider() {
  return (
    <Suspense fallback={null}>
      <LazyToast />
    </Suspense>
  );
}
