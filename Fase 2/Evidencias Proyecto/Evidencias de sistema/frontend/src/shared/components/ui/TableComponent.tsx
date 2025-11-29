import React, { useEffect, useMemo, memo, useCallback, JSX } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Chip } from "@heroui/chip";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

import PaginationFooter from "./PaginationFooter";
import MatchTooltip from "./Tooltip/MacthTooltip";
import OptimizedAvatar from "./OptimizedAvatar";

import { buildFileUrl } from "@/utils/urlUtils";

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
  isLoading?: boolean;
  renderCell?: (item: any, columnKey: string) => JSX.Element | undefined;
}

// Componente mejorado para el usuario
const UserCell = memo(
  ({
    item,
    foto,
    nombreCompleto,
    searchTerm,
  }: {
    item: any;
    foto?: string;
    nombreCompleto: string;
    searchTerm: string;
  }) => {
    return (
      <MatchTooltip searchTerm={searchTerm} user={item}>
        <div className="flex items-center gap-3 py-2">
          <OptimizedAvatar
            className="object-cover bg-top flex-shrink-0"
            color="warning"
            name={nombreCompleto || "Sin nombre"}
            radius="lg"
            showFallback={true}
            showName={false}
            size="md"
            src={foto}
          />
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {nombreCompleto || "Sin nombre"}
            </p>
            {item.email ? (
              <Link
                className="text-xs text-default-500 hover:text-primary transition-colors"
                href={`mailto:${item.email}`}
                size="sm"
              >
                {item.email}
              </Link>
            ) : (
              <span className="text-xs text-default-400">Sin email</span>
            )}
          </div>
        </div>
      </MatchTooltip>
    );
  },
);

UserCell.displayName = "UserCell";

// Componente mejorado para el estado
const StatusChip = memo(({ estado }: { estado: boolean }) => {
  if (estado) {
    return (
      <Chip
        color="success"
        size="sm"
        startContent={<CheckCircle className="w-3 h-3" />}
        variant="flat"
      >
        Completado
      </Chip>
    );
  }

  return (
    <Chip
      color="warning"
      size="sm"
      startContent={<Clock className="w-3 h-3" />}
      variant="flat"
    >
      Pendiente
    </Chip>
  );
});

StatusChip.displayName = "StatusChip";

// Componente mejorado para el botón de acción
const ActionButton = memo(
  ({
    item,
    buttonText,
    onButtonClick,
    getButtonText,
    isLoading,
  }: {
    item: any;
    buttonText?: string;
    onButtonClick?: (userId: number) => void;
    getButtonText?: (userId: number) => string;
    isLoading?: boolean;
  }) => {
    const handleClick = useCallback(() => {
      onButtonClick?.(item.id);
    }, [onButtonClick, item.id]);

    if (!buttonText || !onButtonClick) {
      return (
        <Chip
          color="danger"
          size="sm"
          startContent={<AlertCircle className="w-3 h-3" />}
          variant="flat"
        >
          Error
        </Chip>
      );
    }

    return (
      <Button
        className="font-medium"
        color={item.completado ? "success" : "primary"}
        isDisabled={isLoading}
        isLoading={isLoading}
        size="sm"
        variant={item.completado ? "flat" : "solid"}
        onPress={handleClick}
      >
        {isLoading
          ? "Cargando..."
          : getButtonText
            ? getButtonText(item.id)
            : buttonText}
      </Button>
    );
  },
);

ActionButton.displayName = "ActionButton";

// Componente para campos de información
const InfoField = memo(({ value }: { value: string }) => {
  if (!value || value.startsWith("Sin ")) {
    return (
      <Chip color="danger" size="sm" variant="flat">
        {value || "No disponible"}
      </Chip>
    );
  }

  return <span className="text-sm text-foreground font-medium">{value}</span>;
});

InfoField.displayName = "InfoField";

