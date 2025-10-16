import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addToast } from "@heroui/toast";

import axios from "@/services/google/axiosInstance";
import useEvaluacionAsignadaStore from "@/stores/evaluacion/asignar/useEvaluacionAsignadaStore";
import useTiposEvaluacion from "@/hooks/Evaluacion/crear/useTiposEvaluacion";
import useUsuariosEmpresasCiclos from "@/hooks/Evaluacion/crear/useUsuariosEmpresasCiclos";
import useUsuariosFiltrados from "@/hooks/Evaluacion/crear/useUsuariosFiltrados";
import useModal from "@/shared/hooks/useModal";

export const useFormularioEditarAsignacion = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const modalExito = useModal();
  const tipos = useTiposEvaluacion();
  const { usuarios, empresas, ciclos } = useUsuariosEmpresasCiclos();
  const [modoEdicion, setModoEdicion] = useState(false);

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
  const [estadoOriginal, setEstadoOriginal] = useState<{
    tipoEvaluacion: any;
    fechaEvaluacion: string;
    usuarios: any[];
  } | null>(null);

  const evaluacionEdicion = location.state?.tipoEvaluacion;

  useEffect(() => {
    if (!evaluacionEdicion) {
      addToast({
        title: "Error",
        description: "No se proporcionó evaluación para editar.",
        color: "danger",
      });
      navigate("/evaluacion-asignar");

      return;
    }

    // Cargar datos iniciales en el store
    setTipoEvaluacion(evaluacionEdicion.tipo_evaluacion);
    setFechaEvaluacion(evaluacionEdicion.fecha_evaluacion);
    agregarUsuarios(evaluacionEdicion.personas_asignadas);
    setEstadoOriginal({
      tipoEvaluacion: evaluacionEdicion.tipo_evaluacion,
      fechaEvaluacion: evaluacionEdicion.fecha_evaluacion,
      usuarios: evaluacionEdicion.personas_asignadas,
    });
  }, [evaluacionEdicion]);

  const handleCancelar = () => {
    if (!estadoOriginal) return;
    setTipoEvaluacion(estadoOriginal.tipoEvaluacion);
    setFechaEvaluacion(estadoOriginal.fechaEvaluacion);
    resetAsignacion();
    agregarUsuarios(estadoOriginal.usuarios);
    setModoEdicion(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !tipoEvaluacion ||
      !fechaEvaluacion ||
      usuariosSeleccionados.length === 0
    ) {
      addToast({
        title: "Formulario incompleto",
        description: "Completa todos los campos antes de guardar.",
        color: "warning",
      });

      return;
    }

    try {
      await axios.put(
        `/evaluacion/api/evaluaciones-asignadas/${evaluacionEdicion.id}/`,
        {
          tipo_evaluacion_id: tipoEvaluacion.id,
          fecha_evaluacion: fechaEvaluacion,
          personas_asignadas_ids: usuariosSeleccionados.map((u) => u.id),
        },
      );

      modalExito.open();
      resetAsignacion();
      navigate("/evaluacion-asignar");
    } catch (error) {
      console.error(error);
      addToast({
        title: "Error al actualizar la evaluación",
        description: "Ocurrió un error al guardar los cambios.",
        color: "danger",
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
    modoEdicion,
    mostrarModal,
    empresaSeleccionada,
    cicloSeleccionado,
    tipoEvaluacion,
    fechaEvaluacion,
    usuariosSeleccionados,

    // Datos computados
    tipos,
    empresas,
    ciclos,
    usuariosFiltrados,
    modalExito,

    // Handlers
    setModoEdicion,
    setMostrarModal,
    setEmpresaSeleccionada,
    setCicloSeleccionado,
    setTipoEvaluacion,
    setFechaEvaluacion,
    toggleUsuario,
    handleCancelar,
    handleSubmit,
    handleSeleccionarTodos,
    handleDeseleccionarTodos,
  };
};
