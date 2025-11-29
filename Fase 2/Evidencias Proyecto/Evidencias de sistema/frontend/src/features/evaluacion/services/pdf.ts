import axios from "@/services/google/axiosInstance";

type MaybeId = number | string | undefined | null;

export const API_BASE = "/evaluacion/api";

export function getGenerarPdfUrl(
  evaluacion: any,
  currentUserId?: MaybeId,
  apiBase: string = API_BASE,
): string | null {
  const id: MaybeId = evaluacion?.id ?? evaluacion?.evaluacion_id;

  if (!id) return null;

  const evaluadorId: MaybeId =
    evaluacion?.evaluador?.id ?? evaluacion?.evaluador_id;
  const personaId: MaybeId = evaluacion?.persona?.id ?? evaluacion?.persona_id;

  if (currentUserId != null) {
    if (String(evaluadorId) === String(currentUserId)) {
      return `${apiBase}/evaluaciones-jefe/${id}/generar_pdf/`;
    }
    if (String(personaId) === String(currentUserId)) {
      // ✅ CORREGIDO: Apuntar al endpoint de autoevaluaciones
      return `${apiBase}/autoevaluaciones/${id}/generar_pdf/`;
    }
  }

  return null;
}

function buildUrls(
  id: number,
  prefer?: "jefe" | "mis",
): { primary: string; fallback: string } {
  const jefe = `${API_BASE}/evaluaciones-jefe/${id}/generar_pdf/`;
  // ✅ CORREGIDO: Endpoint correcto para autoevaluaciones
  const mis = `${API_BASE}/autoevaluaciones/${id}/generar_pdf/`;

  if (prefer === "mis") return { primary: mis, fallback: jefe };
  if (prefer === "jefe") return { primary: jefe, fallback: mis };

  return { primary: jefe, fallback: mis };
}

export async function fetchPdf(url: string, filename: string): Promise<void> {
  const response = await axios.get(url, { responseType: "blob" });
  const blob = new Blob([response.data], { type: "application/pdf" });
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}

export async function descargarPDFInteligente(options: {
  evaluacionId: number;
  evaluacion?: any | null;
  currentUserId?: MaybeId;
  prefer?: "jefe" | "mis";
}): Promise<{ used: "jefe" | "mis" } | never> {
  const { evaluacionId, evaluacion, currentUserId, prefer } = options;

  // Si se prefiere explícitamente "mis", intentamos forzar esa ruta primero
  // independientemente de lo que diga el objeto evaluacion (que a veces es incompleto)
  let hinted = null;
  
  if (prefer === "mis") {
     hinted = `${API_BASE}/autoevaluaciones/${evaluacionId}/generar_pdf/`;
  } else if (evaluacion) {
     hinted = getGenerarPdfUrl(evaluacion, currentUserId);
  }

  const urls = hinted
    ? {
        primary: hinted,
        fallback: hinted.includes("evaluaciones-jefe")
          ? `${API_BASE}/autoevaluaciones/${evaluacionId}/generar_pdf/`
          : `${API_BASE}/evaluaciones-jefe/${evaluacionId}/generar_pdf/`,
      }
    : buildUrls(evaluacionId, prefer);

  try {
    // Detectar qué tipo se usó basado en la URL
    const used = urls.primary.includes("autoevaluaciones") ? "mis" : "jefe";

    await fetchPdf(
      urls.primary,
      `${used === "jefe" ? "evaluacion_jefe" : "mi_autoevaluacion"}_${evaluacionId}.pdf`,
    );

    return { used };
  } catch (error: any) {
    const status = error?.response?.status;

    // Si falla (ej: 404), intentar con la URL de respaldo
    if (status === 404 && urls.fallback) {
      const used = urls.fallback.includes("autoevaluaciones") ? "mis" : "jefe";

      await fetchPdf(
        urls.fallback,
        `${used === "jefe" ? "evaluacion_jefe" : "mi_autoevaluacion"}_${evaluacionId}.pdf`,
      );

      return { used };
    }
    throw error;
  }
}