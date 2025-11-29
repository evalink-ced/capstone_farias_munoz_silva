// src/components/Legal/TermsModal.tsx
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";

import TermsContent from "./TermsContent";

interface TermsModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>Términos y Condiciones</ModalHeader>
        <ModalBody>
          <TermsContent />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
