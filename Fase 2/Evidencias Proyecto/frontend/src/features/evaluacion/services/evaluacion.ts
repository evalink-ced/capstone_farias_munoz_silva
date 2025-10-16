import axios from "@/services/google/axiosInstance";
import { AccionEvaluacion, RespuestaAccion, EvaluacionJefe } from "@/features/evaluacion/types/evaluacion";

export async function fetchSubordinados() {
  const res = await axios.get("/evaluacion/api/subordinados/");

  return res.data;
}

// Nuevas funciones para el flujo de estados
export async function marcarReunionRealizada(
  evaluacionId: number,
  fechaReunion: string
): Promise<RespuestaAccion> {
  try {
    const response = await axios.post(
      `/evaluacion/api/evaluaciones-jefe/${evaluacionId}/marcar_reunion_realizada/`,
      { fecha_reunion: fechaReunion }
    );
    return {
      success: true,
      message: "Reunión marcada como realizada exitosamente",
      evaluacion: response.data
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || "Error al marcar reunión como realizada"
    };
  }
}

export async function completarRetroalimentacion(
  evaluacionId: number,
  retroalimentacion: string
): Promise<RespuestaAccion> {
  try {
    const response = await axios.post(
      `/evaluacion/api/evaluaciones-jefe/${evaluacionId}/completar_retroalimentacion/`,
      { retroalimentacion }
    );
    return {
      success: true,
      message: "Retroalimentación completada exitosamente",
      evaluacion: response.data
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || "Error al completar retroalimentación"
    };
  }
}

export async function cerrarParaFirma(
  evaluacionId: number
): Promise<RespuestaAccion> {
  try {
    const response = await axios.post(
      `/evaluacion/api/evaluaciones-jefe/${evaluacionId}/cerrar_para_firma/`
    );
    return {
      success: true,
      message: "Evaluación cerrada para firma exitosamente",
      evaluacion: response.data
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || "Error al cerrar para firma"
    };
  }
}

// Nueva función unificada que completa retroalimentación y cierra para firma
export async function completarRetroalimentacionYCerrar(
  evaluacionId: number,
  retroalimentacion: string
): Promise<RespuestaAccion> {
  try {
    // Paso 1: Completar retroalimentación
    const responseRetro = await completarRetroalimentacion(evaluacionId, retroalimentacion);
    
    if (!responseRetro.success) {
      return responseRetro;
    }

    // Paso 2: Cerrar para firma automáticamente
    const responseFirma = await cerrarParaFirma(evaluacionId);
    
    if (responseFirma.success) {
      return {
        success: true,
        message: "Retroalimentación completada y evaluación cerrada para firma exitosamente",
        evaluacion: responseFirma.evaluacion
      };
    } else {
      return {
        success: false,
        message: `Retroalimentación completada, pero error al cerrar para firma: ${responseFirma.message}`
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || "Error al completar el proceso"
    };
  }
}

export async function obtenerEvaluacionJefe(
  evaluacionId: number
): Promise<EvaluacionJefe | null> {
  try {
    const response = await axios.get(
      `/evaluacion/api/evaluaciones-jefe/${evaluacionId}/`
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener evaluación de jefe:", error);
    return null;
  }
}

export async function obtenerEvaluacionesJefe(): Promise<EvaluacionJefe[]> {
  try {
    const response = await axios.get("/evaluacion/api/evaluaciones-jefe/");
    return response.data;
  } catch (error) {
    console.error("Error al obtener evaluaciones de jefe:", error);
    return [];
  }
}

export async function obtenerMisEvaluacionesJefatura(): Promise<EvaluacionJefe[]> {
  try {
    const response = await axios.get("/evaluacion/api/mis-evaluaciones/");
    return response.data;
  } catch (error) {
    console.error("Error al obtener mis evaluaciones de jefatura:", error);
    return [];
  }
}

// Función para firmar evaluación
export async function firmarEvaluacion(
  evaluacionId: number
): Promise<RespuestaAccion> {
  try {
    const response = await axios.patch(
      `/evaluacion/api/evaluaciones-jefe/${evaluacionId}/`,
      { firmado: true }
    );
    return {
      success: true,
      message: "Evaluación firmada exitosamente",
      evaluacion: response.data
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || "Error al firmar evaluación"
    };
  }
}

// Función para firmar evaluación con observaciones (anteriormente denegar)
export async function firmarEvaluacionConObservaciones(
  evaluacionId: number,
  motivoDenegacion: string
): Promise<RespuestaAccion> {
  try {
    const response = await axios.post(
      `/evaluacion/api/evaluaciones-jefe/${evaluacionId}/firmar_obs/`,
      { motivo_denegacion: motivoDenegacion }
    );
    return {
      success: true,
      message: "Evaluación firmada con observación exitosamente",
      evaluacion: response.data
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || "Error al firmar evaluación con observaciones"
    };
  }
}

// Función genérica para ejecutar acciones del flujo
export async function ejecutarAccionEvaluacion(
  accion: AccionEvaluacion
): Promise<RespuestaAccion> {
  switch (accion.tipo) {
    case 'marcar_reunion':
      return marcarReunionRealizada(
        accion.evaluacion_id,
        accion.datos?.fecha_reunion || new Date().toISOString().split('T')[0]
      );
    
    case 'completar_retroalimentacion':
      return completarRetroalimentacion(
        accion.evaluacion_id,
        accion.datos?.retroalimentacion || ''
      );
    
    case 'cerrar_para_firma':
      return cerrarParaFirma(accion.evaluacion_id);
    
    case 'firmar':
      return firmarEvaluacion(accion.evaluacion_id);
    
    case 'firmar_obs':
      return firmarEvaluacionConObservaciones(
        accion.evaluacion_id,
        accion.datos?.motivo_denegacion || ''
      );
    
    default:
      return {
        success: false,
        message: `Acción no reconocida: ${accion.tipo}`
      };
  }
}

// Funciones para descarga de PDF
export async function descargarPDFEvaluacionJefe(
  evaluacionId: number
): Promise<void> {
  try {
    const response = await axios.get(
      `/evaluacion/api/evaluaciones-jefe/${evaluacionId}/generar_pdf/`,
      {
        responseType: 'blob',
      }
    );

    // Crear un blob URL y descargar el archivo
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `evaluacion_jefe_${evaluacionId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Error al descargar el PDF de evaluación de jefatura");
  }
}

export async function descargarPDFAutoevaluacion(
  evaluacionId: number
): Promise<void> {
  try {
    const response = await axios.get(
      `/evaluacion/api/autoevaluaciones/${evaluacionId}/generar_pdf/`,
      {
        responseType: 'blob',
      }
    );

    // Crear un blob URL y descargar el archivo
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `autoevaluacion_${evaluacionId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Error al descargar el PDF de autoevaluación");
  }
}

export async function descargarPDFMisEvaluaciones(
  evaluacionId: number
): Promise<void> {
  try {
    const response = await axios.get(
      `/evaluacion/api/mis-evaluaciones/${evaluacionId}/generar_pdf/`,
      {
        responseType: 'blob',
      }
    );

    // Crear un blob URL y descargar el archivo
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mi_evaluacion_${evaluacionId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Error al descargar el PDF de mi evaluación");
  }
}
