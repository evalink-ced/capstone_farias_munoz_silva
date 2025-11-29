// features/evaluacion/components/VistaTabla.tsx
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";

import { DetalleConAsignacion } from "@/features/evaluacion/utils/evaluacionMixta";

interface Props {
  items: DetalleConAsignacion[];
  onVerMixta: (detalleId: number) => void;
}

export default function VistaTabla({ items, onVerMixta }: Props) {
  return (
    <Card className="bg-background/70 backdrop-blur-sm border border-divider shadow-xl">
      <CardBody className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background border-b border-divider">
              <tr>
                <th className="text-left p-4 font-semibold text-foreground">
                  Evaluado
                </th>
                <th className="text-left p-4 font-semibold text-foreground">
                  Evaluador
                </th>
                <th className="text-left p-4 font-semibold text-foreground">
                  Tipo
                </th>
                <th className="text-left p-4 font-semibold text-foreground">
                  Período
                </th>
                <th className="text-left p-4 font-semibold text-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`border-b border-divider hover:bg-default-50/50 transition-colors ${idx % 2 === 0 ? "bg-background" : "bg-default-50/30"}`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {item.persona.first_name.charAt(0)}
                        {item.persona.last_name.charAt(0)}
                      </div>
                      <span className="font-medium text-foreground">
                        {item.persona.first_name} {item.persona.last_name}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-default-600 dark:text-default-300">
                    {item.evaluador.first_name} {item.evaluador.last_name}
                  </td>
                  <td className="p-4">
                    <Chip color="primary" size="sm" variant="flat">
                      {item.asignacion.tipo_evaluacion.n_tipo_evaluacion}
                    </Chip>
                  </td>
                  <td className="p-4 text-default-600 dark:text-default-300">
                    {item.asignacion.fecha_evaluacion}
                  </td>
                  <td className="p-4">
                    <Button
                      color="primary"
                      size="sm"
                      variant="flat"
                      onClick={() => onVerMixta(item.id)}
                    >
                      Ver Comparación
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}
