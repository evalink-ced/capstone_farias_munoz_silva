// features/evaluacion/autoevaluacion/components/GridSkeleton.tsx
import { memo } from "react";

const GridSkeleton = memo(function GridSkeleton({ items = 6 }: { items?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-3xl border border-white/40 bg-white/80 p-6 backdrop-blur-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 h-5 w-3/4 rounded-lg bg-gray-200" />
              <div className="h-4 w-1/2 rounded-lg bg-gray-200" />
            </div>
            <div className="h-6 w-20 rounded-xl bg-gray-200" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="mr-3 h-8 w-8 rounded-xl bg-gray-200" />
              <div className="h-4 w-32 rounded bg-gray-200" />
            </div>
            <div className="flex items-center">
              <div className="mr-3 h-8 w-8 rounded-xl bg-gray-200" />
              <div className="h-4 w-40 rounded bg-gray-200" />
            </div>
          </div>
          <div className="mt-4 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 rounded bg-gray-200" />
              <div className="h-3 w-20 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

export default GridSkeleton;
