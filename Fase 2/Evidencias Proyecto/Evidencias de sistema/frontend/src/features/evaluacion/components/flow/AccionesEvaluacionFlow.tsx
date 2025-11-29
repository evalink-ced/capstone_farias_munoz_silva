import type { EvaluacionJefe } from "@/features/evaluacion/types/evaluacion";

import { useState } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

import { useEvaluacionFlowActions } from "@/features/evaluacion/hooks";

interface AccionesEvaluacionFlowProps {
  evaluacion: EvaluacionJefe;
  onSuccess?: (evaluacion: EvaluacionJefe) => void;
  size?: "sm" | "md" | "lg";
}

function getAccionesDisponibles(evaluacion: EvaluacionJefe) {
  const acciones = [];

  if (evaluacion.completado && !evaluacion.reunion_realizada) {
    acciones.push({
      key: "marcar_reunion",
      label: "Marcar Reunión Realizada",
      icon: "🤝",
      color: "secondary" as const,
    });
  }

  if (
    evaluacion.reunion_realizada &&
    !evaluacion.retroalimentacion_completada
  ) {
    acciones.push({
      key: "completar_retroalimentacion",
      label: "Completar Retroalimentación",
      icon: "💬",
      color: "success" as const,
    });
  }

  if (
    evaluacion.retroalimentacion_completada &&
    !evaluacion.cerrado_para_firma
  ) {
    acciones.push({
      key: "cerrar_para_firma",
      label: "Cerrar para Firma",
      icon: "🔒",
      color: "warning" as const,
    });
  }

  return acciones;
}

export function AccionesEvaluacionFlow({
  evaluacion,
  onSuccess,
  size = "md",
}: AccionesEvaluacionFlowProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [accionSeleccionada, setAccionSeleccionada] = useState<string | null>(
    null,
  );
  const [fechaReunion, setFechaReunion] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [retroalimentacion, setRetroalimentacion] = useState(
    evaluacion.retroalimentacion || "",
  );

  const { loading, marcarReunion, completarRetro, cerrarParaFirmar } =
    useEvaluacionFlowActions((evaluacionActualizada) => {
      onSuccess?.(evaluacionActualizada!);
      onClose();
      setAccionSeleccionada(null);
    });

  const acciones = getAccionesDisponibles(evaluacion);

  const handleAccion = async () => {
    if (!accionSeleccionada) return;

    switch (accionSeleccionada) {
      case "marcar_reunion":
        await marcarReunion(evaluacion.id, fechaReunion);
        break;
      case "completar_retroalimentacion":
        await completarRetro(evaluacion.id, retroalimentacion);
        break;
      case "cerrar_para_firma":
        await cerrarParaFirmar(evaluacion.id);
        break;
    }
  };

  const handleOpenModal = (accionKey: string) => {
    setAccionSeleccionada(accionKey);
    onOpen();
  };

  if (acciones.length === 0) {
    return null;
  }

  if (acciones.length === 1) {
    const accion = acciones[0];

    return (
      <>
        <Button
          color={accion.color}
          size={size}
          startContent={<span>{accion.icon}</span>}
          onPress={() => handleOpenModal(accion.key)}
        >
          {accion.label}
        </Button>
        {renderModal()}
      </>
    );
  }

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button
            color="primary"
            endContent={<ChevronDownIcon className="w-4 h-4" />}
            size={size}
          >
            Acciones
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Acciones de evaluación">
          {acciones.map((accion) => (
            <DropdownItem
              key={accion.key}
              startContent={<span>{accion.icon}</span>}
              onPress={() => handleOpenModal(accion.key)}
            >
              {accion.label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
      {renderModal()}
    </>
  );

  function renderModal() {
    const accion = acciones.find((a) => a.key === accionSeleccionada);

    if (!accion) return null;

    return (
      <Modal isOpen={isOpen} size="lg" onClose={onClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <span className="flex items-center gap-2">
              <span>{accion.icon}</span>
              {accion.label}
            </span>
          </ModalHeader>
          <ModalBody>
            {accionSeleccionada === "marcar_reunion" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Confirma que se realizó la reunión con{" "}
                  <strong>
                    {evaluacion.persona?.first_name}{" "}
                    {evaluacion.persona?.last_name}
                  </strong>
                </p>
                <Input
                  isRequired
                  label="Fecha de la reunión"
                  type="date"
                  value={fechaReunion}
                  onChange={(e) => setFechaReunion(e.target.value)}
                />
              </div>
            )}

            {accionSeleccionada === "completar_retroalimentacion" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Completa la retroalimentación para{" "}
                  <strong>
                    {evaluacion.persona?.first_name}{" "}
                    {evaluacion.persona?.last_name}
                  </strong>
                </p>
                <Textarea
                  isRequired
                  label="Retroalimentación"
                  minRows={4}
                  placeholder="Escribe aquí los comentarios y retroalimentación..."
                  value={retroalimentacion}
                  onChange={(e) => setRetroalimentacion(e.target.value)}
                />
              </div>
            )}

            {accionSeleccionada === "cerrar_para_firma" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  ¿Estás seguro de que quieres cerrar esta evaluación para
                  aceptación?
                </p>
                <p className="text-xs text-gray-500">
                  Una vez cerrada, la evaluación estará lista para que{" "}
                  <strong>
                    {evaluacion.persona?.first_name}{" "}
                    {evaluacion.persona?.last_name}
                  </strong>{" "}
                  la firme y finalice el proceso.
                </p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancelar
            </Button>
            <Button
              color={accion.color}
              isLoading={loading}
              onPress={handleAccion}
            >
              Confirmar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }
}
