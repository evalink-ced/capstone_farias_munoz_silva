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
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
      <CardBody className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-4 font-semibold text-slate-700">Evaluado</th>
                <th className="text-left p-4 font-semibold text-slate-700">Evaluador</th>
                <th className="text-left p-4 font-semibold text-slate-700">Tipo</th>
                <th className="text-left p-4 font-semibold text-slate-700">Período</th>
                <th className="text-left p-4 font-semibold text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-25"}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {item.persona.first_name.charAt(0)}{item.persona.last_name.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-800">
                        {item.persona.first_name} {item.persona.last_name}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">
                    {item.evaluador.first_name} {item.evaluador.last_name}
                  </td>
                  <td className="p-4">
                    <Chip color="primary" variant="flat" size="sm">
                      {item.asignacion.tipo_evaluacion.n_tipo_evaluacion}
                    </Chip>
                  </td>
                  <td className="p-4 text-slate-600">
                    {item.asignacion.fecha_evaluacion}
                  </td>
                  <td className="p-4">
                    <Button color="primary" variant="flat" size="sm" onClick={() => onVerMixta(item.id)}>
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
