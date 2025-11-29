import React from "react";
import { Tooltip } from "@heroui/tooltip";

import { User } from "@/types/types";

interface MatchTooltipProps {
  user?: User; // 👈️ lo hacemos opcional
  searchTerm: string;
  children: React.ReactNode;
}

const getMatchedFields = (user?: User): string[] => {
  if (!user) return [];

  const matches: string[] = [];

  return matches;
};

const MatchTooltip: React.FC<MatchTooltipProps> = ({
  user,
  searchTerm,
  children,
}) => {
  const matched = getMatchedFields(user);

  if (!user || searchTerm.trim().length === 0 || matched.length === 0)
    return <>{children}</>;

  return (
    <Tooltip
      className="z-[999]"
      content={
        <div className="max-h-40 overflow-y-auto text-sm p-2 space-y-1">
          {matched.map((item, index) => {
            const highlighted = item.replace(
              new RegExp(searchTerm, "gi"),
              (match) => `<mark class="bg-warning-300">${match}</mark>`,
            );

            return (
              <div
                dangerouslySetInnerHTML={{ __html: highlighted }}
                key={`${item}-${index}`}
                className="px-2 py-1 rounded bg-default-100"
              />
            );
          })}
        </div>
      }
      placement="bottom-end"
    >
      {children}
    </Tooltip>
  );
};

export default MatchTooltip;
