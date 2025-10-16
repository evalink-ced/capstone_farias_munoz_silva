import { Button } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";

interface ModalExitoProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalExito({ isOpen, onClose }: ModalExitoProps) {
  return (
    <Modal
      hideCloseButton
      backdrop="blur"
      isDismissable={false}
      isOpen={isOpen}
    >
      <ModalContent>
        <ModalHeader>✅ Evaluación Creada</ModalHeader>
        <ModalBody>La evaluación fue registrada exitosamente.</ModalBody>
        <ModalFooter>
          <Button color="success" variant="shadow" onPress={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
