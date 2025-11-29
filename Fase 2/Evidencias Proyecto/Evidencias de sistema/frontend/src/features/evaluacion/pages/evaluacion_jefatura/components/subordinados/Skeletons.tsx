import { Skeleton } from "@heroui/skeleton";

export function HeaderSkeleton() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-6">
        <Skeleton className="w-20 h-20 rounded-2xl" />
        <div className="space-y-3 flex-1">
          <Skeleton className="w-80 h-8 rounded" />
          <Skeleton className="w-64 h-5 rounded" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid() {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <Skeleton key={item} className="w-full h-32 rounded-lg" />
        ))}
      </div>
      {[1, 2].map((year) => (
        <div key={year} className="space-y-6">
          <Skeleton className="w-full h-24 rounded-lg" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="w-full h-48 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
