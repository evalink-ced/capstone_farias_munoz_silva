import React from "react";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Card, CardBody } from "@heroui/card";
import { Badge } from "@heroui/badge";
import { Chip } from "@heroui/chip";
import { GraduationCap, Calendar, BookOpen, Award } from "lucide-react";

import { Capacitacion } from "@/types/types";

interface UserCapacitacionProps {
  capacitacion: Capacitacion[];
}

const UserCapacitacion: React.FC<UserCapacitacionProps> = ({
  capacitacion,
}) => {
  if (!capacitacion || capacitacion.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="bg-default-100 dark:bg-default-50/20 rounded-full p-6 mb-4">
          <BookOpen className="w-8 h-8 text-default-400" />
        </div>
        <h3 className="text-lg font-medium text-default-700 dark:text-default-300 mb-2">
          Sin capacitaciones registradas
        </h3>
        <p className="text-sm text-default-500 text-center max-w-md">
          No hay capacitaciones disponibles para mostrar en este momento.
        </p>
      </div>
    );
  }

  const agrupadasPorTitulo = capacitacion.reduce(
    (acc, cap) => {
      const titulo = cap.capacitacion.titulo_general;
      if (!acc[titulo]) acc[titulo] = [];
      acc[titulo].push(cap);
      return acc;
    },
    {} as Record<string, Capacitacion[]>,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-2">
          <Award className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-default-900 dark:text-default-100">
            Capacitaciones
          </h2>
          <p className="text-sm text-default-500 dark:text-default-400">
            {capacitacion.length} capacitación{capacitacion.length !== 1 ? 'es' : ''} completada{capacitacion.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Accordion */}
      <Accordion
        className="space-y-3"
        variant="splitted"
        selectionMode="multiple"
      >
        {Object.entries(agrupadasPorTitulo).map(([titulo, items]) => (
          <AccordionItem
            key={titulo}
            className="!bg-background dark:!bg-default-50/5 border border-default-200 dark:border-default-100/20 hover:border-primary/30 dark:hover:border-primary/40 transition-colors duration-200"
            title={
              <div className="flex items-center justify-between w-full pr-2">
                <div className="flex items-center gap-3">
                  <div className="bg-secondary/10 dark:bg-secondary/20 rounded-lg p-2">
                    <GraduationCap className="w-4 h-4 text-secondary" />
                  </div>
                  <span className="font-medium text-default-900 dark:text-default-100">
                    {titulo}
                  </span>
                </div>
                <Badge
                  color="primary"
                  variant="flat"
                  size="sm"
                  className="bg-primary/10 dark:bg-primary/20 text-primary font-medium"
                >
                  {items.length}
                </Badge>
              </div>
            }
          >
            <div className="space-y-3 pb-2">
              {items.map((cap, idx) => (
                <Card
                  key={idx}
                  className="bg-default-50/50 dark:bg-default-100/5 border border-default-200/60 dark:border-default-100/10 hover:bg-default-100/60 dark:hover:bg-default-100/10 hover:border-primary/20 dark:hover:border-primary/30 transition-all duration-300 hover:shadow-sm dark:hover:shadow-default-500/10"
                  shadow="none"
                  radius="lg"
                >
                  <CardBody className="p-4">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      {/* Contenido principal */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-default-900 dark:text-default-100 leading-tight mb-2">
                          {cap.capacitacion.nombre}
                        </h3>

                        {cap.capacitacion.descripcion && (
                          <p className="text-sm text-default-600 dark:text-default-400 line-clamp-2 mb-3">
                            {cap.capacitacion.descripcion}
                          </p>
                        )}

                        {/* Fecha */}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-default-400" />
                          <Chip
                            size="sm"
                            variant="flat"
                            color="default"
                            className="bg-default-200/60 dark:bg-default-100/20 text-default-700 dark:text-default-300 font-medium px-2"
                          >
                            {cap.fecha_realizacion}
                          </Chip>
                        </div>
                      </div>

                      {/* Indicador visual */}
                      <div className="hidden sm:flex items-center justify-center w-12 h-12 bg-success/10 dark:bg-success/20 rounded-full">
                        <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white dark:bg-default-900 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default UserCapacitacion;