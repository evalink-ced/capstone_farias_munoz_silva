import { Checkbox } from "@heroui/checkbox";

import { Usuario } from "@/features/evaluacion/types/asignar/evaluacion";

interface Props {
  usuarios: Usuario[];
  seleccionados: Usuario[];
  onToggle: (usuario: Usuario, checked: boolean) => void;
  isDisabled?: boolean;
}

const ListaUsuarios = ({
  usuarios,
  seleccionados,
  onToggle,
  isDisabled,
}: Props) => {
  const ordenados = [...usuarios].sort((a, b) => {
    const empresaA = a.empresa?.empresa || "";
    const empresaB = b.empresa?.empresa || "";
    const cmpEmpresa = empresaA.localeCompare(empresaB);

    return cmpEmpresa !== 0
      ? cmpEmpresa
      : a.last_name.localeCompare(b.last_name);
  });

  return (
    <div className="grid grid-cols-2 gap-2 max-h-52 overflow-auto border rounded-md p-3 bg-default-50">
      {ordenados.map((usuario) => (
        <Checkbox
          key={usuario.id}
          className="text-sm text-default-700"
          isDisabled={isDisabled}
          isSelected={seleccionados.some((u) => u.id === usuario.id)}
          onValueChange={(checked) => onToggle(usuario, checked)}
        >
          {usuario.first_name} {usuario.last_name}
        </Checkbox>
      ))}
    </div>
  );
};

export default ListaUsuarios;
