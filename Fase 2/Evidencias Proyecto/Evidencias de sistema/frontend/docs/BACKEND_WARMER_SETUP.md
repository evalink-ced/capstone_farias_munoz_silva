# Backend Warmer Setup - Mantener Django Caliente en Railway

Este setup mantiene tu backend Django en Railway "caliente" durante horario laboral chileno (L-V 08:00-17:30) usando Vercel Functions y cron jobs.

## 🎯 Objetivo

Railway "duerme" servicios sin tráfico saliente por ~10 minutos, causando cold starts que empeoran la experiencia de login. Este sistema:

- ✅ Mantiene el backend activo solo en horario laboral
- ✅ Maneja automáticamente cambios CLT/CLST (horario de verano/invierno)
- ✅ Minimiza costos fuera de horario
- ✅ Nunca falla el cron job (siempre responde 200)

## 📁 Estructura de Archivos

```
react-app/
├── vercel.json              # Configuración de cron job
├── api/
│   └── warm.ts             # Vercel Function para warming
└── BACKEND_WARMER_SETUP.md # Esta documentación

backend_comunidad/
├── colegio/
│   ├── urls.py             # Ruta /healthz agregada
│   └── views.py            # Vista health_check
```

## ⚙️ Variables de Entorno

### En Vercel (Frontend)

Configura en tu dashboard de Vercel:

```bash
BACKEND_HEALTH=https://tu-backend-railway.up.railway.app/healthz
```

**Ejemplo:**
```bash
BACKEND_HEALTH=https://mi-colegio-backend-production.up.railway.app/healthz
```

### En Railway (Backend)

No se requieren variables adicionales. El endpoint `/healthz` usa la configuración de base de datos existente.

## 🚀 Despliegue

### 1. Frontend (Vercel)

```bash
# En el directorio react-app
npm run build
vercel --prod
```

### 2. Backend (Railway)

El endpoint `/healthz` se despliega automáticamente con tu próximo deploy de Django.

## 🧪 Pruebas

### Probar Vercel Function manualmente

```bash
# Desarrollo local
curl http://localhost:3000/api/warm

# Producción
curl https://tu-frontend.vercel.app/api/warm
```

**Respuesta esperada (en horario laboral):**
```json
{
  "ok": true,
  "status": "healthy",
  "backendResponse": {
    "status": "ok",
    "db": true,
    "timestamp": "..."
  },
  "timestamp": "2024-01-15T14:30:00.000Z"
}
```

**Respuesta esperada (fuera de horario):**
```json
{
  "ok": true,
  "skipped": true,
  "reason": "Fuera de horario laboral (L-V 08:00-17:30 CLT/CLST)",
  "timestamp": "2024-01-15T22:30:00.000Z"
}
```

### Probar Backend Health Check

```bash
# Desarrollo local
curl http://localhost:8000/healthz

# Producción Railway
curl https://tu-backend-railway.up.railway.app/healthz
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "db": true,
  "timestamp": "192.168.1.1"
}
```

## 📊 Monitoreo

### Ver logs del cron en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Pestaña "Functions" → "warm.ts"
3. Ver "Invocations" para logs de ejecución

### Ver logs en Railway

