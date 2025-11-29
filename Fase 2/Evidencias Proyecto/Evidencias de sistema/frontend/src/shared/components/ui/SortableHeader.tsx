import { Info } from "lucide-react";
import { Tooltip } from "@heroui/tooltip";
import React from "react";

interface SortableHeaderProps {
  label: string;
  tooltip: string;
  sortKey: string;
  currentSortKey: string;
  sortDirection: "asc" | "desc";
  onSort: (key: string) => void;
}

export const SortableHeader: React.FC<SortableHeaderProps> = ({
  label,
  tooltip,
  sortKey,
  currentSortKey,
  sortDirection,
  onSort,
}) => {
  const isActive = sortKey === currentSortKey;

  return (
    <th
      className="cursor-pointer select-none hover:text-violet-600 transition-colors whitespace-nowrap"
      onClick={() => onSort(sortKey)}
    >
      <div className="inline-flex items-center gap-1">
        <span>{label}</span>
        <Tooltip content={tooltip}>
          <Info className="w-4 h-4 text-gray-400 hover:text-gray-600" />
        </Tooltip>
        {isActive && (
          <span className="text-xs">{sortDirection === "asc" ? "▲" : "▼"}</span>
        )}
      </div>
    </th>
  );
};
