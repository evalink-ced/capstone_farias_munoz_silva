import { Input } from "@heroui/input";
import { Checkbox } from "@heroui/checkbox";

interface Props {
  value: string;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isAutoevaluacion: boolean;
  isPonderada: boolean;
  onToggleAutoevaluacion: (checked: boolean) => void;
  onTogglePonderada: (checked: boolean) => void;
  showError?: boolean;
  errorMessage?: string;
  color?: "primary" | "secondary" | "danger"; // según HeroUI
}

export default function NombreEvaluacionInput({
  value,
  isEditing,
  onChange,
  isAutoevaluacion,
  isPonderada,
  onToggleAutoevaluacion,
  onTogglePonderada,
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
      <div className="flex items-center justify-between gap-2">
        <Checkbox
          isDisabled
          className="mt-4"
          isSelected={isAutoevaluacion}
          onValueChange={onToggleAutoevaluacion}
        >
          ¿Es una autoevaluación?
        </Checkbox>

        <Checkbox
          isDisabled={!isEditing}
          className="mt-4"
          isSelected={isPonderada}
          onValueChange={onTogglePonderada}
        >
          ¿Es Ponderada?
        </Checkbox>
      </div>
    </div>
  );
}