const TableComponent: React.FC<Props> = memo(
  ({
    columns,
    data,
    buttonText,
    onButtonClick,
    getButtonText,
    searchTerm,
    page,
    setPage,
    isLoading = false,
    renderCell,
  }) => {
    const rowsPerPage = 4;

    useEffect(() => {
      sessionStorage.setItem("lastUserTablePage", page.toString());
    }, [page]);

    const sortedData = useMemo(() => {
      return [...data].sort((a, b) => {
        const nombreA = (
          a.persona?.last_name ||
          a.last_name ||
          ""
        ).toLowerCase();
        const nombreB = (
          b.persona?.last_name ||
          b.last_name ||
          ""
        ).toLowerCase();

        return nombreA.localeCompare(nombreB);
      });
    }, [data]);

    const paginatedData = useMemo(() => {
      const start = (page - 1) * rowsPerPage;

      return sortedData.slice(start, start + rowsPerPage);
    }, [sortedData, page]);

    const totalPages = Math.ceil(sortedData.length / rowsPerPage);

    const extraerCampo = useCallback((item: any, campo: string) => {
      return (
        item.personas?.[campo]?.[campo] ??
        item[campo]?.[campo] ??
        item.personas?.[campo] ??
        item[campo] ??
        `Sin ${campo}`
      );
    }, []);

    const getUserPhotoUrl = useCallback((item: any) => {
      return item.foto_thumbnail
        ? buildFileUrl(item.foto_thumbnail)
        : undefined;
    }, []);

    return (
      <div className="w-full">
        <Table
          aria-label="Tabla de usuarios"
          bottomContent={
            <div className="flex justify-center py-4">
              <PaginationFooter
                page={page}
                pages={totalPages}
                onChange={setPage}
              />
            </div>
          }
          className="min-h-[400px]"
          classNames={{
            wrapper: "shadow-none border-none",
            th: "bg-default-100 text-default-700 font-semibold text-xs uppercase tracking-wide",
            td: "py-4",
            tbody: "divide-y divide-default-200",
          }}
        >
          <TableHeader>
            {columns.map((col) => (
              <TableColumn key={col.key} className="text-left">
                {col.label}
              </TableColumn>
            ))}
          </TableHeader>

          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  className="text-center py-12"
                  colSpan={columns.length}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-default-100 rounded-full">
                      <AlertCircle className="w-6 h-6 text-default-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-default-600">
                        No se encontraron resultados
                      </p>
                      <p className="text-xs text-default-400">
                        para la búsqueda &quot;{searchTerm}&quot;
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => {
                const nombreCompleto =
                  `${item.first_name ?? ""} ${item.last_name ?? ""}`.trim();
                const foto = getUserPhotoUrl(item);

                return (
                  <TableRow
                    key={item.id}
                    className="hover:bg-default-50 transition-colors"
                  >
                    {columns.map((col) => (
                      <TableCell key={col.key} className="align-center">
                        {(() => {
                          // Primero verificar si hay renderCell personalizado
                          if (renderCell) {
                            const customRender = renderCell(item, col.key);

                            if (customRender !== undefined) {
                              return customRender;
                            }
                          }

                          // Renderizado por defecto
                          if (col.key === "user") {
                            return (
                              <UserCell
                                foto={foto}
                                item={item}
                                nombreCompleto={nombreCompleto}
                                searchTerm={searchTerm}
                              />
                            );
                          } else if (
                            col.key === "empresa" ||
                            col.key === "ciclo" ||
                            col.key === "cargo"
                          ) {
                            return (
                              <InfoField value={extraerCampo(item, col.key)} />
                            );
                          } else if (col.key === "estado_texto") {
                            return <InfoField value={item.estado_texto} />;
                          } else if (col.key === "estado") {
                            return <StatusChip estado={item.completado} />;
                          } else if (col.key === "accion") {
                            return (
                              <ActionButton
                                buttonText={buttonText}
                                getButtonText={getButtonText}
                                isLoading={isLoading}
                                item={item}
                                onButtonClick={onButtonClick}
                              />
                            );
                          } else {
                            return (
                              <Chip color="danger" size="sm" variant="flat">
                                Error
                              </Chip>
                            );
                          }
                        })()}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    );
  },
);

TableComponent.displayName = "TableComponent";

export default TableComponent;
