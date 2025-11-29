import React from "react";

interface UserSkeletonProps {
  rows?: number;
}

export const UserSkeleton: React.FC<UserSkeletonProps> = ({ rows = 5 }) => {
  return (
    <div className="animate-pulse w-full min-w-full">
      {/* Header skeleton que imita la tabla */}
      <div className="flex items-center space-x-4 py-3 border-b border-gray-300 w-full bg-gray-100">
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-gray-300 rounded w-20" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-gray-300 rounded w-16" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-gray-300 rounded w-20" />
        </div>
        <div className="w-24 flex-shrink-0">
          <div className="h-4 bg-gray-300 rounded w-16" />
        </div>
      </div>

      {/* Filas del skeleton */}
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center space-x-4 py-3 border-b border-gray-200 w-full"
        >
          <div className="flex-1 min-w-0 flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
          <div className="w-24 flex-shrink-0">
            <div className="h-8 bg-gray-200 rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserSkeleton;
