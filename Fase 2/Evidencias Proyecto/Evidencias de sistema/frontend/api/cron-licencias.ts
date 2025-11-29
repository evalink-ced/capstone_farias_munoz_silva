import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://backendcomunidad-production.up.railway.app';
const CRON_TOKEN = process.env.CRON_TOKEN;
const TIMEOUT_MS = 25000; // 25 segundos para dar tiempo al envío de correos

/**
 * Función para realizar fetch con timeout
 */
async function fetchWithTimeout(url: string, timeoutMs: number, options: RequestInit = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Vercel Cron Function para envío de licencias
 * Se ejecuta en horarios programados para enviar correos de licencias
 */
export default async function handler(req: NextRequest) {
  const timestamp = new Date().toISOString();
  
  // Validar que sea una request POST (requerido por Vercel Cron)
  if (req.method !== 'POST') {
    console.log(`[${timestamp}] ❌ Método no permitido: ${req.method}`);
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  }

  // Validar token de autorización de Vercel Cron
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.log(`[${timestamp}] ❌ Token de autorización inválido`);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Validar que CRON_TOKEN esté configurado
  if (!CRON_TOKEN) {
    console.log(`[${timestamp}] ❌ CRON_TOKEN no configurado`);
    return NextResponse.json(
      { error: 'CRON_TOKEN not configured' },
      { status: 500 }
    );
  }

  try {
    console.log(`[${timestamp}] 🚀 Iniciando envío de correos de licencias`);
    
    const backendUrl = `${BACKEND_URL}/licencia/internal/cron/enviar_correos/`;
    
    const response = await fetchWithTimeout(backendUrl, TIMEOUT_MS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CRON-TOKEN': CRON_TOKEN,
      },
    });

    const responseData = await response.json();
    
    if (response.ok) {
      console.log(`[${timestamp}] ✅ Correos enviados exitosamente:`, responseData);
      return NextResponse.json({
        success: true,
        timestamp,
        backend_response: responseData,
        message: 'Correos de licencias enviados correctamente'
      });
    } else {
      console.log(`[${timestamp}] ⚠️ Backend respondió con error:`, responseData);
      return NextResponse.json({
        success: true, // Siempre retornamos success para que Vercel no reintente
        timestamp,
        backend_response: responseData,
        message: 'Backend procesó la solicitud con advertencias'
      });
    }
    
  } catch (error) {
    console.error(`[${timestamp}] ❌ Error al enviar correos:`, error);
    
    // Siempre retornamos 200 para evitar reintentos de Vercel
    return NextResponse.json({
      success: true,
      timestamp,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Error procesado, no se reintentará'
    });
  }
}

// Configuración para Vercel
export const config = {
  runtime: 'edge',
};