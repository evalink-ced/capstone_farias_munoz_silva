import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Button } from "@heroui/button";
import { UserIcon, RefreshCw, AlertCircle } from "lucide-react";
import { Link } from "@heroui/link";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";

import MatchTooltip from "../Tooltip/MacthTooltip";
import OptimizedAvatar from "../OptimizedAvatar";

import PaginationFooter from "./PaginationFooter";

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
  renderCell?: (item: any, columnKey: string) => React.ReactNode;
  searchTerm: string;
  page: number;
  setPage: (page: number) => void;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

const ROWS_PER_PAGE_OPTIONS = [
  { key: "10", label: "10 por página" },
  { key: "25", label: "25 por página" },
  { key: "50", label: "50 por página" },
  { key: "100", label: "100 por página" },
];

const OptimizedTableComponent: React.FC<Props> = ({
  columns,
  data,
  buttonText,
  onButtonClick,
  getButtonText,
  renderCell,
  searchTerm,
  page,
  setPage,
  loading = false,
  error = null,
  onRefresh,
}) => {
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    const stored = sessionStorage.getItem("usersTableRowsPerPage");

    return stored ? parseInt(stored, 10) : 25; // Aumentar por defecto a 25
  });

  // Guardar preferencia de filas por página
  useEffect(() => {
    sessionStorage.setItem("usersTableRowsPerPage", rowsPerPage.toString());
  }, [rowsPerPage]);

  useEffect(() => {
    sessionStorage.setItem("lastUserTablePage", page.toString());
  }, [page]);

  const [filters, setFilters] = useState<{ [key: string]: string }>(() => ({
    user: "",
    user_eq: "",
    ciclo: "",
    ciclo_eq: "",
    cargo: "",
    cargo_eq: "",
    estado_texto: "",
  }));
  const normalizeFilters = useCallback((obj: { [key: string]: string }) => {
    const out: { [key: string]: string } = {};

    for (const [k, v] of Object.entries(obj)) out[k] = (v ?? "").trim();

    return out;
  }, []);
  const clearFilters = useCallback(() => {
    setFilters({
      user: "",
      user_eq: "",
      ciclo: "",
      ciclo_eq: "",
      cargo: "",
      cargo_eq: "",
      estado_texto: "",
    });
    setPage(1);
  }, [setPage]);

  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) {
      if (import.meta.env.DEV) console.warn("Data is not an array:", data);

      return [];
    }

    const f = normalizeFilters(filters);
    const d = data.filter((item) => {
      const nombre = `${item.first_name ?? ""} ${item.last_name ?? ""}`
        .toLowerCase()
        .trim();
      const ciclo = (item.ciclo ?? "").toLowerCase();
      const cargo = (item.cargo ?? "").toLowerCase();
      const estado = (item.estado ?? item.estado_texto ?? "").toLowerCase();

      const userOk =
        (!f.user || nombre.includes(f.user.toLowerCase().trim())) &&
        (!f.user_eq || nombre === f.user_eq.toLowerCase().trim());
      const cicloOk =
        (!f.ciclo || ciclo.includes(f.ciclo.toLowerCase())) &&
        (!f.ciclo_eq || ciclo === f.ciclo_eq.toLowerCase());
      const cargoOk =
        (!f.cargo || cargo.includes(f.cargo.toLowerCase())) &&
        (!f.cargo_eq || cargo === f.cargo_eq.toLowerCase());

      return (
        userOk &&
        cicloOk &&
        cargoOk &&
        (!f.estado_texto || estado.includes(f.estado_texto.toLowerCase()))
      );
    });

    return d;
  }, [data, filters, normalizeFilters]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const nombreA = (a.persona?.last_name || a.last_name || "").toLowerCase();
      const nombreB = (b.persona?.last_name || b.last_name || "").toLowerCase();

      return nombreA.localeCompare(nombreB);
    });
  }, [filteredData]);

  const ciclosOptions = useMemo(() => {
    const set = new Set<string>();

    for (const item of data || []) {
      const v = (item.ciclo ?? "").trim();

      if (v) set.add(v);
    }

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [data]);

  const cargosOptions = useMemo(() => {
    const set = new Set<string>();

    for (const item of data || []) {
      const v = (item.cargo ?? "").trim();

      if (v) set.add(v);
    }

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [data]);

  const ciclosItems = useMemo(() => {
    return ciclosOptions.map((c) => ({ key: c, label: c }));
  }, [ciclosOptions]);

  const cargosItems = useMemo(() => {
    return cargosOptions.map((c) => ({ key: c, label: c }));
  }, [cargosOptions]);

  const usersItems = useMemo(() => {
    const set = new Set<string>();

    for (const item of data || []) {
      const v =
        `${item.persona?.first_name ?? item.first_name ?? ""} ${item.persona?.last_name ?? item.last_name ?? ""}`.trim();

      if (v) set.add(v);
    }

    return Array.from(set)
      .sort((a, b) => a.localeCompare(b))
      .map((n) => ({ key: n, label: n }));
  }, [data]);

  const estadoItems = useMemo(() => {
    return [
      { key: "pendiente", label: "Pendiente" },
      { key: "retroalimentar", label: "Retroalimentar" },
      { key: "firmar", label: "Aceptar" },
      { key: "finalizado", label: "Finalizado" },
    ];
  }, []);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;

    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  // Ajustar página si es necesario cuando cambia rowsPerPage
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalPages, page, setPage]);

  const extraerCampo = useCallback((item: any, campo: string) => {
    return (
      item.personas?.[campo]?.[campo] ??
      item[campo]?.[campo] ??
      item.personas?.[campo] ??
      item[campo] ??
      `Sin ${campo}`
    );
  }, []);

  // 🔧 Función mejorada para obtener URL de foto usando buildFileUrl
  const getUserPhotoUrl = useCallback((item: any) => {
    // Priorizar foto_thumbnail, luego foto
    const photoPath = item.foto_thumbnail || item.foto;

    if (!photoPath) {
      if (import.meta.env.DEV)
        console.log(
          "No photo path found for user:",
          item.id,
          item.first_name,
          item.last_name,
        );

      return undefined;
    }

    const photoUrl = buildFileUrl(photoPath);

    if (import.meta.env.DEV)
      console.log(
        "Photo URL built for user:",
        item.id,
        "Path:",
        photoPath,
        "URL:",
        photoUrl,
      );

    return photoUrl;
  }, []);

  // Componente de información de paginación
  const PaginationInfo = () => {
    const start = (page - 1) * rowsPerPage + 1;
    const end = Math.min(page * rowsPerPage, sortedData.length);

    return (
      <div className="flex items-center gap-4 text-sm text-default-500">
        <span>
          Mostrando {start}-{end} de {sortedData.length} usuarios
        </span>
        <Select
          aria-label="Filas por página"
          className="w-40"
          selectedKeys={[rowsPerPage.toString()]}
          size="sm"
          onSelectionChange={(keys) => {
            const newRowsPerPage = parseInt(Array.from(keys)[0] as string, 10);

            setRowsPerPage(newRowsPerPage);
            setPage(1); // Reset a la primera página
          }}
        >
          {ROWS_PER_PAGE_OPTIONS.map((option) => (
            <SelectItem key={option.key}>{option.label}</SelectItem>
          ))}
        </Select>
      </div>
    );
  };

  // Mostrar error si existe
  if (error) {
    return (
      <div className="w-full p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-3 bg-danger-100 rounded-full">
            <AlertCircle className="w-6 h-6 text-danger-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-danger-600">
              Error al cargar usuarios
            </h3>
            <p className="text-sm text-default-500 mt-1">{error}</p>
          </div>
          {onRefresh && (
            <Button
              color="danger"
              startContent={<RefreshCw className="w-4 h-4" />}
              variant="flat"
              onPress={onRefresh}
            >
              Reintentar
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Información de paginación superior */}
      <div className="flex justify-between items-center mb-4 px-2">
        <PaginationInfo />
        <Button size="sm" variant="flat" onPress={clearFilters}>
          Limpiar filtros
        </Button>
      </div>

      <Table
        isStriped
        aria-label="Tabla de usuarios optimizada"
        bottomContent={
          <div className="flex flex-col gap-4">
            <div className="flex justify-center">
              <PaginationFooter
                page={page}
                pages={totalPages}
                onChange={setPage}
              />
            </div>
            <div className="flex justify-center">
              <PaginationInfo />
            </div>
          </div>
        }
        classNames={{
          td: "relative overflow-visible before:!content-none before:!bg-transparent before:!opacity-0",
          tr: "data-[hover=true]:bg-transparent data-[selected=true]:before:!bg-transparent",
          wrapper: "min-h-[400px]",
        }}
        selectedKeys={new Set()}
        selectionMode="none"
        onRowAction={undefined}
      >
        <TableHeader>
          {columns.map((col) => (
            <TableColumn key={col.key} className="text-center py-2">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-semibold text-default-700">
                  {col.label}
                </span>
                {col.key !== "accion" &&
                  (col.key === "estado_texto" ? (
                    <Autocomplete
                      allowsCustomValue
                      allowsEmptyCollection
                      aria-label="Estado"
                      inputValue={filters.estado_texto || ""}
                      items={estadoItems}
                      menuTrigger="focus"
                      placeholder="Filtrar estado..."
                      popoverProps={{ placement: "bottom-start" }}
                      shouldCloseOnBlur={false}
                      size="sm"
                      onInputChange={(value) => {
                        setFilters((prev) => ({
                          ...prev,
                          estado_texto: value ?? "",
                        }));
                        setPage(1);
                      }}
                      onSelectionChange={(key) => {
                        const v = String(key ?? "");

                        setFilters((prev) => ({
                          ...prev,
                          estado_texto: v,
                        }));
                        setPage(1);
                      }}
                    >
                      {(item) => (
                        <AutocompleteItem key={item.key}>
                          {item.label}
                        </AutocompleteItem>
                      )}
                    </Autocomplete>
                  ) : col.key === "user" ? (
                    <Autocomplete
                      allowsCustomValue
                      allowsEmptyCollection
                      aria-label="Usuario"
                      inputValue={filters.user || ""}
                      items={usersItems}
                      menuTrigger="focus"
                      placeholder="Filtrar usuario..."
                      popoverProps={{ placement: "bottom-start" }}
                      shouldCloseOnBlur={false}
                      size="sm"
                      onInputChange={(value) => {
                        setFilters((prev) => ({ ...prev, user: value ?? "" }));
                        setPage(1);
                      }}
                      onSelectionChange={(key) => {
                        const v = String(key ?? "");

                        setFilters((prev) => ({
                          ...prev,
                          user_eq: v,
                          user: v,
                        }));
                        setPage(1);
                      }}
                    >
                      {(item) => (
                        <AutocompleteItem key={item.key}>
                          {item.label}
                        </AutocompleteItem>
                      )}
                    </Autocomplete>
                  ) : col.key === "ciclo" ? (
                    <Autocomplete
                      allowsCustomValue
                      allowsEmptyCollection
                      aria-label="Ciclo"
                      inputValue={filters.ciclo || ""}
                      items={ciclosItems}
                      menuTrigger="focus"
                      placeholder="Filtrar ciclo..."
                      popoverProps={{ placement: "bottom-start" }}
                      shouldCloseOnBlur={false}
                      size="sm"
                      onInputChange={(value) => {
                        setFilters((prev) => ({ ...prev, ciclo: value ?? "" }));
                        setPage(1);
                      }}
                      onSelectionChange={(key) => {
                        const v = String(key ?? "");

                        setFilters((prev) => ({
                          ...prev,
                          ciclo_eq: v,
                          ciclo: v,
                        }));
                        setPage(1);
                      }}
                    >
                      {(item) => (
                        <AutocompleteItem key={item.key}>
                          {item.label}
                        </AutocompleteItem>
                      )}
                    </Autocomplete>
                  ) : col.key === "cargo" ? (
                    <Autocomplete
                      allowsCustomValue
                      allowsEmptyCollection
                      aria-label="Cargo"
                      inputValue={filters.cargo || ""}
                      items={cargosItems}
                      menuTrigger="focus"
                      placeholder="Filtrar cargo..."
                      popoverProps={{ placement: "bottom-start" }}
                      shouldCloseOnBlur={false}
                      size="sm"
                      onInputChange={(value) => {
                        setFilters((prev) => ({ ...prev, cargo: value ?? "" }));
                        setPage(1);
                      }}
                      onSelectionChange={(key) => {
                        const v = String(key ?? "");

                        setFilters((prev) => ({
                          ...prev,
                          cargo_eq: v,
                          cargo: v,
                        }));
                        setPage(1);
                      }}
                    >
                      {(item) => (
                        <AutocompleteItem key={item.key}>
                          {item.label}
                        </AutocompleteItem>
                      )}
                    </Autocomplete>
                  ) : (
                    <Autocomplete
                      allowsCustomValue
                      allowsEmptyCollection
                      aria-label={`Filtrar ${col.key}`}
                      inputValue={filters[col.key] || ""}
                      items={[]}
                      menuTrigger="focus"
                      placeholder="Filtrar..."
                      popoverProps={{ isDismissable: false }}
                      shouldCloseOnBlur={false}
                      size="sm"
                      onInputChange={(value) => {
                        const v = value ?? "";

                        setFilters((prev) => ({ ...prev, [col.key]: v }));
                        setPage(1);
                      }}
                    >
                      {(item) => (
                        <AutocompleteItem key={(item as any)?.key ?? ""}>
                          {(item as any)?.label ?? ""}
                        </AutocompleteItem>
                      )}
                    </Autocomplete>
                  ))}
              </div>
            </TableColumn>
          ))}
        </TableHeader>

        <TableBody
          emptyContent={
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="p-3 bg-default-100 rounded-full">
                <UserIcon className="w-6 h-6 text-default-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-default-600">
                  {Object.values(normalizeFilters(filters)).some(
                    (v) => v.length > 0,
                  )
                    ? "No se encontraron resultados"
                    : "No hay usuarios disponibles"}
                </p>
                {Object.values(filters).some(Boolean) && (
                  <p className="text-xs text-default-400 mt-1">
                    ajusta los filtros de columna
                  </p>
                )}
                <div className="mt-3">
                  <Button size="sm" variant="flat" onPress={clearFilters}>
                    Limpiar filtros
                  </Button>
                </div>
              </div>
            </div>
          }
          isLoading={loading}
          loadingContent={
            <div className="flex justify-center items-center py-8">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                <p className="text-sm text-default-500">Cargando usuarios...</p>
              </div>
            </div>
          }
        >
          {paginatedData.map((item) => {
            const nombreCompleto =
              `${item.first_name ?? ""} ${item.last_name ?? ""}`.trim();
            const foto = getUserPhotoUrl(item);

            return (
              <TableRow key={item.id} unselectable="off">
                {columns.map((col) => (
                  <TableCell key={col.key} className="text-left">
                    {renderCell && renderCell(item, col.key) !== undefined ? (
                      renderCell(item, col.key)
                    ) : col.key === "user" ? (
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
                            onImageError={(error) => {
                              if (import.meta.env.DEV)
                                console.error(
                                  "Error loading avatar for user:",
                                  item.id,
                                  error,
                                );
                            }}
                            onImageLoad={() => {
                              if (import.meta.env.DEV)
                                console.log(
                                  "Avatar loaded successfully for user:",
                                  item.id,
                                );
                            }}
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
                              <span className="text-xs text-default-400">
                                Sin email
                              </span>
                            )}
                          </div>
                        </div>
                      </MatchTooltip>
                    ) : col.key === "empresa" ||
                      col.key === "ciclo" ||
                      col.key === "cargo" ? (
                      <Chip
                        color={
                          extraerCampo(item, col.key).startsWith("Sin")
                            ? "danger"
                            : "default"
                        }
                        size="sm"
                        variant="flat"
                      >
                        {extraerCampo(item, col.key)}
                      </Chip>
                    ) : col.key === "completado" ? (
                      <Chip
                        color={item.completado ? "success" : "warning"}
                        size="sm"
                        variant="flat"
                      >
                        {item.completado ? "✅ Completado" : "🕒 Pendiente"}
                      </Chip>
                    ) : col.key === "accion" && buttonText && onButtonClick ? (
                      <Button
                        className="relative z-10"
                        color={item.completado ? "success" : "secondary"}
                        size="sm"
                        variant="ghost"
                        onPress={(e) => {
                          // @ts-ignore
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
                        {item[col.key] || "No disponible"}
                      </span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default OptimizedTableComponent;
