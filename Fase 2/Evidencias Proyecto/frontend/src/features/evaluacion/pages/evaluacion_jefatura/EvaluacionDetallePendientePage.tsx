import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Spinner } from "@heroui/spinner";
import { addToast } from "@heroui/toast";
import axios from "@/services/google/axiosInstance";
import EvaluacionDetalleCommon from "@/features/evaluacion/components/EvaluacionDetalleCommon";
import { EvaluacionJefe, AreaDetalle, CompetenciaDetalle, IndicadorDetalle } from "@/features/evaluacion/types/evaluacion";

export default function EvaluacionDetallePendientePage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const id = state?.id;

  const [evaluacion, setEvaluacion] = useState<EvaluacionJefe | null>(null);
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
      navigate("/evaluacion-jefatura");
      return;
    }

    const cargarEvaluacion = async () => {
      try {
        const { data } = await axios.get(`/evaluacion/api/evaluaciones-jefe/${id}/`);
        setEvaluacion(data);
        console.log("Evaluación pendiente cargada:", data);
      } catch (err) {
        console.error(err);
        addToast({
          title: "Error al cargar los datos",
          description: "No se pudo cargar la evaluación.",
          color: "danger",
          variant: "solid",
        });
        navigate("/evaluacion-jefatura");
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

  // Calcular progreso para evaluaciones pendientes
  const { areas, puntajeTotal, puntajeMaximo, porcentajeTotal } = useMemo(() => {
    if (!estructura?.areas) {
      return {
        areas: [] as AreaDetalle[],
        puntajeTotal: 0,
        puntajeMaximo: 0,
        porcentajeTotal: 0
      };
    }
  
    let totalObtenido = 0;
    let totalMaximo = 0;
  
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
          totalMaximo += maxPuntaje;
          
          // Para evaluaciones pendientes, mostrar el puntaje actual (puede ser 0)
          const puntajeResp = respuestasMap[Number(ind.id)] ?? 0;
          obtenido += puntajeResp;
          totalObtenido += puntajeResp;
  
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
  
    // ✅ USAR logro_obtenido del backend en lugar de calcular aquí
    const porcentajeGeneral = evaluacion?.logro_obtenido ?? 
      (totalMaximo > 0 ? (totalObtenido / totalMaximo) * 100 : 0);
  
    return {
      areas: areasCalculadas,
      puntajeTotal: totalObtenido,
      puntajeMaximo: totalMaximo,
      porcentajeTotal: porcentajeGeneral
    };
  }, [estructura, respuestasMap, evaluacion?.logro_obtenido]); // ✅ Agregar dependencia

  // Obtener título y datos del usuario desde la respuesta del backend
  const titulo = `${estructura?.n_tipo_evaluacion || evaluacion?.tipo_evaluacion?.n_tipo_evaluacion || "Detalle de Evaluación"} - Progreso`;
  const periodo = evaluacion?.fecha_evaluacion || 'Sin período';
  const nombreUsuario = evaluacion?.persona
    ? `${evaluacion.persona.first_name || ''} ${evaluacion.persona.last_name || ''}`.trim()
    : 'Sin usuario';
  const nombreEvaluador = evaluacion?.persona?.jefe
    ? `${evaluacion.persona.jefe || ''}`.trim()
    : 'Sin evaluador';

  const handleBack = () => {
    navigate("/evaluacion-jefatura");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Spinner size="lg" color="primary" />
          <p className="text-default-600">Cargando progreso de evaluación...</p>
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
    <EvaluacionDetalleCommon
      titulo={titulo}
      periodo={periodo}
      usuario={`Evaluado: ${nombreUsuario}  |   Evaluador: ${nombreEvaluador}`}
      areas={areas}
      puntajeTotal={puntajeTotal}
      puntajeMaximo={puntajeMaximo}
      porcentajeTotal={porcentajeTotal}
      onBack={handleBack}
      tipo="evaluacion_jefatura"
      text_destacar={evaluacion?.text_destacar}
      text_mejorar={evaluacion?.text_mejorar}
      text_retroalimentacion={evaluacion?.retroalimentacion}
      evaluacionId={id}
    />
  );
}