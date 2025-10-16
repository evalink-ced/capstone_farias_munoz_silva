import { useState } from "react";
import { addToast } from "@heroui/toast";
import { useSearchParams } from "react-router-dom";

import axios from "@/services/google/axiosInstance";
import useEvaluacionAsignadaStore from "@/stores/evaluacion/asignar/useEvaluacionAsignadaStore";
import useTiposEvaluacion from "@/hooks/Evaluacion/crear/useTiposEvaluacion";
import useUsuariosEmpresasCiclos from "@/hooks/Evaluacion/crear/useUsuariosEmpresasCiclos";
import useUsuariosFiltrados from "@/hooks/Evaluacion/crear/useUsuariosFiltrados";
import useModal from "@/shared/hooks/useModal";

export const useFormularioAsignacion = () => {
  const {
    tipoEvaluacion,
    fechaEvaluacion,
    usuariosSeleccionados,
    setTipoEvaluacion,
    setFechaEvaluacion,
    resetAsignacion,
    agregarUsuarios,
    removerUsuariosPorId,
    toggleUsuario,
  } = useEvaluacionAsignadaStore();

  const { usuarios, empresas, ciclos } = useUsuariosEmpresasCiclos();
  const tipos = useTiposEvaluacion();
  const [searchParams] = useSearchParams();
  const isAutoevaluacion = searchParams.get("auto") === "true";

  const modalExito = useModal();
  const [mostrarModal, setMostrarModal] = useState(false);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<number | null>(
    null,
  );
  const [cicloSeleccionado, setCicloSeleccionado] = useState<number | null>(
    null,
  );

  const usuariosFiltrados = useUsuariosFiltrados(
    usuarios,
    empresaSeleccionada,
    cicloSeleccionado,
  );
  const tiposFiltrados = tipos.filter((t) => t.auto === isAutoevaluacion);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !tipoEvaluacion ||
      !fechaEvaluacion ||
      usuariosSeleccionados.length === 0
    ) {
      addToast({
        title: "Formulario incompleto",
        description:
          "Completa todos los campos antes de asignar la evaluación.",
        color: "warning",
      });

      return;
    }

    if (!isAutoevaluacion && usuariosSeleccionados.some((u) => !u.jefe)) {
      addToast({
        title: "Faltan evaluadores",
        description: "Uno o más usuarios no tienen jefe asignado.",
        color: "warning",
      });

      return;
    }

    try {
      const endpoint = isAutoevaluacion
        ? "/evaluacion/api/autoevaluaciones-asignadas/"
        : "/evaluacion/api/evaluaciones-asignadas/";

      const payload = isAutoevaluacion
        ? {
            tipo_evaluacion_id: tipoEvaluacion.id,
            fecha_evaluacion: fechaEvaluacion,
            personas_asignadas_ids: usuariosSeleccionados.map((u) => u.id),
          }
        : {
            tipo_evaluacion_id: tipoEvaluacion.id,
            fecha_evaluacion: fechaEvaluacion,
            evaluador_id: usuariosSeleccionados[0].jefe,
            personas_ids: usuariosSeleccionados.map((u) => u.id),
          };

      await axios.post(endpoint, payload);

      modalExito.open();
      resetAsignacion();
    } catch (error: any) {
      const errores = error.response?.data;
      const mensaje =
        errores?.non_field_errors?.[0] ||
        errores?.detail ||
        "Ocurrió un error al guardar la evaluación.";

      addToast({
        title: "Error al asignar la evaluación",
        description: mensaje,
        color: "danger",
        variant: "solid",
      });
    }
  };

  const handleSeleccionarTodos = () => agregarUsuarios(usuariosFiltrados);

  const handleDeseleccionarTodos = () => {
    const idsVisibles = usuariosFiltrados.map((u) => u.id);

    removerUsuariosPorId(idsVisibles);
  };

  return {
    // Estado
    tipoEvaluacion,
    fechaEvaluacion,
    usuariosSeleccionados,
    isAutoevaluacion,
    mostrarModal,
    empresaSeleccionada,
    cicloSeleccionado,

    // Datos computados
    usuariosFiltrados,
    tiposFiltrados,
    empresas,
    ciclos,
    modalExito,

    // Handlers
    setTipoEvaluacion,
    setFechaEvaluacion,
    setMostrarModal,
    setEmpresaSeleccionada,
    setCicloSeleccionado,
    toggleUsuario,
    handleSubmit,
    handleSeleccionarTodos,
    handleDeseleccionarTodos,
  };
};
