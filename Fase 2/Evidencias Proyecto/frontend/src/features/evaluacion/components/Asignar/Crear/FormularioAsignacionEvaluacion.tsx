import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Tooltip } from "@nextui-org/react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import {
  CalendarDaysIcon,
  UsersIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  UserIcon,
  EyeIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";




import { useFormularioAsignacion } from "./hooks/useFormularioAsignacion";

import {
  BotonesSeleccionUsuarios,
  ModalUsuariosSeleccionados,
  SelectTipoEvaluacion,
  ListaUsuarios,
  FiltrosEmpresaCiclo,
  ModalExito,
} from "@/features/evaluacion/components/Asignar";
import { Usuario } from "@/features/evaluacion/types/asignar/evaluacion";

function MonthNative({
  value,
  onChange,
}: { value: string; onChange: (v: string) => void }) {
  // value esperado: "YYYY-MM"
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Input
          isRequired
          label="Período de evaluación"
          labelPlacement="outside"
          type="month"
          lang="es-ES"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          startContent={<CalendarDaysIcon className="w-4 h-4 text-default-400" />}
          classNames={{
            input: "text-sm",
            inputWrapper:
              "bg-background/50 border border-default-200/50 rounded-2xl shadow-sm hover:border-default-300",
            label: "text-default-600 font-medium",
          }}
          min="2020-01"
          max="2030-12"
        />

      </div>
      <p className="text-xs text-default-500">
        Selecciona solo mes y año.
      </p>
    </div>
  );
}



