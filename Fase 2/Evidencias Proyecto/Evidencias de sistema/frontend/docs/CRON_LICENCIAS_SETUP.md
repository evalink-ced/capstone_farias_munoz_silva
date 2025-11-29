# 📧 Setup Cron de Licencias en Vercel

## 🎯 Objetivo

Automatizar el envío de correos de licencias usando Vercel Cron en lugar de GitHub Actions, con mejor manejo de horarios chilenos.

## 🏗️ Arquitectura

```
Vercel Cron → /api/cron-licencias → Backend Django → Envío de correos
```

## ⚙️ Configuración

### 1. Variables de Entorno en Vercel

```bash
# En Vercel Dashboard → Settings → Environment Variables
CRON_TOKEN=tu-token-secreto-para-backend
CRON_SECRET=vercel-cron-secret-token
BACKEND_URL=https://backendcomunidad-production.up.railway.app
```

### 2. Variables de Entorno en Railway (Backend)

```bash
# En Railway Dashboard → Variables
CRON_TOKEN=tu-token-secreto-para-backend  # Debe coincidir con Vercel
```

## 📅 Horarios Programados

### Configuración Actual
- **Horarios**: 
  - `30 12 * * 1-5` → 12:30 PM UTC
  - `20 18 * * 1-5` → 6:20 PM UTC  
  - `20 21 * * 1-5` → 9:20 PM UTC
- **Hora Chile (UTC-4 invierno)**:
  - **08:30 AM** → Envío matutino
  - **14:20 PM** → Envío de medio día
  - **17:20 PM** → Envío vespertino
- **Hora Chile (UTC-3 verano)**:
  - **09:30 AM** → Envío matutino
  - **15:20 PM** → Envío de medio día
  - **18:20 PM** → Envío vespertino

### ¿Por qué estos horarios?
- **Matutino**: Recordatorios de licencias del día
- **Medio día**: Notificaciones de seguimiento
- **Vespertino**: Recordatorios de cierre del día
- **Solo días hábiles**: El backend valida automáticamente

## 🔧 Archivos Creados

### `/api/cron-licencias.ts`
- Endpoint de Vercel que recibe el cron
- Valida autenticación y tokens
- Llama al backend Django
- Maneja errores y timeouts

### `vercel.json` (actualizado)
```json
{
  "crons": [
    {
      "path": "/api/warm",
      "schedule": "*/8 * * * *"
    },
    {
      "path": "/api/cron-licencias",
      "schedule": "0 12,17 * * 1-5"
    }
  ]
}
```

## 🧪 Testing

### Prueba Local
```bash
# En react-app/
node test-cron-licencias.cjs
```

### Prueba en Producción
```bash
curl -X POST https://tu-app.vercel.app/api/cron-licencias \
  -H "Authorization: Bearer vercel-cron-secret-token" \
  -H "Content-Type: application/json"
```

## 📊 Monitoreo

### Logs en Vercel
1. Ve a Vercel Dashboard
2. Functions → cron-licencias
3. Revisa logs de ejecución

### Logs en Railway
1. Ve a Railway Dashboard
2. Revisa logs del backend
3. Busca mensajes con `[Cron]` o `enviar_correos`

## 🔍 Troubleshooting

### Error: "CRON_TOKEN not configured"
- Verifica que `CRON_TOKEN` esté configurado en Vercel
- Debe coincidir con el token en Railway

### Error: "Unauthorized"
- Verifica que `CRON_SECRET` esté configurado en Vercel
- El header Authorization debe ser `Bearer {CRON_SECRET}`

### Error: "Backend timeout"
- El backend puede estar tardando más de 25 segundos
- Revisa logs de Railway para errores en Django

### No se envían correos
- Verifica que sea día hábil en Chile
- El backend valida automáticamente días hábiles
- Revisa logs del comando `enviar_correos`

## 🚀 Despliegue

### Pasos para Activar

1. **Configurar variables de entorno** en Vercel y Railway
2. **Desplegar** el código actualizado
3. **Probar** con el script de prueba
4. **Monitorear** los primeros envíos
5. ✅ **GitHub Actions eliminado** (completado)

### Rollback Plan

Si algo falla:
1. Eliminar el cron de `vercel.json`
2. ⚠️ **GitHub Actions eliminado** - necesitaría recrear `.github/workflows/cron.yml`
3. Investigar logs y corregir
4. Como alternativa: usar comando Django manual `python manage.py enviar_correos`

## 📈 Ventajas vs GitHub Actions

✅ **Mejor manejo de horarios**: UTC con validación en backend
✅ **Más simple**: No necesita repositorio separado
✅ **Logs integrados**: Directamente en Vercel Dashboard
✅ **Más confiable**: Infraestructura de Vercel
✅ **Costo incluido**: Sin costo adicional

## ✅ Migración Completada desde GitHub Actions

**Estado**: ✅ **COMPLETADO**

### Pasos Realizados:
1. ✅ **Creado** sistema Vercel Cron funcional
2. ✅ **Probado** localmente con éxito
3. ✅ **Eliminado** archivo `.github/workflows/cron.yml`
4. ✅ **Removido** directorio `.github` completo

### Configuración Anterior (GitHub Actions):
- **Horarios**: 08:30, 14:20, 17:20 CLT
- **Frecuencia**: 3 veces al día, días hábiles
- **Endpoint**: `https://back.gsr.cat/licencia/internal/cron/enviar_correos/`

### Nueva Configuración (Vercel Cron):
- **Horarios**: 12:30, 18:20, 21:20 UTC (equivalente a horarios chilenos)
- **Frecuencia**: 3 veces al día, días hábiles (igual que GitHub Actions)
- **Endpoint**: Mismo backend, pero a través de `/api/cron-licencias`

---

**¿Preguntas?** Revisa los logs en Vercel Dashboard → Functions → cron-licencias