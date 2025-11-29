import { TableColumn } from "@heroui/table";
import { ChevronUp, ChevronDown } from "lucide-react";

interface Props {
  handleSort: (key: string) => void;
  sortKey: string;
  sortDirection: "asc" | "desc";
}

export const getTableColumns = (
  mostrarDiasCumpleaños: boolean,
  { handleSort, sortKey, sortDirection }: Props,
) => {
  const getHeader = (key: string, label: string, isSortable = true) => {
    const ariaSort: "none" | "ascending" | "descending" =
      sortKey === key
        ? sortDirection === "asc"
          ? "ascending"
          : "descending"
        : "none";

    const isActive = sortKey === key;

    return (
      <TableColumn
        key={key}
        aria-sort={ariaSort}
        className={`transition-colors ${
          isSortable ? "hover:bg-default-200 cursor-pointer" : ""
        } ${isActive ? "bg-default-100 font-semibold border-b-2 border-default-400" : ""}`}
        onClick={isSortable ? () => handleSort(key) : undefined}
      >
        <div className="inline-flex items-center gap-1 px-2 py-1">
          <span className="whitespace-nowrap">{label}</span>
          {isSortable && (
            <span className="text-xs">
              {isActive ? (
                sortDirection === "asc" ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )
              ) : (
                <span className="opacity-30">
                  <ChevronUp className="w-4 h-4 -mb-1" />
                </span>
              )}
            </span>
          )}
        </div>
      </TableColumn>
    );
  };

  const columns = [
    getHeader("first_name", "Nombre"),
    getHeader("dias_tomados", "Días Tomados"),
    getHeader("dias_restantes", "Días Restantes"),
  ];

  if (mostrarDiasCumpleaños) {
    columns.push(getHeader("dias_cumpleaños", "Días Cumpleaños"));
  }

  columns.push(getHeader("birthday", "Cumpleaños"));

  return {
    columns,
    columnKeys: [
      "first_name",
      "dias_tomados",
      "dias_restantes",
      ...(mostrarDiasCumpleaños ? ["dias_cumpleaños"] : []),
      "birthday",
    ],
  };
};