1. Ve a tu proyecto en [Railway Dashboard](https://railway.app/dashboard)
2. Pestaña "Deployments" → "View Logs"
3. Buscar logs de `Health check successful`

## 🕐 Lógica de Horario

### ¿Por qué validación interna vs cron UTC?

**Problema:** Los cron jobs de Vercel corren en UTC. Chile cambia entre:
- **CLT (UTC-3):** Marzo - Septiembre
- **CLST (UTC-4):** Septiembre - Marzo

**Solución:** 
- Cron ejecuta cada 8 minutos en UTC
- La función valida internamente si es horario laboral en `America/Santiago`
- `Intl.DateTimeFormat` maneja automáticamente CLT/CLST

### Horario Laboral

- **Días:** Lunes a Viernes (1-5)
- **Horas:** 08:00 - 17:30 (inclusive)
- **Zona:** America/Santiago (maneja CLT/CLST automáticamente)

## 🔧 Troubleshooting

### Backend no responde

**Síntoma:** Error de timeout o conexión

```bash
# Verificar que el backend esté corriendo
curl -I https://tu-backend-railway.up.railway.app/healthz

# Verificar DNS
nslookup tu-backend-railway.up.railway.app
```

**Soluciones:**
- Verificar que Railway no haya pausado el servicio
- Revisar logs de Railway para errores
- Confirmar que la URL en `BACKEND_HEALTH` sea correcta

### Problemas de autenticación

**Síntoma:** HTTP 401/403 en `/healthz`

**Solución:** El endpoint usa `@csrf_exempt` y no requiere autenticación. Si persiste:

```python
# En colegio/views.py, agregar:
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required

# Remover @login_required si existe
```

### CORS Issues

**Síntoma:** Error CORS desde Vercel Function

**Solución:** Agregar headers CORS en Django:

```python
# En colegio/views.py
from django.http import JsonResponse

def health_check(request):
    response = JsonResponse({...})
    response['Access-Control-Allow-Origin'] = '*'
    response['Access-Control-Allow-Methods'] = 'GET'
    return response
```

### Timeout muy corto

**Síntoma:** Muchos timeouts en logs

**Solución:** Aumentar timeout en `/api/warm.ts`:

```typescript
const TIMEOUT_MS = 10000; // 10 segundos
```

### Cron no ejecuta

**Síntoma:** No hay logs en Vercel Functions

**Verificaciones:**
1. `vercel.json` está en la raíz del proyecto
2. Sintaxis del cron es correcta: `"*/8 * * * *"`
3. El proyecto está desplegado en Vercel Pro (crons requieren plan pago)

## 📈 Optimizaciones

### Ajustar frecuencia

Para cambiar la frecuencia del ping:

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/warm",
      "schedule": "*/5 * * * *"  // Cada 5 minutos
    }
  ]
}
```

### Múltiples backends

Para mantener varios backends calientes:

```typescript
// api/warm.ts
const BACKENDS = [
  process.env.BACKEND_HEALTH_1,
  process.env.BACKEND_HEALTH_2
].filter(Boolean);

// Hacer ping a todos en paralelo
const results = await Promise.allSettled(
  BACKENDS.map(url => fetchWithTimeout(url, TIMEOUT_MS))
);
```

## ✅ Checklist de Verificación

- [ ] `vercel.json` tiene configuración de cron
- [ ] `/api/warm.ts` existe y compila sin errores
- [ ] Variable `BACKEND_HEALTH` configurada en Vercel
- [ ] Endpoint `/healthz` responde correctamente
- [ ] Cron job aparece en Vercel Dashboard
- [ ] Logs muestran ejecuciones exitosas
- [ ] Backend se mantiene activo durante horario laboral
- [ ] No hay pings fuera de horario laboral

## 🎯 Racional del Diseño

### ¿Por qué este enfoque?

1. **Precisión horaria:** `Intl.DateTimeFormat` con `America/Santiago` maneja automáticamente cambios de horario
2. **Eficiencia:** Solo 8 minutos de frecuencia, validación interna evita pings innecesarios
3. **Robustez:** Nunca falla el cron (siempre 200), timeout configurable
4. **Observabilidad:** Logs detallados en ambos extremos
5. **Costo-efectivo:** Solo activo en horario laboral

### Beneficios

- ✅ **Cold start eliminado** durante horario laboral
- ✅ **Login rápido** para usuarios en horario de trabajo
- ✅ **Costo minimizado** fuera de horario
- ✅ **Mantenimiento cero** para cambios de horario
- ✅ **Monitoreo integrado** con logs de Vercel/Railway

---

**¿Preguntas?** Revisa los logs en Vercel Dashboard → Functions → warm.ts → Invocations