// ModalExito.tsx
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ModalExito = ({ isOpen, onClose }: Props) => (
  <Modal
    hideCloseButton
    backdrop="blur"
    isDismissable={false}
    isOpen={isOpen}
    size="md"
    onOpenChange={onClose}
  >
    <ModalContent>
      <ModalHeader className="justify-center text-center text-xl font-semibold text-success-700">
        Evaluación asignada
      </ModalHeader>
      <ModalBody className="text-center text-default-700">
        <p>
          La evaluación fue asignada correctamente a los usuarios seleccionados.
        </p>
      </ModalBody>
      <ModalFooter className="justify-center">
        <Button color="success" onPress={onClose}>
          Cerrar
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

export default ModalExito;
