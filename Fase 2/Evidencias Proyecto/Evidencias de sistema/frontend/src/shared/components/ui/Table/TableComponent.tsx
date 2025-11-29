import React, { useEffect, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Button } from "@heroui/button";
import { User as HeroUser } from "@heroui/user";
import { UserIcon } from "lucide-react";
import { Link } from "@heroui/link";

import MatchTooltip from "../Tooltip/MacthTooltip";

import PaginationFooter from "./PaginationFooter";

interface Column {
  key: string;
  label: string;
}

interface Props {
  columns: Column[];
  data: any[];
  buttonText?: string;
  onButtonClick?: (userId: number) => void;
  resizedAvatars?: { [key: string]: string };
  getButtonText?: (userId: number) => string;
  searchTerm: string;
  page: number;
  setPage: (page: number) => void;
}

const TableComponent: React.FC<Props> = ({
  columns,
  data,
  buttonText,
  onButtonClick,
  getButtonText,
  searchTerm,
  page,
  setPage,
}) => {
  const rowsPerPage = 12;

  useEffect(() => {
    sessionStorage.setItem("lastUserTablePage", page.toString());
  }, [page]);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const nombreA = (a.persona?.last_name || a.last_name || "").toLowerCase();
      const nombreB = (b.persona?.last_name || b.last_name || "").toLowerCase();

      return nombreA.localeCompare(nombreB);
    });
  }, [data]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;

    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, page]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  const extraerCampo = (item: any, campo: string) => {
    return (
      item.personas?.[campo]?.[campo] ??
      item[campo]?.[campo] ??
      item.personas?.[campo] ??
      item[campo] ??
      `Sin ${campo}`
    );
  };

  return (
    <Table
      isStriped
      aria-label="Tabla de usuarios"
      bottomContent={
        <PaginationFooter page={page} pages={totalPages} onChange={setPage} />
      }
      classNames={{
        td: "relative overflow-visible before:!content-none before:!bg-transparent before:!opacity-0",
        tr: "data-[hover=true]:bg-transparent data-[selected=true]:before:!bg-transparent",
      }}
      selectedKeys={new Set()} // <-- asegura 0 seleccionados
      selectionMode="none"
      onRowAction={undefined} // <-- por si arriba lo inyectan
    >
      <TableHeader>
        {columns.map((col) => (
          <TableColumn key={col.key} className="text-center py-4">
            {col.label}
          </TableColumn>
        ))}
      </TableHeader>

      <TableBody>
        {paginatedData.length === 0 ? (
          <TableRow>
            <TableCell className="text-center py-4" colSpan={columns.length}>
              No se encontraron resultados para: {searchTerm}
            </TableCell>
          </TableRow>
        ) : (
          paginatedData.map((item) => {
            const nombreCompleto =
              `${item.first_name ?? ""} ${item.last_name ?? ""}`.trim();
            const foto = item.foto_thumbnail
              ? `${import.meta.env.VITE_API_URL}${item.foto_thumbnail}`
              : undefined;

            return (
              <TableRow key={item.id} unselectable="off">
                {columns.map((col) => (
                  <TableCell key={col.key} className="text-left">
                    {col.key === "user" ? (
                      <MatchTooltip searchTerm={searchTerm} user={item}>
                        <HeroUser
                          avatarProps={{
                            showFallback: true,
                            radius: "full",
                            size: "lg",
                            src: foto,
                            color: "warning",
                            icon: <UserIcon />,
                            className: "object-cover bg-top",
                          }}
                          description={
                            item.email ? (
                              <Link href={`mailto:${item.email}`} size="sm">
                                {item.email}
                              </Link>
                            ) : (
                              "Sin email"
                            )
                          }
                          name={nombreCompleto || "Sin nombre"}
                        />
                      </MatchTooltip>
                    ) : col.key === "empresa" ||
                      col.key === "ciclo" ||
                      col.key === "cargo" ? (
                      extraerCampo(item, col.key)
                    ) : col.key === "completado" ? (
                      <span
                        className={
                          item.completado
                            ? "text-success-600 font-medium"
                            : "text-warning-600 font-medium"
                        }
                      >
                        {item.completado ? "✅ Completado" : "🕒 Pendiente"}
                      </span>
                    ) : col.key === "accion" && buttonText && onButtonClick ? (
                      <Button
                        className="relative z-10"
                        color={item.completado ? "success" : "secondary"}
                        variant="ghost"
                        onPress={(e) => {
                          // @ts-ignore (HeroUI PressEvent a veces no trae stopPropagation tipado)
                          e?.stopPropagation?.();
                          onButtonClick?.(item.id);
                        }}
                      >
                        {getButtonText
                          ? getButtonText(item.id)
                          : item.completado
                            ? "VER RESUMEN"
                            : buttonText}
                      </Button>
                    ) : (
                      <span className="text-default-500">
                        Usuario inválido error
                      </span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
};

export default TableComponent;
