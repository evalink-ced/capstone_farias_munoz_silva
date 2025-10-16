import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { addToast } from "@heroui/toast";

import axios from "@/services/google/axiosInstance";
import EvaluacionDetalleCommon from "@/features/evaluacion/components/EvaluacionDetalleCommon";
import { Autoevaluacion, AreaDetalle, CompetenciaDetalle, IndicadorDetalle } from "@/features/evaluacion/types/evaluacion";

export default function AutoevaluacionDetallePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [autoevaluacion, setAutoevaluacion] = useState<Autoevaluacion | null>(null);
  const [loading, setLoading] = useState(true);

  // Obtener ID y URL de retorno del state
  const id = location.state?.id;
  const backUrl = location.state?.backUrl || '/evaluacion-jefatura/autoevaluaciones-subordinados';

  // Priorizar estructura_json (snapshot) sobre tipo_evaluacion
  const estructura = autoevaluacion?.estructura_json ?? autoevaluacion?.tipo_evaluacion;

  useEffect(() => {
    if (!id) {
      navigate(backUrl);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/evaluacion/api/autoevaluaciones-subordinados/${id}/`);
        setAutoevaluacion(response.data);
      } catch (err) {
        console.error(err);
        addToast({
          title: "Error al cargar",
          description: "No se pudo obtener el detalle de la autoevaluación.",
          color: "danger",
          variant: "solid",
        });
        navigate(backUrl);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate, backUrl]);

  const respuestasMap = useMemo(() => {
    if (!autoevaluacion?.respuestas) return {} as Record<number, number>;
    return autoevaluacion.respuestas.reduce((acc: Record<number, number>, r: any) => {
      acc[r.indicador] = Number(r.puntaje) ?? 0;
      return acc;
    }, {});
  }, [autoevaluacion]);

  // Calcular áreas siguiendo el mismo patrón que las páginas que funcionan
  const { areas, puntajeTotal, puntajeMaximo, porcentajeTotal } = useMemo(() => {
    if (!estructura?.areas) {
      return {
        areas: [] as AreaDetalle[],
        puntajeTotal: autoevaluacion?.puntaje_total_obtenido || 0,
        puntajeMaximo: autoevaluacion?.puntaje_total_maximo || 0,
        porcentajeTotal: autoevaluacion?.logro_obtenido || 0
      };
    }

    // Calcular áreas para el resumen detallado
    const areasCalculadas: AreaDetalle[] = estructura.areas.map((area: any) => {
      let obtenido = 0;
      let maximo = 0;

      const competenciasCalculadas = (area?.competencias ?? []).map((comp: any) => {
        const indicadoresCalculados = (comp?.indicadores ?? []).map((ind: any) => {
          // Obtener el puntaje máximo de los niveles de logro
          const niveles = ind?.nvlindicadores ?? [];
          const maxPuntaje = niveles.length
            ? Math.max(...niveles.map((n: any) => Number(n.puntaje) || 0))
            : 4;

          maximo += maxPuntaje;
          const puntajeResp = respuestasMap[Number(ind.id)] ?? 0;
          obtenido += puntajeResp;

          return {
            id: Number(ind.id),
            nombre: ind.indicador || 'Sin nombre',
            puntaje: puntajeResp,
            puntaje_maximo: maxPuntaje,
            porcentaje: maxPuntaje > 0 ? (puntajeResp / maxPuntaje) * 100 : 0
          } as IndicadorDetalle;
        });

        return {
          id: Number(comp.id),
          nombre: comp.name || 'Sin nombre',
          indicadores: indicadoresCalculados
        } as CompetenciaDetalle;
      });

      const porcentaje = maximo > 0 ? (obtenido / maximo) * 100 : 0;

      return {
        id: Number(area.id) || 0,
        nombre: area.n_area || 'Sin nombre',
        competencias: competenciasCalculadas,
        obtenido,
        maximo,
        porcentaje
      } as AreaDetalle;
    });

    return {
      areas: areasCalculadas,
      puntajeTotal: autoevaluacion?.puntaje_total_obtenido || 0,
      puntajeMaximo: autoevaluacion?.puntaje_total_maximo || 0,
      porcentajeTotal: autoevaluacion?.logro_obtenido || 0
    };
  }, [estructura, respuestasMap, autoevaluacion]);

  const handleBack = () => {
    navigate(backUrl);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Cargando autoevaluación...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!autoevaluacion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="mb-8">
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontró la autoevaluación.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <EvaluacionDetalleCommon
          titulo={`Autoevaluación - ${estructura?.n_tipo_evaluacion || autoevaluacion.tipo_evaluacion?.n_tipo_evaluacion || 'Sin tipo'}`}
          periodo={autoevaluacion.fecha_evaluacion}
          usuario={`${autoevaluacion.persona?.first_name || ''} ${autoevaluacion.persona?.last_name || ''}`.trim()}
          areas={areas}
          puntajeTotal={puntajeTotal}
          puntajeMaximo={puntajeMaximo}
          porcentajeTotal={porcentajeTotal}
          text_destacar={autoevaluacion.text_destacar}
          text_mejorar={autoevaluacion.text_mejorar}
          onBack={handleBack}
          tipo="autoevaluacion"
          evaluacionId={id}
        />
      </div>
    </div>
  );
}