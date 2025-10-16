// useUsuariosFiltrados.ts
import { useMemo } from "react";

import { Usuario } from "@/features/evaluacion/types/asignar/evaluacion";

const useUsuariosFiltrados = (
  usuarios: Usuario[],
  empresaId: number | null,
  cicloId: number | null,
): Usuario[] => {
  return useMemo(() => {
    return usuarios.filter(
      (u) =>
        (empresaId === null || u.empresa?.id === empresaId) &&
        (cicloId === null || u.ciclo?.id === cicloId),
    );
  }, [usuarios, empresaId, cicloId]);
};

export default useUsuariosFiltrados;
