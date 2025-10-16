// features/evaluacion/components/VistaTarjetas.tsx
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { DetalleConAsignacion } from "@/features/evaluacion/utils/evaluacionMixta";

interface Props {
  items: DetalleConAsignacion[];
  onVerMixta: (detalleId: number) => void;
}

export default function VistaTarjetas({ items, onVerMixta }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <Card key={item.id} className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {item.persona.first_name.charAt(0)}{item.persona.last_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">
                    {item.persona.first_name} {item.persona.last_name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {item.asignacion.tipo_evaluacion.n_tipo_evaluacion}
                  </p>
                </div>
              </div>
              <Chip color="primary" variant="flat" size="sm">
                {new Date(item.asignacion.fecha_evaluacion).getFullYear()}
              </Chip>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>Evaluador: {item.evaluador.first_name} {item.evaluador.last_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>Período: {item.asignacion.fecha_evaluacion}</span>
              </div>
              <Button color="primary" className="w-full mt-4" onClick={() => onVerMixta(item.id)}>
                Ver Comparación Mixta
              </Button>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
