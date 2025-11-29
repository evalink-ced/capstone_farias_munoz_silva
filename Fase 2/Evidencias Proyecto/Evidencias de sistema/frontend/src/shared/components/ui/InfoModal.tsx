"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Info } from "lucide-react";

export function InfoModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        className="gap-2"
        color="primary"
        size="sm"
        variant="solid"
        onPress={() => setIsOpen(true)}
      >
        <Info className="h-5 w-5" />
        INFORMACIÓN
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalContent>
          <ModalHeader className="flex items-center gap-2 text-secondary-700">
            <Info className="h-5 w-5 text-secondary-600" />
            Campos deshabilitados
          </ModalHeader>

          <ModalBody className="text-sm text-secondary-900 space-y-2">
            <p>
              Los campos en{" "}
              <span className="text-yellow-700 font-medium">amarillo</span>{" "}
              están deshabilitados por:
            </p>
            <ul className="list-disc list-inside pl-4">
              <li>Datos precargados automáticamente</li>
              <li>Restricciones por perfil</li>
            </ul>
            <p>
              El campo{" "}
              <span className="text-yellow-700 font-medium">observación</span>{" "}
              es opcional.
            </p>
          </ModalBody>

          <ModalFooter>
            <Button color="primary" onPress={() => setIsOpen(false)}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
