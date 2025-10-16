import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Tooltip } from "@nextui-org/react";
import { X } from "lucide-react";

import {
  BotonesSeleccionUsuarios,
  ModalUsuariosSeleccionados,
  SelectTipoEvaluacion,
  ListaUsuarios,
  FiltrosEmpresaCiclo,
  ModalExito,
} from "@/features/evaluacion/components/Asignar";
import { useFormularioEditarAsignacion } from "@/features/evaluacion/components/Asignar/Editar/hooks/useFormularioEditarAsignacion";

const FormularioEditarAsignacionEvaluacion = () => {
  const {
    modoEdicion,
    mostrarModal,
    empresaSeleccionada,
    cicloSeleccionado,
    tipoEvaluacion,
    fechaEvaluacion,
    usuariosSeleccionados,
    tipos,
    empresas,
    ciclos,
    usuariosFiltrados,
    modalExito,
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
  } = useFormularioEditarAsignacion();

  return (
    <>
      <div className="max-w-4xl mx-auto mb-4 flex justify-end gap-2">
        {!modoEdicion ? (
          <Button color="primary" onPress={() => setModoEdicion(true)}>
            ✏️ Editar
          </Button>
        ) : (
          <>
            <Button
              color="danger"
              startContent={<X size={18} />}
              onPress={handleCancelar}
            >
              Cancelar
            </Button>
          </>
        )}
      </div>

      <form
        className="max-w-4xl mx-auto bg-default-50 rounded-xl shadow-md p-6 space-y-6"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-semibold text-default-800">
          Editar Asignación de Evaluación
        </h2>

        <div className="flex items-center justify-between gap-4">
          <SelectTipoEvaluacion
            isDisabled={!modoEdicion}
            selectedId={tipoEvaluacion?.id ?? null}
            tipos={tipos}
            onSelect={setTipoEvaluacion}
          />

          <Input
            isRequired
            className="w-full max-w-xs"
            isDisabled={!modoEdicion}
            label="Mes y Año"
            labelPlacement="outside"
            type="month"
            value={fechaEvaluacion}
            onChange={(e) => setFechaEvaluacion(e.target.value)}
          />
        </div>

        <FiltrosEmpresaCiclo
          cicloSeleccionado={cicloSeleccionado}
          ciclos={ciclos}
          empresaSeleccionada={empresaSeleccionada}
          empresas={empresas}
          isDisabled={!modoEdicion}
          setCicloSeleccionado={setCicloSeleccionado}
          setEmpresaSeleccionada={setEmpresaSeleccionada}
        />

        <BotonesSeleccionUsuarios
          isDisabled={!modoEdicion}
          usuariosFiltrados={usuariosFiltrados}
          usuariosSeleccionados={usuariosSeleccionados}
          onDeseleccionarTodos={handleDeseleccionarTodos}
          onSeleccionarTodos={handleSeleccionarTodos}
        />

        <ListaUsuarios
          isDisabled={!modoEdicion}
          seleccionados={usuariosSeleccionados}
          usuarios={usuariosFiltrados}
          onToggle={(usuario) => toggleUsuario(usuario)}
        />

        <div className="flex justify-between gap-2">
          <Button
            color="secondary"
            isDisabled={!modoEdicion || usuariosSeleccionados.length === 0}
            size="sm"
            type="button"
            variant="solid"
            onPress={() => setMostrarModal(true)}
          >
            Ver seleccionados
          </Button>
          {usuariosSeleccionados.length === 0 ? (
            <Tooltip color="warning" content="Selecciona al menos un usuario">
              <span>
                <Button color="primary" isDisabled={!modoEdicion} type="submit">
                  Guardar Cambios
                </Button>
              </span>
            </Tooltip>
          ) : (
            <Button color="primary" isDisabled={!modoEdicion} type="submit">
              Guardar Cambios
            </Button>
          )}
        </div>
      </form>

      <ModalUsuariosSeleccionados
        isOpen={mostrarModal}
        usuariosSeleccionados={usuariosSeleccionados}
        onClose={() => setMostrarModal(false)}
      />
      <ModalExito isOpen={modalExito.isOpen} onClose={modalExito.close} />
    </>
  );
};

export default FormularioEditarAsignacionEvaluacion;
