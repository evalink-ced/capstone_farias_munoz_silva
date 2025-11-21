import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
};

export default function AceptarModal({ open, onClose, onConfirm, loading }: Props) {
  return (
    <Modal
      isOpen={open}
      size="md"
      backdrop="blur"
      hideCloseButton
      isDismissable={false}
      onOpenChange={(isOpen) => (isOpen ? undefined : onClose())}
    >
      <ModalContent>
        <ModalHeader className="text-lg font-semibold">
          Confirmar firma de evaluación
        </ModalHeader>
        <ModalBody>
          <p className="text-default-700">
            ¿Confirmas que deseas aceptar y firmar esta evaluación?
          </p>
          <p className="text-xs text-default-500">
            Esta acción registrará tu firma. Si necesitas dejar una observación, usa “Firmar con Observaciones”.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose} isDisabled={!!loading}>
            Cancelar
          </Button>
          <Button
            className="rounded-xl bg-success text-success-foreground"
            onPress={onConfirm}
            isLoading={!!loading}
          >
            Confirmar firma
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}