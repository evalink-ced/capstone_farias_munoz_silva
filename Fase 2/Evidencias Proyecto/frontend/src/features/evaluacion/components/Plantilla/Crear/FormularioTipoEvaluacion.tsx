import { Button } from "@heroui/button";
import { Send } from "lucide-react";

import NombreEvaluacionInput from "../NombreEvaluacionInput";
import AreaTabs from "../AreaTabs";

import { useFormularioTipoEvaluacion } from "./hooks/useFormularioTipoEvaluacion";
import ModalExito from "./components/ModalExito";
import ErrorList from "./components/ErrorList";

const FormularioTipoEvaluacion = () => {
  const {
    isAutoevaluacion,
    isPonderada,
    showSuccessModal,
    formSubmitted,
    erroresFormulario,
    nombreTipoEvaluacion,
    areas,
    onToggleAutoevaluacion,
    onTogglePonderada,
    handleSubmit,
    handleSuccessModalClose,
    setNombre,
    setAreas,
    addArea,
    removeArea,
    updatePonderacion,
    competenciaHandlers,
    indicadorHandlers,
    nivelHandlers,
  } = useFormularioTipoEvaluacion();

  return (
    <div className="min-h-screen bg-default-50 py-10 px-4 border border-default-300 rounded-2xl">
      <div className="max-w-5xl mx-auto rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-6">
          📝 {isAutoevaluacion ? "AutoEvaluación" : "Evaluación"}
        </h1>

        <ModalExito
          isOpen={showSuccessModal}
          onClose={handleSuccessModalClose}
        />

        <form className="space-y-6" onSubmit={handleSubmit}>
          <NombreEvaluacionInput
            color="secondary"
            errorMessage="Este campo es obligatorio"
            isAutoevaluacion={isAutoevaluacion}
            isPonderada={isPonderada}
            isEditing={true}
            showError={
              formSubmitted &&
              erroresFormulario.includes(
                "El nombre de la evaluación es obligatorio.",
              )
            }
            value={nombreTipoEvaluacion}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)}
            onToggleAutoevaluacion={onToggleAutoevaluacion}
            onTogglePonderada={onTogglePonderada}
          />

          <AreaTabs
            areas={areas}
            competenciaHandlers={competenciaHandlers}
            indicadorHandlers={indicadorHandlers}
            isEditing={true}
            updatePonderacion={updatePonderacion}
            nivelHandlers={nivelHandlers}
            onAddArea={addArea}
            onAreaChange={(i: number, e: React.ChangeEvent<HTMLInputElement>) => {
              const newAreas = [...areas];

              newAreas[i].n_area = e.target.value;
              setAreas(newAreas);
            }}
            onRemoveArea={removeArea}
          />

          <div className="pt-6 flex justify-center">
            <Button
              className="px-6 py-2 rounded-md"
              color="primary"
              startContent={<Send size={18} />}
              type="submit"
              variant="shadow"
            >
              Crear {isAutoevaluacion ? "AutoEvaluación" : "Evaluación"}
            </Button>
          </div>
          <ErrorList errores={erroresFormulario} />
        </form>
      </div>
    </div>
  );
};

export default FormularioTipoEvaluacion;
