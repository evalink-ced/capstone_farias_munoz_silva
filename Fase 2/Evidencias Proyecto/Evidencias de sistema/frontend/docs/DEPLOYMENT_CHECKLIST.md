# 📋 Checklist de Despliegue - Backend Warmer

## ✅ Pre-requisitos

- [ ] **Vercel Account:** Cuenta con plan Pro (requerido para cron jobs)
- [ ] **Railway Account:** Backend Django desplegado y funcionando
- [ ] **Node.js:** Versión 18+ instalada localmente

## 🔧 Configuración Local

### Frontend (React + Vite)

- [ ] **Dependencias instaladas:**
  ```bash
  npm install @vercel/node
  ```

- [ ] **Archivos creados:**
  - [ ] `vercel.json` - Configuración de cron
  - [ ] `api/warm.ts` - Vercel Function
  - [ ] `.env.example` - Template de variables
  - [ ] `test-warmer.js` - Script de prueba

- [ ] **Variables de entorno locales:**
  ```bash
  # Crear .env.local
  BACKEND_HEALTH=http://localhost:8000/healthz
  ```

### Backend (Django)

- [ ] **Archivos modificados/creados:**
  - [ ] `colegio/urls.py` - Ruta `/healthz` agregada
  - [ ] `colegio/views.py` - Vista `health_check` creada

- [ ] **Endpoint funcional:**
  ```bash
  curl http://localhost:8000/healthz
  # Debe responder: {"status": "ok", "db": true, ...}
  ```

## 🧪 Pruebas Locales

### 1. Probar Backend Health Check

```bash
# Iniciar Django localmente
cd backend_comunidad
python manage.py runserver

# En otra terminal, probar endpoint
curl http://localhost:8000/healthz
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "db": true,
  "timestamp": "..."
}
```

- [ ] ✅ Endpoint responde HTTP 200
- [ ] ✅ JSON válido retornado
- [ ] ✅ Campo `db: true` presente

### 2. Probar Vercel Function Localmente

```bash
# Iniciar Vercel dev server
cd react-app
npm run dev
# o
vercel dev

# En otra terminal, probar función
curl http://localhost:3000/api/warm
```

**Respuesta esperada (en horario laboral):**
```json
{
  "ok": true,
  "status": "healthy",
  "backendResponse": {...},
  "timestamp": "..."
}
```

**Respuesta esperada (fuera de horario):**
```json
{
  "ok": true,
  "skipped": true,
  "reason": "Fuera de horario laboral...",
  "timestamp": "..."
}
```

- [ ] ✅ Función responde HTTP 200
- [ ] ✅ Lógica de horario funciona correctamente
- [ ] ✅ Timeout y error handling funcionan

### 3. Script de Prueba Automatizado

```bash
# Ejecutar script de prueba
node test-warmer.js
```

- [ ] ✅ Backend health check pasa
- [ ] ✅ Vercel function pasa
- [ ] ✅ Información de horario es correcta

## 🚀 Despliegue a Producción

### 1. Backend (Railway)

```bash
# Desde backend_comunidad/
git add .
git commit -m "Add health check endpoint for warmer"
git push origin main
```

- [ ] ✅ Código desplegado en Railway
- [ ] ✅ Endpoint `/healthz` accesible públicamente
- [ ] ✅ URL de Railway anotada: `https://______.up.railway.app`

### 2. Frontend (Vercel)

#### Configurar Variables de Entorno

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Settings → Environment Variables
4. Agregar:

```
BACKEND_HEALTH=https://tu-backend-railway.up.railway.app/healthz
```

- [ ] ✅ Variable `BACKEND_HEALTH` configurada
- [ ] ✅ URL apunta a Railway (no localhost)

#### Desplegar

```bash
# Desde react-app/
npm run build
vercel --prod
```

- [ ] ✅ Build exitoso
- [ ] ✅ Despliegue completado
- [ ] ✅ URL de Vercel anotada: `https://______.vercel.app`

## 🔍 Verificación Post-Despliegue

### 1. Probar Endpoints en Producción

```bash
# Probar backend en Railway
curl https://tu-backend-railway.up.railway.app/healthz

# Probar Vercel Function
curl https://tu-frontend.vercel.app/api/warm
```

- [ ] ✅ Backend health check funciona en Railway
- [ ] ✅ Vercel Function funciona en producción
- [ ] ✅ Comunicación entre Vercel y Railway exitosa

### 2. Verificar Cron Job

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Tu proyecto → Functions → `warm.ts`
3. Pestaña "Invocations"

- [ ] ✅ Cron job aparece en dashboard
- [ ] ✅ Ejecuciones cada 8 minutos
- [ ] ✅ Logs muestran ejecuciones exitosas

### 3. Monitoreo (Primeras 24 horas)

#### En Vercel:
- [ ] ✅ Logs muestran pings durante horario laboral (08:00-17:30 CLT)
- [ ] ✅ Logs muestran "skipped" fuera de horario
- [ ] ✅ No hay errores de timeout o conexión

#### En Railway:
- [ ] ✅ Logs muestran requests a `/healthz`
- [ ] ✅ Servicio se mantiene activo durante horario laboral
- [ ] ✅ No hay cold starts durante horario de trabajo

## 🚨 Troubleshooting

### Problemas Comunes

#### Cron no ejecuta
- [ ] Verificar plan Vercel Pro activo
- [ ] Verificar sintaxis en `vercel.json`
- [ ] Re-desplegar proyecto

#### Backend no responde
- [ ] Verificar URL en `BACKEND_HEALTH`
- [ ] Verificar que Railway no esté pausado
- [ ] Revisar logs de Railway

#### Timeout errors
- [ ] Aumentar `TIMEOUT_MS` en `warm.ts`
- [ ] Verificar latencia Railway → Vercel

#### Horario incorrecto
- [ ] Verificar zona horaria `America/Santiago`
- [ ] Probar con `node test-warmer.js`
- [ ] Verificar cambio CLT/CLST

## 📊 Métricas de Éxito

### Semana 1
- [ ] ✅ 0 cold starts durante horario laboral
- [ ] ✅ Login < 2 segundos en horario de trabajo
- [ ] ✅ ~180 pings exitosos por día hábil (8 min × 9.5 hrs)
- [ ] ✅ 0 pings fuera de horario laboral

### Mensual
- [ ] ✅ 99%+ uptime durante horario laboral
- [ ] ✅ Costo Vercel Functions < $5/mes
- [ ] ✅ Railway no reporta cold starts en horario

## 🎯 Optimizaciones Futuras

- [ ] **Alertas:** Configurar notificaciones si health check falla
- [ ] **Métricas:** Dashboard con estadísticas de uptime
- [ ] **Multi-región:** Considerar múltiples backends
- [ ] **Frecuencia dinámica:** Ajustar según carga de trabajo

---

## ✅ Checklist Final

**Antes de marcar como completo, verificar:**

- [ ] ✅ Todos los archivos creados y desplegados
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Pruebas locales exitosas
- [ ] ✅ Despliegue en producción exitoso
- [ ] ✅ Cron job ejecutándose correctamente
- [ ] ✅ Logs muestran comportamiento esperado
- [ ] ✅ Backend se mantiene caliente en horario laboral
- [ ] ✅ No hay pings fuera de horario

**🎉 ¡Backend Warmer configurado exitosamente!**

---

**Contacto:** Si hay problemas, revisar logs en:
- Vercel: Dashboard → Functions → warm.ts → Invocations
- Railway: Dashboard → Deployments → View Logs