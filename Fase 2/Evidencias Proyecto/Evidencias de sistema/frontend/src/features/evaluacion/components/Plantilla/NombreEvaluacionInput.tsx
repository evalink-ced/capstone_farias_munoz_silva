import { Input } from "@heroui/input";
import { Checkbox } from "@heroui/checkbox";

interface Props {
  value: string;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isAutoevaluacion: boolean;
  onToggleAutoevaluacion: (checked: boolean) => void;
  showError?: boolean;
  errorMessage?: string;
  color?: "primary" | "secondary" | "danger"; // según HeroUI
}

export default function NombreEvaluacionInput({
  value,
  isEditing,
  onChange,
  isAutoevaluacion,
  onToggleAutoevaluacion,
  showError = false,
  errorMessage = "",
  color = "primary",
}: Props) {
  return (
    <div className="mb-6 mt-14 space-y-1">
      <label
        className="text-sm font-medium text-default-700"
        htmlFor="nombreTipoEvaluacion"
      >
        Nombre del Tipo de Evaluación
      </label>
      <Input
        isRequired
        className={showError ? "border border-red-500" : ""}
        color={showError ? "danger" : color}
        id="nombreTipoEvaluacion"
        isDisabled={!isEditing}
        name="nombreTipoEvaluacion"
        placeholder="Ej: Evaluación Docente 2025"
        type="text"
        value={value}
        variant="faded"
        onChange={onChange}
      />
      {showError && <p className="text-sm text-red-500">{errorMessage}</p>}
      <Checkbox
        isDisabled
        className="mt-4"
        isSelected={isAutoevaluacion}
        onValueChange={onToggleAutoevaluacion}
      >
        ¿Es una autoevaluación?
      </Checkbox>
    </div>
  );
}
