import React from "react";
import { Select, SelectItem } from "@heroui/select";

interface Empresa {
  id: number;
  empresa: string;
}

interface Ciclo {
  id: number;
  ciclo: string;
}

interface Props {
  empresas: Empresa[];
  ciclos: Ciclo[];
  empresaSeleccionada: number | null;
  cicloSeleccionado: number | null;
  setEmpresaSeleccionada: (id: number | null) => void;
  setCicloSeleccionado: (id: number | null) => void;
  isDisabled?: boolean;
}

const FiltrosEmpresaCiclo: React.FC<Props> = ({
  empresas,
  ciclos,
  empresaSeleccionada,
  cicloSeleccionado,
  setEmpresaSeleccionada,
  setCicloSeleccionado,
  isDisabled,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end mb-4">
      {/* Empresa */}
      <Select
        className="w-full"
        isDisabled={isDisabled}
        items={[
          { id: "todos", empresa: "Todas las empresas" },
          ...empresas.map((e) => ({ ...e, id: e.id.toString() })),
        ]}
        label="Empresa"
        labelPlacement="outside"
        placeholder="Selecciona empresa"
        selectedKeys={
          empresaSeleccionada !== null
            ? [empresaSeleccionada.toString()]
            : ["todos"]
        }
        selectionMode="single"
        onSelectionChange={(key) => {
          const selectedKey = Array.from(key as Set<React.Key>)[0];

          if (selectedKey === "todos") {
            setEmpresaSeleccionada(null);
            setCicloSeleccionado(null); // reset ciclo
          } else {
            setEmpresaSeleccionada(Number(selectedKey));
          }
        }}
      >
        {(item) => (
          <SelectItem key={item.id} textValue={item.empresa}>
            {item.empresa}
          </SelectItem>
        )}
      </Select>

      {/* Ciclo */}
      <Select
        disallowEmptySelection
        showScrollIndicators
        className="w-full"
        isDisabled={isDisabled}
        items={[
          { id: "todos", ciclo: "Todos los ciclos" },
          ...ciclos.map((c) => ({ ...c, id: c.id.toString() })),
        ]}
        label="Filtrar por ciclo"
        labelPlacement="outside"
        placeholder="Selecciona un ciclo"
        selectedKeys={
          cicloSeleccionado !== null
            ? [cicloSeleccionado.toString()]
            : ["todos"]
        }
        selectionMode="single"
        onSelectionChange={(key) => {
          const selected = Array.from(key as Set<React.Key>)[0];

          if (selected === "todos") {
            setCicloSeleccionado(null);
          } else {
            setCicloSeleccionado(Number(selected));
          }
        }}
      >
        {(item) => (
          <SelectItem key={item.id} textValue={item.ciclo}>
            {item.ciclo}
          </SelectItem>
        )}
      </Select>
    </div>
  );
};

export default FiltrosEmpresaCiclo;
