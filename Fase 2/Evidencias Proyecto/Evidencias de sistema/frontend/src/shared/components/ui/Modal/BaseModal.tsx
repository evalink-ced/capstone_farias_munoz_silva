// components/BaseModal.tsx
"use client";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";

type BaseModalProps = Readonly<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  headerClassName?: string;
}>;

export default function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  headerClassName = "",
}: BaseModalProps) {
  return (
    <Modal
      hideCloseButton
      backdrop="blur"
      isDismissable={false}
      isOpen={isOpen}
      onOpenChange={onClose}
    >
      <ModalContent>
        <ModalHeader className={`flex flex-col gap-1 ${headerClassName}`}>
          {title}
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </Modal>
  );
}
