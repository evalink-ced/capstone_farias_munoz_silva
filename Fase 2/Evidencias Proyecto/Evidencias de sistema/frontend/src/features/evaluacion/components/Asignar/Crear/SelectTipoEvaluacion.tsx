import { Select, SelectItem } from "@heroui/select";
import { Spinner } from "@heroui/spinner";

import { TipoEvaluacion } from "@/features/evaluacion/types/evaluacion";

interface Props {
  tipos: TipoEvaluacion[];
  selectedId: number | null;
  onSelect: (tipo: TipoEvaluacion) => void;
  isDisabled?: boolean;
  isAutoevaluacion?: boolean;
  isLoading?: boolean;
}

const SelectTipoEvaluacion = ({
  tipos,
  selectedId,
  onSelect,
  isDisabled,
  isAutoevaluacion,
  isLoading,
}: Props) => (
  <Select
    isRequired
    className="w-full max-w-xs"
    isDisabled={isDisabled || isLoading}
    label={`Tipo de ${isAutoevaluacion ? "AutoEvaluación" : "Evaluación"}`}
    labelPlacement="outside"
    placeholder={
      isLoading
        ? "Cargando tipos…"
        : `Selecciona tipo de ${isAutoevaluacion ? "AutoEvaluación" : "Evaluación"}`
    }
    selectedKeys={selectedId ? [selectedId.toString()] : []}
    selectionMode="single"
    onSelectionChange={(key) => {
      const selectedKey = Array.from(key as Set<React.Key>)[0];
      const seleccionado = tipos.find((t) => t.id.toString() === selectedKey);

      if (seleccionado) onSelect(seleccionado);
    }}
  >
    {isLoading ? (
      <SelectItem key="loading" textValue="Cargando">
        <div className="flex items-center gap-2">
          <Spinner size="sm" />
          <span className="text-sm">Cargando…</span>
        </div>
      </SelectItem>
    ) : (
      tipos.map((tipo) => (
        <SelectItem key={tipo.id.toString()}>
          {tipo.n_tipo_evaluacion}
        </SelectItem>
      ))
    )}
  </Select>
);

export default SelectTipoEvaluacion;
