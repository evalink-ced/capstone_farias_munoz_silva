import { Input, Textarea } from "@heroui/input";

import { NivelLogro } from "@/features/evaluacion/types/evaluacion";

interface Props {
  niveles: NivelLogro[];
  onChange: (
    nivelIndex: number,
    field: "nombre" | "descripcion" | "puntaje",
    value: string,
  ) => void;
  isEditing: boolean;
}

export default function NivelesGrid({ niveles, onChange, isEditing }: Props) {
  return (
    <div className="mt-6">
      <h5 className="text-sm font-semibold text-default-800 mb-2">
        Niveles de Logro
      </h5>

      {/* Header */}
      <div className="grid grid-cols-3 gap-4 bg-default-100 p-3 rounded-t-xl text-sm font-semibold text-default-700">
        <div>Nombre</div>
        <div>Descripción</div>
        <div>Puntaje</div>
      </div>

      {/* Body */}
      {niveles.map((nivel, nivelIndex) => (
        <div
          key={nivelIndex}
          className="grid grid-cols-3 gap-4 items-start border-b border-default-200 p-3 bg-default-100 hover:bg-default-50"
        >
          <Input
            classNames={{ input: "font-bold" }}
            color="warning"
            isDisabled={!isEditing}
            type="text"
            value={nivel.nombre}
            variant="flat"
            onChange={(e) => onChange(nivelIndex, "nombre", e.target.value)}
          />

          <Textarea
            color="secondary"
            isDisabled={!isEditing}
            isRequired={isEditing}
            labelPlacement="outside"
            placeholder="Ej: El desempeño supera consistentemente las expectativas..."
            rows={3}
            value={nivel.descripcion}
            variant="faded"
            onChange={(e) =>
              onChange(nivelIndex, "descripcion", e.target.value)
            }
          />

          <Input
            classNames={{ input: "font-bold" }}
            color="warning"
            isDisabled={!isEditing}
            type="number"
            value={nivel.puntaje.toString()}
            variant="flat"
            onChange={(e) => onChange(nivelIndex, "puntaje", e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
