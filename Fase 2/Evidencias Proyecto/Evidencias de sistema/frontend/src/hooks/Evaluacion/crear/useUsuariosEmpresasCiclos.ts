import { useEffect, useState } from "react";
import { addToast } from "@heroui/toast";

import axios from "@/services/google/axiosInstance";
import { Usuario } from "@/features/evaluacion/types/asignar/evaluacion";

export default function useUsuariosEmpresasCiclos() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [empresas, setEmpresas] = useState<{ id: number; empresa: string }[]>(
    [],
  );
  const [ciclos, setCiclos] = useState<{ id: number; ciclo: string }[]>([]);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await axios.get("/evaluacion/api/usuarios/");
        const data: Usuario[] = res.data;

        if (!active) return;

        setUsuarios(data);

        const empresasUnicas = Array.from(
          new Map(
            data
              .filter((u) => u.empresa)
              .map((u) => [u.empresa!.id, u.empresa]),
          ).values(),
        ).sort((a, b) => a.empresa.localeCompare(b.empresa));

        const ciclosUnicos = Array.from(
          new Map(
            data.filter((u) => u.ciclo).map((u) => [u.ciclo!.id, u.ciclo]),
          ).values(),
        ).sort((a, b) => a.ciclo.localeCompare(b.ciclo));

        setEmpresas(empresasUnicas);
        setCiclos(ciclosUnicos);
      } catch (err: any) {
        if (!active) return;
        setUsuarios([]);
        setEmpresas([]);
        setCiclos([]);
        addToast({
          title: "Error al cargar usuarios",
          description:
            err?.response?.data?.detail ||
            "No se pudieron obtener los usuarios para asignar.",
          color: "danger",
          variant: "solid",
        });
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return { usuarios, empresas, ciclos };
}
