import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Tooltip } from "@heroui/tooltip";

import { obtenerUsuariosDias } from "../services";

import { getTableColumns } from "./getTableColumns";

import { UsuarioDias } from "@/features/usuario/types";
import PaginationFooter from "@/shared/components/ui/PaginationFooter";
import { SearchBar } from "@/shared/components/ui";
import { useSession } from "@/hooks/useSession";
import { UserSkeleton } from "@/shared/components/ui";

const UsuariosDiasTable: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UsuarioDias[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const rowsPerPage = 8;
  const { user: usuarioActual } = useSession();

  const [sortKey, setSortKey] = useState<string>("first_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // NO hacer setPage(1)
  };
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const mostrarDiasCumpleaños = useMemo(() => {
    return usuarioActual && [1, 3].includes(usuarioActual.empresa?.id ?? -1);
  }, [usuarioActual]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const data = await obtenerUsuariosDias();

        setUsuarios(data);
      } catch (error) {
        console.error("Error al obtener los usuarios:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const filteredData = useMemo(() => {
    return usuarios.filter((u) =>
      `${u.first_name} ${u.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );
  }, [usuarios, searchTerm]);

  const sortedData = useMemo(() => {
    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortKey as keyof UsuarioDias];
      const bValue = b[sortKey as keyof UsuarioDias];

      // Orden especial para cumpleaños: por mes y día
      if (sortKey === "birthday") {
        if (!aValue || !bValue) return 0;

        const [aMonth, aDay] = String(aValue).split("-").map(Number);
        const [bMonth, bDay] = String(bValue).split("-").map(Number);

        if (aMonth !== bMonth) {
          return sortDirection === "asc" ? aMonth - bMonth : bMonth - aMonth;
        }

        return sortDirection === "asc" ? aDay - bDay : bDay - aDay;
      }

      // Orden numérico
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      // Orden alfabético
      return sortDirection === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

    return sorted;
  }, [filteredData, sortKey, sortDirection]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;

    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, page]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  useEffect(() => {
    const start = (page - 1) * rowsPerPage;
    const pageHasData = sortedData.slice(start, start + rowsPerPage).length > 0;

    if (!pageHasData && page > 1) {
      setPage(1); // o setPage(totalPages) si prefieres la última válida
    }
  }, [sortedData, page]);

  const HighlightMatch: React.FC<{ text: string; term: string }> = ({
    text,
    term,
  }) => {
    if (!term) return <>{text}</>;
    const regex = new RegExp(`(${term})`, "gi");
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === term.toLowerCase() ? (
            <mark key={i} className="bg-yellow-100 rounded">
              {part}
            </mark>
          ) : (
            part
          ),
        )}
      </>
    );
  };

  if (loading)
    return (
      <div className="overflow-x-auto p-10">
        <SearchBar
          placeholder="Buscar por Nombre, Cargo, Empresa, Titulo, Magister o Diploma"
          value={searchTerm}
          onChange={setSearchTerm}
        />
        <UserSkeleton />
      </div>
    );

  // Calcular paginación local
  const usuariosPagina = paginatedData;
  const { columns, columnKeys } = getTableColumns(!!mostrarDiasCumpleaños, {
    handleSort,
    sortKey,
    sortDirection,
  });

  return (
    <div className="p-4 rounded-xl shadow-md bg-default-50">
      <h2 className="text-lg font-semibold mb-4">
        Días disponibles de los usuarios
      </h2>
      <SearchBar
        placeholder="Buscar usuario"
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <Table isStriped>
        <TableHeader>{columns}</TableHeader>

        <TableBody>
          {usuariosPagina.length > 0 ? (
            usuariosPagina.map((u) => (
              <TableRow key={u.id}>
                {columnKeys.map((key) => (
                  <TableCell key={key}>
                    {key === "first_name" ? (
                      <HighlightMatch
                        term={searchTerm}
                        text={`${u.first_name} ${u.last_name}`}
                      />
                    ) : key === "birthday" ? (
                      "birthday" in u && u.birthday ? (
                        (() => {
                          const [year, month, day] = (u.birthday as string)
                            .split("-")
                            .map(Number);
                          const fecha = new Date(year, month - 1, day);
                          const cumpleEsteMes =
                            fecha.getMonth() === new Date().getMonth();

                          return cumpleEsteMes ? (
                            <span className="flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                              {fecha.toLocaleDateString("es-CL", {
                                day: "2-digit",
                                month: "long",
                              })}
                              <Tooltip content="Cumpleaños este mes">
                                🎉
                              </Tooltip>
                            </span>
                          ) : (
                            fecha.toLocaleDateString("es-CL", {
                              day: "2-digit",
                              month: "long",
                            })
                          );
                        })()
                      ) : (
                        "—"
                      )
                    ) : (
                      // @ts-ignore
                      (u[key] ?? "—")
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                className="text-center py-4"
                colSpan={columnKeys.length}
              >
                No se encontraron resultados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Footer con paginación */}
      {totalPages > 1 && (
        <div className="mt-4">
          <PaginationFooter page={page} pages={totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default UsuariosDiasTable;
