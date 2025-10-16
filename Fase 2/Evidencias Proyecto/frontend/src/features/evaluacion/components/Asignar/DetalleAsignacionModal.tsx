import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";

import { AsignacionEvaluacion } from "@/features/evaluacion/types/asignar/evaluacion";

interface ModalDetalleAsignacionProps {
  asignacionSeleccionada: AsignacionEvaluacion;
  mostrarModalDetalle: boolean;
  setMostrarModalDetalle: (mostrar: boolean) => void;
}

const ModalDetalleAsignacion: React.FC<ModalDetalleAsignacionProps> = ({
  asignacionSeleccionada,
  mostrarModalDetalle,
  setMostrarModalDetalle,
}) => {
  return (
    <Modal
      isOpen={mostrarModalDetalle}
      size="2xl"
      onOpenChange={setMostrarModalDetalle}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-default-900">
            Detalle de Asignación
          </h2>
          <p className="text-sm text-default-500">
            ID: {asignacionSeleccionada.id}
          </p>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Card className="bg-default-50">
              <CardBody className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-default-700">
                    Tipo de Evaluación:
                  </span>
                  <Chip
                    color={asignacionSeleccionada.tipo_evaluacion?.auto ? "secondary" : "primary"}
                    variant="flat"
                  >
                    {asignacionSeleccionada.tipo_evaluacion?.auto ? "🙋 Autoevaluación" : "📝 Evaluación"}
                  </Chip>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-default-700">
                    Nombre:
                  </span>
                  <span className="text-default-600">
                    {asignacionSeleccionada.tipo_evaluacion?.n_tipo_evaluacion || "No especificado"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-default-700">
                    Fecha de Evaluación:
                  </span>
                  <span className="text-default-600 flex items-center gap-1">
                    📅 {asignacionSeleccionada.fecha_evaluacion}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium text-default-700">
                    Estado:
                  </span>
                  <Chip color="success" variant="flat">
                    Asignada
                  </Chip>
                </div>
              </CardBody>
            </Card>

            {/* Sección de Usuarios Asignados */}
            {/* Sección de Usuarios Asignados */}
            <Card className="bg-default-50">
              <CardBody className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-default-700">Usuarios Asignados:</span>

                  {asignacionSeleccionada.tipo_evaluacion?.auto ? (
                    <Chip color="primary" variant="flat">
                      {(asignacionSeleccionada.personas_asignadas ??
                        asignacionSeleccionada.personas ??
                        []).length}{" "}
                      personas
                    </Chip>
                  ) : (
                    <Chip color="primary" variant="flat">
                      {(asignacionSeleccionada.detalles ?? []).length} personas
                    </Chip>
                  )}
                </div>

                {/* AUTOEVALUACIÓN: solo lista de personas */}
                {asignacionSeleccionada.tipo_evaluacion?.auto ? (
                  (() => {
                    const usuarios =
                      asignacionSeleccionada.personas_asignadas ??
                      asignacionSeleccionada.personas ??
                      [];

                    if (!usuarios.length) {
                      return (
                        <div className="text-center py-4 text-default-400">
                          <p className="text-sm">No hay usuarios asignados</p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto">
                        {usuarios.map((u, i) => (
                          <div
                            key={u.id ?? i}
                            className="flex items-center justify-between p-2 bg-white rounded-lg border border-default-200"
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-default-800">
                                {u.first_name} {u.last_name}
                              </span>
                              <div className="flex items-center gap-2 text-xs text-default-500">
                                {u.empresa?.empresa && <span>🏢 {u.empresa.empresa}</span>}
                                {u.ciclo?.ciclo && <span>🔄 {u.ciclo.ciclo}</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()
                ) : (
                  // JEFATURA: lista persona + su evaluador
                  (() => {
                    const detalles = asignacionSeleccionada.detalles ?? [];

                    if (!detalles.length) {
                      return (
                        <div className="text-center py-4 text-default-400">
                          <p className="text-sm">No hay usuarios asignados</p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto">
                        {detalles.map((d, i) => (
                          <div
                            key={d.persona?.id ?? i}
                            className="p-3 bg-white rounded-lg border border-default-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-default-800">
                                  {d.persona?.first_name} {d.persona?.last_name}
                                </span>
                                <div className="flex items-center gap-2 text-xs text-default-500">
                                  {d.persona?.empresa?.empresa && (
                                    <span>🏢 {d.persona.empresa.empresa}</span>
                                  )}
                                  {d.persona?.ciclo?.ciclo && (
                                    <span>🔄 {d.persona.ciclo.ciclo}</span>
                                  )}
                                </div>
                              </div>

                              <Chip color="secondary" variant="flat" className="ml-2">
                                👤 Jefe: {d.evaluador?.first_name} {d.evaluador?.last_name}
                              </Chip>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()
                )}
              </CardBody>
            </Card>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            variant="flat"
            onPress={() => setMostrarModalDetalle(false)}
          >
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalDetalleAsignacion;
