import { Button } from "@heroui/button";
import { Save } from "lucide-react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";

import NombreEvaluacionInput from "../NombreEvaluacionInput";
import AreaTabs from "../AreaTabs";

import { useEditarTipoEvaluacion } from "./hooks/useEditarTipoEvaluacion";

const EditarTipoEvaluacion = () => {
  const {
    showModal,
    isEditing,
    isAutoevaluacion,
    isPonderada,
    nombreTipoEvaluacion,
    areas,
    handleSubmit,
    onToggleAutoevaluacion,
    onTogglePonderada,
    handleAreaChange,
    handleNombreChange,
    handleEnableEditing,
    handleCancelEditing,
    handleCloseModal,
    addArea,
    removeArea,
    updatePonderacion,
    competenciaHandlers,
    indicadorHandlers,
    nivelHandlers,
  } = useEditarTipoEvaluacion();

  return (
    <div className="min-h-screen bg-default-50 py-10 px-4 border border-default-300 rounded-2xl">
      <div className="max-w-5xl mx-auto rounded-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">✏️ Editar Tipo de Evaluación</h1>
          {!isEditing && (
            <Button color="secondary" onPress={handleEnableEditing}>
              ✏️ Habilitar edición
            </Button>
          )}
          {isEditing && (
            <Button color="danger" onPress={handleCancelEditing}>
              ❌ Cancelar edición
            </Button>
          )}
        </div>

        {showModal && (
          <Modal
            hideCloseButton
            isOpen
            backdrop="blur"
            onClose={handleCloseModal}
          >
            <ModalContent>
              <ModalHeader>✅ Tipo de Evaluación Actualizado</ModalHeader>
              <ModalBody>Los cambios fueron guardados exitosamente.</ModalBody>
              <ModalFooter>
                <Button color="success" onPress={handleCloseModal}>
                  Cerrar
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <NombreEvaluacionInput
            isAutoevaluacion={isAutoevaluacion}
            isEditing={isEditing}
            isPonderada={isPonderada}
            value={nombreTipoEvaluacion}
            onChange={handleNombreChange}
            onToggleAutoevaluacion={onToggleAutoevaluacion}
            onTogglePonderada={onTogglePonderada}
          />

          <AreaTabs
            areas={areas}
            competenciaHandlers={competenciaHandlers}
            indicadorHandlers={indicadorHandlers}
            isEditing={isEditing}
            updatePonderacion={updatePonderacion}
            nivelHandlers={nivelHandlers}
            onAddArea={addArea}
            onAreaChange={handleAreaChange}
            onRemoveArea={removeArea}
          />

          <div className="pt-6 flex justify-center">
            <Button
              className="px-6 py-2 rounded-md"
              color="primary"
              isDisabled={!isEditing}
              startContent={<Save size={18} />}
              type="submit"
              variant="shadow"
            >
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarTipoEvaluacion;
