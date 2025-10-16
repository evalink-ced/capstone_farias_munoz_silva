import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Spinner } from "@heroui/spinner";
import { addToast } from "@heroui/toast";
import axios from "@/services/google/axiosInstance";
import EvaluacionDetalleCommon from "@/features/evaluacion/components/EvaluacionDetalleCommon";
import { Autoevaluacion, AreaDetalle, CompetenciaDetalle, IndicadorDetalle } from "@/features/evaluacion/types/evaluacion";

export default function AutoEvaluacionDetalleFinalizadaPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const id = state?.id;

  const [evaluacion, setEvaluacion] = useState<Autoevaluacion | null>(null);
  const [loading, setLoading] = useState(true);

  // Priorizar estructura_json (snapshot) sobre tipo_evaluacion
  const estructura = evaluacion?.estructura_json ?? evaluacion?.tipo_evaluacion;

  useEffect(() => {
    if (!id) {
      addToast({
        title: "Error",
        description: "No se encontró la evaluación seleccionada.",
        color: "danger",
        variant: "solid",
      });
      navigate("/autoevaluacion");
      return;
    }

    const cargarEvaluacion = async () => {
      try {
        const { data } = await axios.get(`/evaluacion/api/autoevaluaciones/${id}/`);
        setEvaluacion(data);
      } catch (err) {
        console.error(err);
        addToast({
          title: "Error al cargar los datos",
          description: "No se pudo cargar la evaluación.",
          color: "danger",
          variant: "solid",
        });
        navigate("/autoevaluacion");
      } finally {
        setLoading(false);
      }
    };

    cargarEvaluacion();
  }, [id, navigate]);

  const respuestasMap = useMemo(() => {
    if (!evaluacion?.respuestas) return {} as Record<number, number>;
    return evaluacion.respuestas.reduce((acc: Record<number, number>, r: any) => {
      acc[r.indicador] = Number(r.puntaje) ?? 0;
      return acc;
    }, {});
  }, [evaluacion]);

  // Simplificado para usar valores del backend y mantener solo cálculos de áreas para el resumen
  const { areas, puntajeTotal, puntajeMaximo, porcentajeTotal } = useMemo(() => {
    if (!estructura?.areas) {
      return {
        areas: [] as AreaDetalle[],
        puntajeTotal: evaluacion?.puntaje_total_obtenido || 0,
        puntajeMaximo: evaluacion?.puntaje_total_maximo || 0,
        porcentajeTotal: evaluacion?.logro_obtenido || 0 // ✅ Usar logro_obtenido del backend
      };
    }

    // Calcular áreas solo para el resumen detallado
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
            puntaje_maximo: maxPuntaje
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
      puntajeTotal: evaluacion?.puntaje_total_obtenido || 0, // ✅ Usar valor del backend
      puntajeMaximo: evaluacion?.puntaje_total_maximo || 0,  // ✅ Usar valor del backend
      porcentajeTotal: evaluacion?.logro_obtenido || 0       // ✅ Usar logro_obtenido del backend
    };
  }, [estructura, respuestasMap, evaluacion]);

  // Obtener título y datos del usuario desde la respuesta del backend
  const titulo = estructura?.n_tipo_evaluacion || evaluacion?.tipo_evaluacion?.n_tipo_evaluacion || "Detalle de Autoevaluación";
  const periodo = evaluacion?.fecha_evaluacion || 'Sin período';
  const nombreUsuario = evaluacion?.persona 
    ? `${evaluacion.persona.first_name || ''} ${evaluacion.persona.last_name || ''}`.trim() 
    : 'Sin usuario';

  const handleBack = () => {
    navigate("/autoevaluacion");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Spinner size="lg" color="primary" />
          <p className="text-default-600">Cargando evaluación...</p>
        </div>
      </div>
    );
  }

  if (!evaluacion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-lg text-default-600">No se encontró la evaluación</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <EvaluacionDetalleCommon
          titulo={titulo}
          periodo={periodo}
          usuario={nombreUsuario}
          areas={areas}
          puntajeTotal={puntajeTotal}
          puntajeMaximo={puntajeMaximo}
          porcentajeTotal={porcentajeTotal}
          onBack={handleBack}
          tipo="autoevaluacion"
          text_destacar={evaluacion?.text_destacar}
          text_mejorar={evaluacion?.text_mejorar}
          evaluacionId={id}
        />
      </div>
    </div>
  );
}