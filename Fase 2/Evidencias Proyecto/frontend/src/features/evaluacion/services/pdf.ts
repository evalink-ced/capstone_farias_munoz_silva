import axios from "@/services/google/axiosInstance";

type MaybeId = number | string | undefined | null;

export const API_BASE = "/evaluacion/api";

export function getGenerarPdfUrl(
  evaluacion: any,
  currentUserId?: MaybeId,
  apiBase: string = API_BASE
): string | null {
  const id: MaybeId = evaluacion?.id ?? evaluacion?.evaluacion_id;
  if (!id) return null;

  const evaluadorId: MaybeId = evaluacion?.evaluador?.id ?? evaluacion?.evaluador_id;
  const personaId: MaybeId = evaluacion?.persona?.id ?? evaluacion?.persona_id;

  if (currentUserId != null) {
    if (String(evaluadorId) === String(currentUserId)) {
      return `${apiBase}/evaluaciones-jefe/${id}/generar_pdf/`;
    }
    if (String(personaId) === String(currentUserId)) {
      return `${apiBase}/mis-evaluaciones/${id}/generar_pdf/`;
    }
  }

  return null;
}

function buildUrls(
  id: number,
  prefer?: "jefe" | "mis"
): { primary: string; fallback: string } {
  const jefe = `${API_BASE}/evaluaciones-jefe/${id}/generar_pdf/`;
  const mis = `${API_BASE}/mis-evaluaciones/${id}/generar_pdf/`;
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

  const hinted = evaluacion ? getGenerarPdfUrl(evaluacion, currentUserId) : null;
  const urls = hinted
    ? { primary: hinted, fallback: hinted.includes("evaluaciones-jefe") ? `${API_BASE}/mis-evaluaciones/${evaluacionId}/generar_pdf/` : `${API_BASE}/evaluaciones-jefe/${evaluacionId}/generar_pdf/` }
    : buildUrls(evaluacionId, prefer);

  try {
    const used = urls.primary.includes("mis-evaluaciones") ? "mis" : "jefe";
    await fetchPdf(urls.primary, `${used === "jefe" ? "evaluacion_jefe" : "mi_evaluacion"}_${evaluacionId}.pdf`);
    return { used };
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 404 && urls.fallback) {
      const used = urls.fallback.includes("mis-evaluaciones") ? "mis" : "jefe";
      await fetchPdf(urls.fallback, `${used === "jefe" ? "evaluacion_jefe" : "mi_evaluacion"}_${evaluacionId}.pdf`);
      return { used };
    }
    throw error;
  }
}

