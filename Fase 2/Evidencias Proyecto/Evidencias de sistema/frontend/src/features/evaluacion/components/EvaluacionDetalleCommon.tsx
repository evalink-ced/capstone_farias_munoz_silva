import type { EvaluacionJefe } from "@/features/evaluacion/types/evaluacion";

import { Card, CardHeader, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Button } from "@heroui/button";
import { Progress } from "@heroui/progress";
import { Skeleton } from "@heroui/skeleton";
import {
  ChartBarIcon,
  UserIcon,
  CalendarIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { addToast } from "@heroui/toast";

import { KeyBlock } from "@/features/evaluacion/components/autoevaluacion/PageInicio/Resumen/KeyBlock";
import { EvaluationUtils } from "@/features/evaluacion/constants/defaults";
import { TimelineEstado } from "@/features/evaluacion/components/flow";
import { descargarPDFInteligente } from "@/features/evaluacion/services/pdf";
import { getEvaluacionMixta } from "@/features/evaluacion/services/evaluacionMixta";
import { fetchAsignarEvaluacion } from "@/features/evaluacion/services/asignar/evaluacion";
import axios from "@/services/google/axiosInstance";
import { useUser } from "@/hooks/useUser";

type IndicadorDetalle = {
  id: number;
  nombre: string;
  puntaje: number;
  puntaje_maximo: number;
  porcentaje: number;
};

type CompetenciaDetalle = {
  id: number;
  nombre: string;
  indicadores: IndicadorDetalle[];
};

type AreaDetalle = {
  id: number;
  nombre: string;
  competencias: CompetenciaDetalle[];
  obtenido: number;
  maximo: number;
  porcentaje: number;
};

type EvaluacionDetalleProps = {
  titulo: string;
  periodo: string;
  usuario: string;
  areas: AreaDetalle[];
  puntajeTotal: number;
  puntajeMaximo: number;
  porcentajeTotal: number;
  onBack: () => void;
  tipo: "autoevaluacion" | "evaluacion_jefatura";
  text_destacar?: string | null;
  text_mejorar?: string | null;
  text_retroalimentacion?: string | null;
  estadoEvaluacion?: string | null; // Nuevo prop para el estado
  // Nuevas props para el TimelineEstado
  evaluacionData?: EvaluacionJefe | null;
  showTimelineEstado?: boolean;
  // Nueva prop para el ID de la evaluación (necesario para PDF)
  evaluacionId?: number;
};

// Utilidades centralizadas para eliminar redundancia
const EVALUATION_UTILS = {
  getScoreColor: (
    percentage: number,
  ): "success" | "warning" | "danger" | "primary" => {
    return EvaluationUtils.getColor(percentage);
  },

  getScoreLevel: (percentage: number): string => {
    // Usar directamente los textos de defaults.ts
    return EvaluationUtils.getText(percentage);
  },

  getScoreLevelIcon: (level: string) => {
    // Mapear según el nivel específico
    if (level === "Destacado") return <CheckCircleIcon className="w-6 h-6" />;
    if (level === "Competente") return <CheckCircleIcon className="w-6 h-6" />;
    if (level === "Inicial") return <CheckCircleIcon className="w-6 h-6" />;

    return <ExclamationTriangleIcon className="w-6 h-6" />;
  },
};

export default function EvaluacionDetalleCommon({
  titulo,
  periodo,
  usuario,
  areas,
  puntajeTotal,
  puntajeMaximo,
  porcentajeTotal,
  text_destacar,
  text_mejorar,
  text_retroalimentacion,
  evaluacionData,
  showTimelineEstado = false,
  tipo,
  evaluacionId,
}: EvaluacionDetalleProps) {
  const [selectedAreaIndex, setSelectedAreaIndex] = useState(0);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const selectedArea = areas[selectedAreaIndex];
  const { user } = useUser();
  const [autoComparisonPct, setAutoComparisonPct] = useState<number | null>(
    null,
  );
  const [autoLoading, setAutoLoading] = useState(false);

  // ✅ Validar porcentajeTotal antes de usarlo en los cálculos
  const porcentajeTotalValidado = (() => {
    if (
      typeof porcentajeTotal === "number" &&
      !isNaN(porcentajeTotal) &&
      porcentajeTotal >= 0
    ) {
      return Math.min(porcentajeTotal, 100); // Limitar a 100%
    }
    if (typeof porcentajeTotal === "string") {
      const converted = parseFloat(porcentajeTotal);

      return !isNaN(converted) && converted >= 0 ? Math.min(converted, 100) : 0;
    }
    // ✅ Calcular como respaldo si no hay valor válido
    if (puntajeMaximo > 0) {
      return Math.min((puntajeTotal / puntajeMaximo) * 100, 100);
    }

    return 0;
  })();

  const logroLevel = EVALUATION_UTILS.getScoreLevel(porcentajeTotalValidado);
  const logroColor = EVALUATION_UTILS.getScoreColor(porcentajeTotalValidado);

  const handleAreaChange = (index: number) => {
    setSelectedAreaIndex(index);
  };

  const showStats =
    tipo === "evaluacion_jefatura" || !!evaluacionData?.ponderada;

  const showAuto = autoComparisonPct != null;

  useEffect(() => {
    let active = true;

    if (tipo === "evaluacion_jefatura" && evaluacionId) {
      setAutoLoading(true);
      (async () => {
        try {
          const asignaciones = await fetchAsignarEvaluacion();
          const te = evaluacionData?.tipo_evaluacion?.n_tipo_evaluacion || "";
          const fecha = evaluacionData?.fecha_evaluacion || "";
          const personaId = evaluacionData?.persona?.id;
          const evaluadorId = user?.id;

          const parts = String(fecha).split("-");
          const fechaCandidates: string[] = [String(fecha)];

          if (parts.length === 2) {
            const [a, b] = parts;

            if (/^\d{2}$/.test(a) && /^\d{4}$/.test(b))
              fechaCandidates.push(`${b}-${a}`);
            if (/^\d{4}$/.test(a) && /^\d{2}$/.test(b))
              fechaCandidates.push(`${b}-${a}`);
          }

          let detalleId: number | null = null;

          for (const a of asignaciones || []) {
            const tipoNombre = String(
              a?.tipo_evaluacion?.n_tipo_evaluacion ?? "",
            );
            const fechaAsignacion = String(a?.fecha_evaluacion ?? "");

            if (
              tipoNombre === String(te) &&
              fechaCandidates.includes(fechaAsignacion)
            ) {
              for (const d of a?.detalles || []) {
                const personaOk =
                  String(d?.persona?.id ?? "") === String(personaId ?? "");
                const evaluadorOk =
                  evaluadorId == null ||
                  String(d?.evaluador?.id ?? "") === String(evaluadorId);

                if (personaOk && evaluadorOk) {
                  detalleId = Number(d.id);
                  break;
                }
              }
            }
            if (detalleId != null) break;
          }

          if (detalleId != null) {
            const data2 = await getEvaluacionMixta(detalleId);
            const pct2 = data2?.resumen?.auto_pct;

            if (active)
              setAutoComparisonPct(typeof pct2 === "number" ? pct2 : null);
          } else {
            if (active) setAutoComparisonPct(null);
          }
        } catch {
          if (active) setAutoComparisonPct(null);
        }

        try {
          if (autoComparisonPct == null) {
            const tipoId = evaluacionData?.tipo_evaluacion?.id;
            const fecha = evaluacionData?.fecha_evaluacion || "";
            const personaId = evaluacionData?.persona?.id;

            if (tipoId && fecha && personaId) {
              const parts = String(fecha).split("-");
              const candidates: string[] = [String(fecha)];

              if (parts.length === 2) {
                const [a, b] = parts;

                if (/^\d{2}$/.test(a) && /^\d{4}$/.test(b))
                  candidates.push(`${b}-${a}`);
                if (/^\d{4}$/.test(a) && /^\d{2}$/.test(b))
                  candidates.push(`${b}-${a}`);
              }

              let found: number | null = null;

              for (const f of candidates) {
                // Usar solo persona + fecha (el tipo de AUTO puede diferir del tipo de JEFATURA)
                const params = new URLSearchParams({
                  fecha_evaluacion: String(f),
                  persona: String(personaId),
                });
                const { data } = await axios.get(
                  `/evaluacion/api/autoevaluaciones-subordinados/?${params.toString()}`,
                );

                // Puede devolver lista simple de autoevaluaciones (detalle) o lista de grupos
                if (Array.isArray(data) && data.length) {
                  // Lista simple
                  const item = data.find(
                    (x: any) =>
                      String(x?.persona?.id ?? "") === String(personaId),
                  );
                  const pct3n = Number(item?.logro_obtenido);

                  if (!Number.isNaN(pct3n)) {
                    found = pct3n;
                    break;
                  }
                } else if (Array.isArray(data)) {
                  // Lista de grupos
                  const grupo = data.find(
                    (g: any) => String(g?.fecha_evaluacion ?? "") === String(f),
                  );
                  const item = grupo?.autoevaluaciones?.find(
                    (x: any) =>
                      String(x?.persona?.id ?? "") === String(personaId),
                  );
                  const pct3n = Number(item?.logro_obtenido);

                  if (!Number.isNaN(pct3n)) {
                    found = pct3n;
                    break;
                  }
                } else if (data && Array.isArray(data?.autoevaluaciones)) {
                  // Objeto con autoevaluaciones
                  const item = data.autoevaluaciones.find(
                    (x: any) =>
                      String(x?.persona?.id ?? "") === String(personaId),
                  );
                  const pct3n = Number(item?.logro_obtenido);

                  if (!Number.isNaN(pct3n)) {
                    found = pct3n;
                    break;
                  }
                }
              }

              // Si aún no encontramos, intentar sin fecha: obtener grupos y escoger el más reciente
              if (found == null) {
                // Buscar sin fecha: obtener todos los grupos del jefe y escoger el que coincide o el más reciente
                const { data: dataAll } = await axios.get(
                  `/evaluacion/api/autoevaluaciones-subordinados/`,
                );

                if (Array.isArray(dataAll) && dataAll.length) {
                  const match = dataAll.find((g: any) =>
                    candidates.includes(String(g?.fecha_evaluacion ?? "")),
                  );
                  const grupo = match ?? dataAll[0];
                  const item = grupo?.autoevaluaciones?.find(
                    (x: any) =>
                      String(x?.persona?.id ?? "") === String(personaId),
                  );
                  const pct4n = Number(item?.logro_obtenido);

                  if (!Number.isNaN(pct4n)) found = pct4n;
                }
              }

              if (active) setAutoComparisonPct(found);
            }
          }
        } catch {
          if (active) setAutoComparisonPct(null);
        }
        if (active) setAutoLoading(false);
      })();
    } else {
      setAutoComparisonPct(null);
      setAutoLoading(false);
    }

    return () => {
      active = false;
    };
  }, [tipo, evaluacionId, evaluacionData, user?.id]);

  const handleDownloadPDF = async () => {
    if (!evaluacionId) {
      addToast({
        title: "Error",
        description:
          "No se puede descargar el PDF: ID de evaluación no disponible",
        color: "danger",
        variant: "solid",
      });

      return;
    }

    setDownloadingPDF(true);
    try {
      await descargarPDFInteligente({
        evaluacionId,
        evaluacion: evaluacionData,
        currentUserId: user?.id,
        prefer: tipo === "autoevaluacion" ? "mis" : undefined,
      });

      addToast({
        title: "PDF Descargado",
        description: "El archivo PDF se ha descargado exitosamente",
        color: "success",
        variant: "solid",
      });
    } catch (error: any) {
      console.error("Error downloading PDF:", error);
      addToast({
        title: "Error al descargar PDF",
        description:
          error?.response?.data?.error ||
          error.message ||
          "No se pudo descargar el archivo PDF",
        color: "danger",
        variant: "solid",
      });
    } finally {
      setDownloadingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/50 rounded-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <HeaderSection
          downloadingPDF={downloadingPDF}
          periodo={periodo}
          showDownloadButton={!!evaluacionId}
          title={titulo}
          usuario={usuario}
          onDownloadPDF={handleDownloadPDF}
        />

        {/* Resultado Principal */}
        <ResultadoPrincipalCard
          autoComparisonPct={autoComparisonPct}
          autoLoading={autoLoading}
          logroColor={logroColor}
          logroLevel={logroLevel}
          porcentajeTotal={porcentajeTotal}
          puntajeMaximo={puntajeMaximo}
          puntajeTotal={puntajeTotal}
          showAuto={showAuto}
          showStats={showStats}
        />

        {/* Timeline de Estado - Mostrar si está habilitado y hay datos */}
        {showTimelineEstado && evaluacionData && (
          <div className="mb-8">
            <TimelineEstado evaluacion={evaluacionData} />
          </div>
        )}

        {/* ÚNICA NAVEGACIÓN: Resumen por áreas */}
        <AreasProgressOverview
          areas={areas}
          selectedAreaIndex={selectedAreaIndex}
          onAreaSelect={handleAreaChange}
        />

        {/* Área seleccionada SIN navegación */}
        <SimpleAreaCard
          area={selectedArea}
          areaIndex={selectedAreaIndex}
          totalAreas={areas.length}
        />

        {/* Sección de comentarios */}
        {(text_destacar || text_mejorar || text_retroalimentacion) && (
          <div className="mt-8">
            <CommentsSection
              destacar={text_destacar}
              mejorar={text_mejorar}
              retroalimentacion={text_retroalimentacion}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function HeaderSection({
  title,
  periodo,
  usuario,
  onDownloadPDF,
  downloadingPDF,
  showDownloadButton,
}: {
  title: string;
  periodo: string;
  usuario: string;
  onDownloadPDF: () => void;
  downloadingPDF: boolean;
  showDownloadButton: boolean;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            {title}
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 text-sm text-default-600">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              <span>{periodo}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              <span>{usuario}</span>
            </div>
          </div>
        </div>

        {/* Botón de descarga de PDF */}
        {showDownloadButton && (
          <div className="flex-shrink-0">
            <Button
              color="primary"
              isDisabled={downloadingPDF}
              isLoading={downloadingPDF}
              startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
              variant="flat"
              onPress={onDownloadPDF}
            >
              {downloadingPDF ? "Generando PDF..." : "Descargar PDF"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultadoPrincipalCard({
  puntajeTotal,
  puntajeMaximo,
  porcentajeTotal,
  logroLevel,
  logroColor,
  showStats,
  autoComparisonPct,
  showAuto,
  autoLoading,
}: {
  puntajeTotal: number;
  puntajeMaximo: number;
  porcentajeTotal: number;
  logroLevel: string;
  logroColor: "success" | "warning" | "danger" | "primary";
  showStats: boolean;
  autoComparisonPct: number | null;
  showAuto: boolean;
  autoLoading: boolean;
}) {
  // ✅ Los valores ya vienen validados desde el componente padre
  // Solo necesitamos asegurar que sean números válidos
  const puntajeTotalSeguro = Math.max(0, Math.floor(puntajeTotal || 0));
  const puntajeMaximoSeguro = Math.max(1, Math.floor(puntajeMaximo || 1));
  const porcentajeSeguro = Math.min(Math.max(porcentajeTotal || 0, 0), 100);
  const autoPctSeguro = Math.min(Math.max(autoComparisonPct ?? 0, 0), 100);

  return (
    <Card className="mb-8 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <ChartBarIcon className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold">Resultado Final</h2>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        <div
          className={`grid grid-cols-1 ${showStats ? (showAuto || autoLoading ? "md:grid-cols-4" : "md:grid-cols-3") : showAuto || autoLoading ? "md:grid-cols-2" : "md:grid-cols-1"} gap-6`}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground mb-2">
              {puntajeTotalSeguro} / {puntajeMaximoSeguro}
            </div>
            <div className="text-sm text-default-600">Puntaje Total</div>
          </div>
          {showStats && (
            <>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground mb-2">
                  {porcentajeSeguro.toFixed(1)}%
                </div>
                <div className="text-sm text-default-600">Porcentaje</div>
                <Progress
                  className="mt-2"
                  color={logroColor}
                  size="sm"
                  value={porcentajeSeguro}
                />
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Chip
                    color={logroColor}
                    size="lg"
                    startContent={EVALUATION_UTILS.getScoreLevelIcon(
                      logroLevel,
                    )}
                    variant="flat"
                  >
                    {logroLevel}
                  </Chip>
                </div>
                <div className="text-sm text-default-600">Nivel de Logro</div>
              </div>
            </>
          )}
          {showAuto && (
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-2">
                {autoPctSeguro.toFixed(1)}%
              </div>
              <div className="text-sm text-default-600">Autoevaluación</div>
              <Progress
                className="mt-2"
                color={EVALUATION_UTILS.getScoreColor(autoPctSeguro)}
                size="sm"
                value={autoPctSeguro}
              />
            </div>
          )}
          {!showAuto && autoLoading && (
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Skeleton className="h-8 w-24" />
              </div>
              <div className="text-sm text-default-600">Autoevaluación</div>
              <Skeleton className="mt-2 h-2 w-full" />
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

function AreasProgressOverview({
  areas,
  selectedAreaIndex,
  onAreaSelect,
}: {
  areas: AreaDetalle[];
  selectedAreaIndex: number;
  onAreaSelect: (index: number) => void;
}) {
  return (
    <Card className="mb-8 shadow-lg">
      <CardHeader>
        <h2 className="text-xl font-semibold">Resumen por Áreas</h2>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {areas.map((area, index) => (
            <Card
              key={area.id}
              isHoverable
              isPressable
              className={`cursor-pointer transition-all duration-200 ${
                index === selectedAreaIndex
                  ? "ring-2 ring-primary bg-primary/5 dark:bg-primary/10"
                  : "hover:bg-default-50 dark:hover:bg-default-900/20"
              }`}
              onPress={() => onAreaSelect(index)}
            >
              <CardBody className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="font-medium text-sm text-foreground truncate flex-1">
                    {area.nombre}
                  </h3>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-default-600">Puntaje</span>
                    <span className="font-medium">
                      {area.obtenido}/{area.maximo}
                    </span>
                  </div>

                  <Progress
                    className="w-full"
                    color={EVALUATION_UTILS.getScoreColor(area.porcentaje)}
                    size="sm"
                    value={area.porcentaje}
                  />

                  <div className="text-center">
                    <Chip
                      color={EVALUATION_UTILS.getScoreColor(area.porcentaje)}
                      size="sm"
                      variant="flat"
                    >
                      {area.porcentaje.toFixed(1)}%
                    </Chip>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

// Nuevo componente simplificado SIN botones de navegación
function SimpleAreaCard({
  area,
  areaIndex,
  totalAreas,
}: {
  area: AreaDetalle;
  areaIndex: number;
  totalAreas: number;
}) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {areaIndex + 1}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold">{area.nombre}</h2>
            <p className="text-sm text-default-600">
              Área {areaIndex + 1} de {totalAreas}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardBody>
        <AreaView area={area} />
      </CardBody>
    </Card>
  );
}

function AreaView({ area }: { area: AreaDetalle }) {
  return (
    <div className="space-y-6">
      {/* Resumen del área */}
      <Card className="bg-default-50 dark:bg-default-900/20">
        <CardBody className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-foreground">
                {area.obtenido} / {area.maximo}
              </div>
              <div className="text-sm text-default-600">Puntaje del Área</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {area.porcentaje.toFixed(1)}%
              </div>
              <div className="text-sm text-default-600">Porcentaje</div>
            </div>
            <div>
              <Progress
                className="mt-2"
                color={EVALUATION_UTILS.getScoreColor(area.porcentaje)}
                size="lg"
                value={area.porcentaje}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Competencias e Indicadores */}
      <div className="space-y-4">
        {area.competencias.map((competencia, compIndex) => (
          <CompetenciaCard
            key={competencia.id}
            competencia={competencia}
            index={compIndex}
          />
        ))}
      </div>
    </div>
  );
}

function CompetenciaCard({
  competencia,
  index,
}: {
  competencia: CompetenciaDetalle;
  index: number;
}) {
  return (
    <Card className="border border-divider">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {index + 1}
            </span>
          </div>
          <h3 className="font-semibold text-foreground">
            {competencia.nombre}
          </h3>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        <div className="space-y-3">
          {/* Header para desktop */}
          <div className="hidden lg:grid grid-cols-12 gap-4 text-sm font-medium text-default-600 border-b border-divider pb-2">
            <div className="col-span-8">Indicador</div>
            <div className="col-span-2 text-center">Puntaje</div>
            <div className="col-span-2 text-center">Máximo</div>
          </div>

          {/* Indicadores */}
          {competencia.indicadores.map((indicador) => (
            <IndicadorRow key={indicador.id} indicador={indicador} />
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

function IndicadorRow({ indicador }: { indicador: IndicadorDetalle }) {
  // ✅ Usar el porcentaje del indicador si existe y es válido, sino calcularlo
  const porcentaje = (() => {
    // Si el indicador ya tiene un porcentaje válido, usarlo
    if (
      typeof indicador.porcentaje === "number" &&
      !isNaN(indicador.porcentaje) &&
      indicador.porcentaje >= 0
    ) {
      return Math.min(indicador.porcentaje, 100);
    }

    // Sino, calcularlo dinámicamente
    if (indicador.puntaje_maximo > 0) {
      return Math.min(
        (indicador.puntaje / indicador.puntaje_maximo) * 100,
        100,
      );
    }

    return 0;
  })();

  const color = EVALUATION_UTILS.getScoreColor(porcentaje);

  return (
    <>
      {/* Vista móvil */}
      <div className="lg:hidden p-4 rounded-lg border border-divider bg-background/50 space-y-3">
        <div className="flex items-start gap-3">
          <Popover showArrow placement="top">
            <PopoverTrigger>
              <Button
                isIconOnly
                className="flex-shrink-0 mt-0.5"
                size="sm"
                variant="light"
              >
                <InformationCircleIcon className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="max-w-[320px] p-4">
              <div className="text-sm text-foreground whitespace-pre-wrap">
                {indicador.nombre}
              </div>
            </PopoverContent>
          </Popover>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground text-sm leading-snug">
              {indicador.nombre}
            </h4>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <p className="text-xs text-default-500 mb-1">Puntaje</p>
            <Chip color={color} size="sm" variant="flat">
              {indicador.puntaje}
            </Chip>
          </div>
          <div className="text-center">
            <p className="text-xs text-default-500 mb-1">Máximo</p>
            <Chip color="default" size="sm" variant="flat">
              {indicador.puntaje_maximo}
            </Chip>
          </div>
        </div>
      </div>

      {/* Vista desktop */}
      <div className="hidden lg:grid grid-cols-12 gap-4 items-center p-4 rounded-lg hover:bg-default-50 dark:hover:bg-default-900/20 transition-colors">
        <div className="col-span-8 flex items-center gap-3">
          <Popover showArrow placement="right">
            <PopoverTrigger>
              <span className="font-medium cursor-help text-foreground hover:text-primary transition-colors line-clamp-2">
                {indicador.nombre}
              </span>
            </PopoverTrigger>
            <PopoverContent className="max-w-[480px] p-4">
              <div className="text-sm text-foreground whitespace-pre-wrap">
                {indicador.nombre}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="col-span-2 text-center">
          <Chip color={color} size="sm" variant="flat">
            {indicador.puntaje}
          </Chip>
        </div>

        <div className="col-span-2 text-center">
          <Chip color="default" size="sm" variant="flat">
            {indicador.puntaje_maximo}
          </Chip>
        </div>
      </div>
    </>
  );
}

// Agregar el componente CommentsSection al final del archivo
const CommentsSection = ({
  destacar,
  mejorar,
  retroalimentacion,
}: {
  destacar?: string | null;
  mejorar?: string | null;
  retroalimentacion?: string | null;
}) => {
  // Helper function to check if text has meaningful content
  const hasContent = (text?: string | null): boolean => {
    return text !== null && text !== undefined && text.trim() !== "";
  };

  const showDestacar = hasContent(destacar);
  const showMejorar = hasContent(mejorar);
  const showRetroalimentacion = hasContent(retroalimentacion);

  // If none of the sections have content, don't render anything
  if (!showDestacar && !showMejorar && !showRetroalimentacion) {
    return null;
  }

  return (
    <>
      {/* Only show the grid if at least one of destacar or mejorar has content */}
      {(showDestacar || showMejorar) && (
        <div
          className={`grid gap-6 mb-6 ${showDestacar && showMejorar ? "md:grid-cols-2" : "md:grid-cols-1"}`}
        >
          {/* Fortalezas Destacadas - Only show if destacar has content */}
          {showDestacar && (
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                    <svg
                      className="h-5 w-5 text-success"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M5 13l4 4L19 7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>
                  <h3 className="font-medium">Fortalezas Destacadas</h3>
                </div>
              </CardHeader>
              <CardBody>
                <KeyBlock text={destacar} title="" />
              </CardBody>
            </Card>
          )}

          {/* Oportunidades de Mejora - Only show if mejorar has content */}
          {showMejorar && (
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                    <svg
                      className="h-5 w-5 text-warning"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </div>
                  <h3 className="font-medium">Oportunidades de Mejora</h3>
                </div>
              </CardHeader>
              <CardBody>
                <KeyBlock text={mejorar} title="" />
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {/* Retroalimentación - Only show if retroalimentacion has content */}
      {showRetroalimentacion && (
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                <svg
                  className="h-5 w-5 text-warning"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <h3 className="font-medium">Retroalimentación</h3>
            </div>
          </CardHeader>
          <CardBody>
            <KeyBlock text={retroalimentacion} title="" />
          </CardBody>
        </Card>
      )}
    </>
  );
};
