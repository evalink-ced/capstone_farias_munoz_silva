// features/evaluacion/hooks/useEvaluacionesJefaturaDual.ts
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import axios from "@/services/google/axiosInstance";
import { addToast } from "@heroui/toast";
import type { Evaluacion } from "@/features/evaluacion/types/evaluacion";

type QueryFlags = { 
  firmado?: boolean; 
  completado?: boolean; 
  estado_firma?: 'pendiente' | 'firmado' | 'denegado';
  denegado?: boolean;
};
type Options = {
  basePath?: string;               // default: /evaluacion/api/mis-evaluaciones/
  porFirmar?: QueryFlags;          // default: { firmado:false, completado:true }
  finalizadas?: QueryFlags;        // default: { firmado:true,  completado:true }
  debug?: boolean;
};

function normalize(payload: any): Evaluacion[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.items)) return payload.items;
  if (typeof payload === "object") return [payload] as any;
  return [];
}

function applyFlags(list: Evaluacion[], flags: QueryFlags): Evaluacion[] {
  return (list ?? []).filter((e: any) => {
    // Verificar firmado
    if (typeof flags.firmado === "boolean" && typeof e.firmado === "boolean") {
      if (e.firmado !== flags.firmado) return false;
    }
    
    // Verificar completado
    if (typeof flags.completado === "boolean" && typeof e.completado === "boolean") {
      if (e.completado !== flags.completado) return false;
    }
    
    // Verificar estado_firma (nuevo campo)
    if (flags.estado_firma && e.estado_firma) {
      if (e.estado_firma !== flags.estado_firma) return false;
    }
    
    // Verificar denegado
    if (typeof flags.denegado === "boolean" && typeof e.denegado === "boolean") {
      if (e.denegado !== flags.denegado) return false;
    }
    
    return true;
  });
}

export function useEvaluacionesJefaturaDual(opts?: Options) {
  const basePath = opts?.basePath ?? "/evaluacion/api/mis-evaluaciones/";
  const porFirmarFlags   = opts?.porFirmar   ?? { firmado: false, completado: true, estado_firma: 'pendiente' };
  const finalizadasFlags = opts?.finalizadas ?? { firmado: true,  completado: true, estado_firma: 'firmado' };
  const debug = !!opts?.debug;

  const [all, setAll] = useState<Evaluacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoadingUI, setShowLoadingUI] = useState(false);

  // ↓ Guards anti StrictMode
  const hasFetchedRef = useRef(false);
  const mountedRef = useRef(false);

  const fetchOnce = useCallback(async () => {
    if (hasFetchedRef.current) {
      if (debug) console.info("[JefaturaDual] fetch omitido (misma key)");
      return;
    }
    hasFetchedRef.current = true;

    setLoading(true);
    setError(null);
    const t = window.setTimeout(() => setShowLoadingUI(true), 180);

    const t0 = performance.now();
    try {
      const res = await axios.get(basePath); // ← sin AbortController
      const raw = normalize(res.data);
      if (!mountedRef.current) return;      // ← evita setState tras unmount
      setAll(raw);

      if (debug) {
        console.groupCollapsed("%c[JefaturaDual] fetch OK", "color:#16a34a;font-weight:bold;");
        console.log("GET:", res?.request?.responseURL ?? basePath);
        console.log("status:", res.status);
        console.log("total:", raw.length, "sample:", raw.slice(0, 2));
        console.log(`took ${(performance.now() - t0).toFixed(1)} ms`);
        console.groupEnd();
      }
    } catch (err: any) {
      if (!mountedRef.current) return;      // silencio si ya se desmontó
      console.error("Error mis-evaluaciones:", err);
      setError("Error al cargar tus evaluaciones");
      addToast({
        title: "No se pudo cargar",
        description: "Intenta nuevamente en unos minutos.",
        color: "danger",
        variant: "solid",
      });
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        window.setTimeout(() => setShowLoadingUI(false), 120);
      }
      clearTimeout(t);
    }
  }, [basePath, debug]);

  useEffect(() => {
    mountedRef.current = true;
    fetchOnce();                 // ← dispara 1 sola vez
    return () => { mountedRef.current = false; }; // ← sin abort()
  }, [fetchOnce]);

  const porFirmar   = useMemo(() => applyFlags(all, porFirmarFlags), [all, porFirmarFlags]);
  const finalizadas = useMemo(() => applyFlags(all, finalizadasFlags), [all, finalizadasFlags]);
  
  // Agregar filtro para evaluaciones denegadas
  const denegadas = useMemo(() => applyFlags(all, { estado_firma: 'denegado', denegado: true }), [all]);

  const refresh = useCallback(() => {
    // permite recargar manualmente
    hasFetchedRef.current = false;
    return fetchOnce();
  }, [fetchOnce]);

  return { porFirmar, finalizadas, denegadas, loading, error, showLoadingUI, refresh } as const;
}