const FormularioAsignacionEvaluacion = () => {
  const {
    tipoEvaluacion,
    fechaEvaluacion,
    usuariosSeleccionados,
    isAutoevaluacion,
    mostrarModal,
    empresaSeleccionada,
    cicloSeleccionado,
    usuariosFiltrados,
    tiposFiltrados,
    empresas,
    ciclos,
    modalExito,
    setTipoEvaluacion,
    setFechaEvaluacion,
    setMostrarModal,
    setEmpresaSeleccionada,
    setCicloSeleccionado,
    toggleUsuario,
    handleSubmit,
    handleSeleccionarTodos,
    handleDeseleccionarTodos,
  } = useFormularioAsignacion();

  const isFormValid = tipoEvaluacion && fechaEvaluacion && usuariosSeleccionados.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/50 rounded-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm">
              <ClipboardDocumentListIcon className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent pb-4">
            Asignar {isAutoevaluacion ? "AutoEvaluación" : "Evaluación"}
          </h1>
          <p className="text-default-600 max-w-2xl mx-auto">
            Configura y asigna {isAutoevaluacion ? "autoevaluaciones" : "evaluaciones"} a los usuarios seleccionados
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Configuration Section */}
          <Card className="border-0 bg-background/60 backdrop-blur-sm shadow-sm dark:bg-default-50/5">
            <CardHeader className="flex items-center gap-3 pb-3">
              <div className={`p-2 rounded-lg ${isAutoevaluacion
                ? "bg-secondary/10 text-secondary"
                : "bg-primary/10 text-primary"
                }`}>
                {isAutoevaluacion ? (
                  <UserIcon className="w-5 h-5" />
                ) : (
                  <DocumentTextIcon className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Configuración de {isAutoevaluacion ? "AutoEvaluación" : "Evaluación"}
                </h3>
                <p className="text-sm text-default-500">
                  Selecciona el tipo y fecha de la evaluación
                </p>
              </div>
            </CardHeader>
            <CardBody className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <SelectTipoEvaluacion
                    isAutoevaluacion={isAutoevaluacion}
                    selectedId={tipoEvaluacion?.id ?? null}
                    tipos={tiposFiltrados}
                    onSelect={setTipoEvaluacion}
                  />
                </div>

                <div className="space-y-2">
                  <MonthNative
                    value={fechaEvaluacion}
                    onChange={setFechaEvaluacion}
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Filters Section */}
          <Card className="border-0 bg-background/60 backdrop-blur-sm shadow-sm dark:bg-default-50/5">
            <CardHeader className="flex items-center gap-3 pb-3">
              <div className="p-2 rounded-lg bg-warning/10 text-warning">
                <SparklesIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Filtros</h3>
                <p className="text-sm text-default-500">
                  Filtra usuarios por empresa y ciclo
                </p>
              </div>
            </CardHeader>
            <CardBody>
              <FiltrosEmpresaCiclo
                cicloSeleccionado={cicloSeleccionado}
                ciclos={ciclos}
                empresaSeleccionada={empresaSeleccionada}
                empresas={empresas}
                setCicloSeleccionado={setCicloSeleccionado}
                setEmpresaSeleccionada={setEmpresaSeleccionada}
              />
            </CardBody>
          </Card>

          {/* User Selection Section */}
          <Card className="border-0 bg-background/60 backdrop-blur-sm shadow-sm dark:bg-default-50/5">
            <CardHeader className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10 text-success">
                  <UsersIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Selección de Usuarios
                  </h3>
                  <p className="text-sm text-default-500">
                    {usuariosFiltrados.length} usuarios disponibles
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {usuariosSeleccionados.length > 0 && (
                  <Chip
                    size="sm"
                    color="success"
                    variant="flat"
                    startContent={<CheckCircleIcon className="w-3 h-3" />}
                  >
                    {usuariosSeleccionados.length} seleccionados
                  </Chip>
                )}
              </div>
            </CardHeader>

            <CardBody className="space-y-4">
              <BotonesSeleccionUsuarios
                usuariosFiltrados={usuariosFiltrados}
                usuariosSeleccionados={usuariosSeleccionados}
                onDeseleccionarTodos={handleDeseleccionarTodos}
                onSeleccionarTodos={handleSeleccionarTodos}
              />

              <Divider className="my-4" />

              <ListaUsuarios
                seleccionados={usuariosSeleccionados}
                usuarios={usuariosFiltrados}
                onToggle={(usuario: Usuario) => toggleUsuario(usuario)}
              />
            </CardBody>
          </Card>

          {/* Action Section */}
          <Card className="border-0 bg-background/60 backdrop-blur-sm shadow-sm dark:bg-default-50/5">
            <CardBody>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <Button
                    color="default"
                    variant="flat"
                    isDisabled={usuariosSeleccionados.length === 0}
                    startContent={<EyeIcon className="w-4 h-4" />}
                    onPress={() => setMostrarModal(true)}
                  >
                    Ver Seleccionados
                  </Button>

                  {usuariosSeleccionados.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-default-600">
                      <CheckCircleIcon className="w-4 h-4 text-success" />
                      <span>{usuariosSeleccionados.length} usuarios listos para asignar</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {!isFormValid && (
                    <div className="flex items-center gap-2 text-sm text-warning">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      <span>Completa todos los campos</span>
                    </div>
                  )}

                  {usuariosSeleccionados.length === 0 ? (
                    <Tooltip
                      color="warning"
                      content="Selecciona al menos un usuario para continuar"
                      placement="top"
                    >
                      <span>
                        <Button
                          isDisabled
                          color={isAutoevaluacion ? "secondary" : "primary"}
                          size="lg"
                          className="font-medium"
                        >
                          Asignar {isAutoevaluacion ? "AutoEvaluación" : "Evaluación"}
                        </Button>
                      </span>
                    </Tooltip>
                  ) : (
                    <Button
                      color={isAutoevaluacion ? "secondary" : "primary"}
                      size="lg"
                      type="submit"
                      variant="shadow"
                      isDisabled={!isFormValid}
                      startContent={<CheckCircleIcon className="w-5 h-5" />}
                      className="font-medium min-w-[200px]"
                    >
                      Asignar {isAutoevaluacion ? "AutoEvaluación" : "Evaluación"}
                      <Chip size="sm" variant="flat" className="ml-2 bg-white/20">
                        {usuariosSeleccionados.length}
                      </Chip>
                    </Button>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </form>

        {/* Modals */}
        <ModalUsuariosSeleccionados
          isOpen={mostrarModal}
          usuariosSeleccionados={usuariosSeleccionados}
          onClose={() => setMostrarModal(false)}
        />
        <ModalExito isOpen={modalExito.isOpen} onClose={modalExito.close} />
      </div>
    </div>
  );
};

export default FormularioAsignacionEvaluacion;