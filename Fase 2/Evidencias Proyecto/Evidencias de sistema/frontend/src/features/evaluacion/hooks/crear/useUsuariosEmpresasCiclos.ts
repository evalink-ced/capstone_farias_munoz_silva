import { useEffect, useState } from "react";

import axios from "@/services/google/axiosInstance";
import { Usuario } from "@/features/evaluacion/types/asignar/evaluacion";

export default function useUsuariosEmpresasCiclos() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [empresas, setEmpresas] = useState<{ id: number; empresa: string }[]>(
    [],
  );
  const [ciclos, setCiclos] = useState<{ id: number; ciclo: string }[]>([]);

  useEffect(() => {
    axios.get("/evaluacion/api/usuarios/").then((res) => {
      const data: Usuario[] = res.data;

      setUsuarios(data);

      const empresasUnicas = Array.from(
        new Map(
          data.filter((u) => u.empresa).map((u) => [u.empresa!.id, u.empresa]),
        ).values(),
      ).sort((a, b) => a.empresa.localeCompare(b.empresa));

      const ciclosUnicos = Array.from(
        new Map(
          data.filter((u) => u.ciclo).map((u) => [u.ciclo!.id, u.ciclo]),
        ).values(),
      ).sort((a, b) => a.ciclo.localeCompare(b.ciclo));

      setEmpresas(empresasUnicas);
      setCiclos(ciclosUnicos);
    });
  }, []);

  return { usuarios, empresas, ciclos };
}
