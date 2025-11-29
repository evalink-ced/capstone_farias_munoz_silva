// features/evaluacion/components/FiltrosEvaluacion.tsx
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Pagination } from "@heroui/pagination";

import {
  FiltrosEvaluacion,
  Vista,
} from "@/features/evaluacion/hooks/useEvaluacionesMixtas";

interface Props {
  filtros: FiltrosEvaluacion;
  setFiltros: (f: (prev: FiltrosEvaluacion) => FiltrosEvaluacion) => void;
  vistaActual: Vista;
  setVistaActual: (v: Vista) => void;
  paginaActual: number;
  setPaginaActual: (n: number) => void;
  total: number;
  totalPaginas: number;
  itemsPorPagina: number;
  opciones: {
    tipos: { id: string; nombre: string }[];
    años: { id: string; nombre: string }[];
  };
  onLimpiar: () => void;
}

export default function FiltrosEvaluacionComponent({
  filtros,
  setFiltros,
  vistaActual,
  setVistaActual,
  paginaActual,
  setPaginaActual,
  total,
  totalPaginas,
  itemsPorPagina,
  opciones,
  onLimpiar,
}: Props) {
  return (
    <Card className="bg-background/70 backdrop-blur-sm border border-divider shadow-xl mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M3 6h18M7 12h10m-7 6h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Filtros y Búsqueda
              </h2>
              <p className="text-sm text-default-600 dark:text-default-300">
                Encuentra evaluaciones específicas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              color="primary"
              size="sm"
              variant={vistaActual === "tarjetas" ? "solid" : "flat"}
              onClick={() => setVistaActual("tarjetas")}
            >
              Tarjetas
            </Button>
            <Button
              color="primary"
              size="sm"
              variant={vistaActual === "tabla" ? "solid" : "flat"}
              onClick={() => setVistaActual("tabla")}
            >
              Tabla
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            isClearable
            placeholder="Buscar por nombre o evaluador..."
            startContent={
              <svg
                className="h-4 w-4 text-default-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            }
            value={filtros.busqueda}
            onChange={(e) =>
              setFiltros((prev) => ({ ...prev, busqueda: e.target.value }))
            }
            onClear={() => setFiltros((prev) => ({ ...prev, busqueda: "" }))}
          />

          <Select
            placeholder="Tipo de evaluación"
            selectedKeys={
              filtros.tipoEvaluacion ? [filtros.tipoEvaluacion] : []
            }
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;

              setFiltros((prev) => ({
                ...prev,
                tipoEvaluacion: selected || "",
              }));
            }}
          >
            {opciones.tipos.map((t) => (
              <SelectItem key={t.id}>{t.nombre}</SelectItem>
            ))}
          </Select>

          <Select
            placeholder="Año"
            selectedKeys={filtros.año ? [filtros.año] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;

              setFiltros((prev) => ({ ...prev, año: selected || "" }));
            }}
          >
            {opciones.años.map((a) => (
              <SelectItem key={a.id}>{a.nombre}</SelectItem>
            ))}
          </Select>

          <Button color="secondary" variant="flat" onClick={onLimpiar}>
            Limpiar Filtros
          </Button>
        </div>

        {total > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-default-600 dark:text-default-300">
              Mostrando {(paginaActual - 1) * itemsPorPagina + 1} -{" "}
              {Math.min(paginaActual * itemsPorPagina, total)} de {total}{" "}
              evaluaciones
            </p>
            {totalPaginas > 1 && (
              <Pagination
                showControls
                page={paginaActual}
                size="sm"
                total={totalPaginas}
                onChange={setPaginaActual}
              />
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
