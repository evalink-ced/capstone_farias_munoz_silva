import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";

import { Usuario } from "@/features/evaluacion/types/asignar/evaluacion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  usuariosSeleccionados: Usuario[];
}

const ModalUsuariosSeleccionados: React.FC<Props> = ({
  isOpen,
  onClose,
  usuariosSeleccionados,
}) => {
  return (
    <Modal isOpen={isOpen} size="lg" onClose={onClose}>
      <ModalContent>
        <ModalHeader>Usuarios seleccionados</ModalHeader>
        <ModalBody>
          <ul className="list-disc list-inside">
            {[...usuariosSeleccionados]
              .sort((a, b) => {
                const empresaA = a.empresa?.empresa || "";
                const empresaB = b.empresa?.empresa || "";
                const cmpEmpresa = empresaA.localeCompare(empresaB);

                return cmpEmpresa !== 0
                  ? cmpEmpresa
                  : a.last_name.localeCompare(b.last_name);
              })
              .map((usuario) => (
                <li key={usuario.id}>
                  {usuario.first_name} {usuario.last_name}
                </li>
              ))}
          </ul>
        </ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            size="sm"
            type="button"
            variant="solid"
            onPress={onClose}
          >
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalUsuariosSeleccionados;
