import { memo, useCallback } from "react";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import type { Evaluacion } from "@/features/evaluacion/types/evaluacion";
import { safeMonthToLabel } from "@/features/evaluacion/utils/date";
import { EvaluationUtils } from "@/features/evaluacion/constants/defaults";
import StatusBadge from "@/features/evaluacion/components/autoevaluacion/PageInicio/StatusBadge";

type Props = {
  item: Evaluacion;
  firmado: boolean;
  onOpen: (id: number, firmado: boolean) => void;
  extractTexto?: (ev: Evaluacion) => string | undefined;
};

const JefaturaEvaluacionCard = memo(function JefaturaEvaluacionCard({
  item,
  firmado,
  onOpen,
  extractTexto
}: Props) {
  const periodo = safeMonthToLabel(item.fecha_evaluacion);
  
  // Determinar el estado real de la evaluación
  const estaFirmado = item.firmado || item.estado_firma === 'firmado';
  const estaFirmadoConObs = item.firmado_obs || item.estado_firma === 'firmado_obs';
  const estaFinalizado = estaFirmado || estaFirmadoConObs;
  
  const handleClick = useCallback(() => onOpen(item.id, estaFinalizado), [item.id, estaFinalizado, onOpen]);

  const texto = extractTexto?.(item) ??
    (item as any)?.comentario_jefatura ??
    (item as any)?.observacion ??
    (item as any)?.descripcion ??
    (estaFirmadoConObs ? item.motivo_denegacion : undefined);

  // Obtener porcentaje de logro - CORREGIDO para manejar strings del backend
  const logroObtenido = (() => {
    const valor = item.logro_obtenido;
    if (typeof valor === 'number') return valor;
    if (typeof valor === 'string') {
      const parsed = parseFloat(valor);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  })();

  const tieneLogro = logroObtenido > 0;

  // Usar el sistema estandarizado de evaluación
  const logroColor = EvaluationUtils.getColor(logroObtenido);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Ver ${firmado ? "resumen final" : "evaluación por firmar"} ${item.tipo_evaluacion?.n_tipo_evaluacion ?? item.id}`}
      className="group w-full rounded-2xl border border-default-200/50 bg-background/80 p-5 text-start outline-none backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-primary/30 hover:bg-background hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:border-default-100/20 dark:bg-default-50/5"
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 flex-1 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
          {item.tipo_evaluacion?.n_tipo_evaluacion ?? "Evaluación de desempeño"}
        </h3>
        <StatusBadge finalizada={firmado} />
      </div>

      {/* Información del período */}
      <div className="mb-4 flex items-center gap-3 text-sm text-default-600">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M8 7h8M8 7a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V8a1 1 0 00-1-1" />
          </svg>
        </div>
        <span className="font-medium">Período: {periodo}</span>
      </div>

      {/* Porcentaje de logro - ACTUALIZADO con sistema estandarizado */}
      {firmado && tieneLogro && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Logro Obtenido</span>
            <Chip
              color={logroColor}
              variant="flat"
              size="sm"
              className="font-bold"
            >
              {logroObtenido.toFixed(1)}%
            </Chip>
          </div>
          <Progress
            value={logroObtenido}
            color={logroColor}
            size="sm"
            className="mb-1"
          />
          <div className="text-xs text-default-500">
            {EvaluationUtils.getText(logroObtenido)} desempeño
          </div>
        </div>
      )}

      {/* Comentario para evaluaciones por firmar o motivo de observaciones */}
      {(!estaFinalizado || estaFirmadoConObs) && texto && (
        <div className={`mb-4 rounded-xl border p-3 text-sm ${
          estaFirmadoConObs 
            ? 'border-warning-200/50 bg-warning-50/50' 
            : 'border-default-200/50 bg-default-50/50'
        }`}>
          <span className="block font-medium text-foreground mb-1">
            {estaFirmadoConObs ? 'Observaciones del trabajador' : 'Comentario de jefatura'}
          </span>
          <p className="line-clamp-3 text-default-600">{texto}</p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-default-200/50 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-default-500">
            <span className={`mr-2 inline-block h-2 w-2 rounded-full ${
              estaFirmado ? 'bg-success' : 
              estaFirmadoConObs ? 'bg-warning' : 
              'bg-warning'
            }`} />
            <span>
              {estaFirmado ? "Proceso completado" : 
               estaFirmadoConObs ? "Firmado con observaciones" : 
               "Pendiente de firma"}
            </span>
          </div>
          <div className="flex items-center text-xs font-medium text-primary transition-colors group-hover:text-primary-600">
            <span className="mr-1">
              {estaFirmado ? "Ver resumen" : 
               estaFirmadoConObs ? "Ver observaciones" : 
               "Revisar y firmar"}
            </span>
            <svg className="h-3 w-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
});

export default JefaturaEvaluacionCard;
