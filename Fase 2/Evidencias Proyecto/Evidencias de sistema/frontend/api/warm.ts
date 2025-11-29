import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Function para mantener el backend Django caliente durante horario laboral chileno
 * Se ejecuta cada 8 minutos vía cron job, pero solo hace ping en horario hábil (L-V 08:00-17:30 CLT/CLST)
 */

// Configuración
const BACKEND_HEALTH_URL = process.env.BACKEND_HEALTH;
const TIMEOUT_MS = 6000; // 6 segundos

/**
 * Verifica si la hora actual en Chile corresponde a horario laboral
 * @returns true si es día hábil (L-V) entre 08:00 y 17:30 (inclusive)
 */
function isWorkWindowSCL(): boolean {
  try {
    // Obtener fecha/hora actual en zona horaria de Chile
    const now = new Date();
    const chileTime = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Santiago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(now);

    // Construir objeto Date en zona horaria de Chile
    const year = parseInt(chileTime.find(part => part.type === 'year')?.value || '0');
    const month = parseInt(chileTime.find(part => part.type === 'month')?.value || '0') - 1; // Month is 0-indexed
    const day = parseInt(chileTime.find(part => part.type === 'day')?.value || '0');
    const hour = parseInt(chileTime.find(part => part.type === 'hour')?.value || '0');
    const minute = parseInt(chileTime.find(part => part.type === 'minute')?.value || '0');

    const chileDate = new Date(year, month, day, hour, minute);
    const dayOfWeek = chileDate.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    
    // Verificar si es día hábil (lunes=1 a viernes=5)
    if (dayOfWeek < 1 || dayOfWeek > 5) {
      return false;
    }

    // Verificar si está en horario laboral (08:00 - 17:30)
    const currentMinutes = hour * 60 + minute;
    const startMinutes = 8 * 60; // 08:00
    const endMinutes = 17 * 60 + 30; // 17:30

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } catch (error) {
    console.error('Error calculating Chile time:', error);
    return false; // En caso de error, no hacer ping
  }
}

/**
 * Realiza fetch con timeout usando AbortController
 * @param url URL a consultar
 * @param timeoutMs Timeout en milisegundos
 * @returns Promise con la respuesta
 */
async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Vercel-Warmer/1.0',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      },
      signal: controller.signal,
      cache: 'no-store'
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Handler principal de la Vercel Function
 */
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const timestamp = new Date().toISOString();
  
  try {
    
    // Verificar que la URL del backend esté configurada
    if (!BACKEND_HEALTH_URL) {
      console.error(`[${timestamp}] BACKEND_HEALTH_URL no está configurada`);
      return res.status(500).json({
        ok: false,
        status: 'error',
        reason: 'BACKEND_HEALTH_URL no está configurada',
        timestamp
      });
    }
    
    // Verificar si estamos en horario laboral chileno
    if (!isWorkWindowSCL()) {
      console.log(`[${timestamp}] Fuera de horario laboral, omitiendo ping`);
      return res.status(200).json({
        ok: true,
        status: 'skipped',
        reason: 'Fuera de horario laboral (L-V 08:00-17:30 CLT/CLST)',
        timestamp
      });
    }

    console.log(`[${timestamp}] Iniciando ping al backend: ${BACKEND_HEALTH_URL}`);

    // Realizar ping al backend con timeout
    const response = await fetchWithTimeout(BACKEND_HEALTH_URL, TIMEOUT_MS);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`[${timestamp}] Backend respondió OK:`, data);
      
      return res.status(200).json({
        ok: true,
        status: 'healthy',
        backendResponse: data,
        timestamp
      });
    } else {
      console.warn(`[${timestamp}] Backend respondió con error HTTP ${response.status}`);
      
      return res.status(200).json({
        ok: false,
        status: 'unhealthy',
        error: `HTTP ${response.status}: ${response.statusText}`,
        timestamp
      });
    }
  } catch (error: any) {
    const errorMessage = error.name === 'AbortError' 
      ? 'Timeout - backend no respondió en 6 segundos'
      : error.message || 'Error desconocido';
    
    console.error(`[${timestamp}] Error al hacer ping al backend:`, errorMessage);
    
    // Nunca fallar el cron - siempre responder 200 para logging
    return res.status(200).json({
      ok: false,
      error: errorMessage,
      timestamp
    });
  }
}

/**
 * Función auxiliar para testing manual
 * Exporta la lógica de validación horaria para pruebas
 */
export { isWorkWindowSCL };