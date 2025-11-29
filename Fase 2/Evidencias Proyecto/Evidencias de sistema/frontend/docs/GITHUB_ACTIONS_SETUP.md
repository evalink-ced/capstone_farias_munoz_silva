# Migración de Vercel Cron Jobs a GitHub Actions

Este documento describe la migración de los cron jobs de Vercel a GitHub Actions.

## Cambios Realizados

### 1. Eliminación de vercel.json
- Se eliminó el archivo `vercel.json` que contenía la configuración de cron jobs de Vercel
- Los rewrites para SPA ahora se manejan directamente en la configuración del hosting

### 2. Creación de GitHub Actions Workflow
- Se creó `.github/workflows/cron-jobs.yml` para reemplazar los cron jobs
- Los horarios se ajustaron a UTC considerando la zona horaria de Chile

## Configuración Requerida

### Secrets de GitHub
Configura los siguientes secrets en tu repositorio de GitHub:

1. **BACKEND_URL** (opcional)
   - URL del backend Django
   - Default: `https://backendcomunidad-production.up.railway.app`

2. **CRON_TOKEN** (requerido)
   - Token de autorización para los endpoints de cron
   - Debe coincidir con el token configurado en el backend

### Configuración de Secrets
1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Agrega los secrets mencionados arriba

## Horarios de Ejecución

### Warm Backend API
- **Frecuencia**: Cada 8 minutos
- **Propósito**: Mantener el backend activo durante horas laborales
- **Endpoint**: `GET /api/health/`

### Envío de Emails de Licencias
- **12:30 PM Chile** (15:30 UTC): Lunes a Viernes
- **6:20 PM Chile** (21:20 UTC): Lunes a Viernes  
- **9:20 PM Chile** (00:20 UTC+1): Lunes a Viernes (ejecuta Martes a Sábado en UTC)
- **Endpoint**: `POST /licencia/cron/send-emails/`

## Diferencias con Vercel

### Ventajas de GitHub Actions
- ✅ Mejor logging y monitoreo
- ✅ Ejecución más confiable
- ✅ No depende de la plataforma de hosting
- ✅ Configuración versionada en el repositorio
- ✅ Posibilidad de ejecución manual

### Consideraciones
- ⚠️ Los horarios están en UTC, no en hora local de Chile
- ⚠️ Requiere configuración de secrets en GitHub
- ⚠️ Los endpoints ahora llaman directamente al backend

## Verificación

Para verificar que los cron jobs funcionan correctamente:

1. **Logs de GitHub Actions**:
   - Ve a la pestaña "Actions" en tu repositorio
   - Revisa los logs de ejecución de "Scheduled Tasks"

2. **Logs del Backend**:
   - Verifica que el backend reciba las llamadas en los horarios programados
   - Revisa los logs de envío de emails

3. **Ejecución Manual**:
   - Puedes ejecutar manualmente los workflows desde la pestaña Actions
   - Útil para testing y debugging

## Troubleshooting

### Error 401 (Unauthorized)
- Verifica que el secret `CRON_TOKEN` esté configurado correctamente
- Asegúrate de que el token coincida con el configurado en el backend

### Error 404 (Not Found)
- Verifica que la URL del backend sea correcta
- Confirma que los endpoints existan en el backend

### No se ejecutan los cron jobs
- Verifica que el repositorio tenga Actions habilitadas
- Confirma que el workflow esté en la rama principal (main/master)
- Revisa que la sintaxis del cron sea correcta