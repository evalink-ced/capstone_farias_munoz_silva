import { Select, SelectItem } from "@heroui/select";

import { TipoEvaluacion } from "@/features/evaluacion/types/evaluacion";

interface Props {
  tipos: TipoEvaluacion[];
  selectedId: number | null;
  onSelect: (tipo: TipoEvaluacion) => void;
  isDisabled?: boolean;
  isAutoevaluacion?: boolean;
}

const SelectTipoEvaluacion = ({
  tipos,
  selectedId,
  onSelect,
  isDisabled,
  isAutoevaluacion,
}: Props) => (
  <Select
    isRequired
    className="w-full max-w-xs"
    isDisabled={isDisabled}
    label={`Tipo de ${isAutoevaluacion ? "AutoEvaluación" : "Evaluación"}`}
    labelPlacement="outside"
    placeholder={`Selecciona tipo de ${isAutoevaluacion ? "AutoEvaluación" : "Evaluación"}`}
    selectedKeys={selectedId ? [selectedId.toString()] : []}
    selectionMode="single"
    onSelectionChange={(key) => {
      const selectedKey = Array.from(key as Set<React.Key>)[0];
      const seleccionado = tipos.find((t) => t.id.toString() === selectedKey);

      if (seleccionado) onSelect(seleccionado);
    }}
  >
    {tipos.map((tipo) => (
      <SelectItem key={tipo.id.toString()}>{tipo.n_tipo_evaluacion}</SelectItem>
    ))}
  </Select>
);

export default SelectTipoEvaluacion;
