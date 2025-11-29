import { Button } from "@heroui/button";

import { Usuario } from "@/features/evaluacion/types/asignar/evaluacion";

interface Props {
  usuariosFiltrados: Usuario[]; // <- puedes eliminar si no lo usas dentro del componente
  usuariosSeleccionados: Usuario[]; // <- igual
  onSeleccionarTodos: () => void;
  onDeseleccionarTodos: () => void;

  isDisabled?: boolean;
}

const BotonesSeleccionUsuarios = ({
  onSeleccionarTodos,
  onDeseleccionarTodos,
  isDisabled,
}: Props) => {
  return (
    <div className="flex items-center justify-end gap-4 mb-2">
      <Button
        color="primary"
        isDisabled={isDisabled}
        size="sm"
        type="button"
        variant="light"
        onPress={onSeleccionarTodos}
      >
        Seleccionar todos
      </Button>
      <Button
        color="danger"
        isDisabled={isDisabled}
        size="sm"
        type="button"
        variant="light"
        onPress={onDeseleccionarTodos}
      >
        Deseleccionar todos
      </Button>
    </div>
  );
};

export default BotonesSeleccionUsuarios;
