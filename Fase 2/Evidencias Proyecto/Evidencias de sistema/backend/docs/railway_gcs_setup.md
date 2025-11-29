# Configuración de Google Cloud Storage en Railway

## 🔍 Diagnóstico Actual

El diagnóstico local muestra que:
- ✅ **La configuración funciona localmente** (usando archivo JSON)
- ❌ **Faltan variables de entorno** para Railway
- ✅ **La subida de archivos funciona** cuando las credenciales están disponibles

## 🚀 Solución: Configurar Variables de Entorno en Railway

### Paso 1: Preparar el JSON de Credenciales

El archivo `dias-administrativos-877c72dc5750.json` contiene las credenciales. Necesitas copiarlo como una sola línea para Railway.

**Contenido del archivo JSON:**
```json

```

### Paso 2: Configurar Variables en Railway

1. **Accede a tu proyecto en Railway:**
   - Ve a https://railway.app
   - Selecciona tu proyecto
   - Ve a la pestaña "Variables"

2. **Agrega estas 3 variables de entorno:**

   **Variable 1:**
   ```
   Nombre: GS_BUCKET_NAME
   Valor: media_ced
   ```

   **Variable 2:**
   ```
   Nombre: GS_PROJECT_ID
   Valor: dias-administrativos
   ```

   **Variable 3:**
   ```
   Nombre: GS_CREDENTIALS_JSON
   Valor: {"type":"service_account","project_id":"dias-administrativos","private_key_id":"877c72dc575019fea1173d7174e270d56d801b63","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCovnNE/uoMht5o\nKBuTWyTvN59ointmoaT8SHp8/kvOXEfiNTt4OcJf4Pwx+drWnNaaC6yDUj2hS8iE\n20TxCPnS0VF9LAya8ga+IeZJplYUMctpKJYrzQn/px68JUbWrrEn2PMqgE+UeJGn\nn6H2c9fVbe4lXK8M/wVMtyHhT/mreMHBNVQz9Y7RwGrmkYJX9Yd/07P...\n-----END PRIVATE KEY-----\n","client_email":"django-storage@dias-administrativos.iam.gserviceaccount.com","client_id":"118079789397931557503","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/django-storage%40dias-administrativos.iam.gserviceaccount.com","universe_domain":"googleapis.com"}
   ```

### Paso 3: Verificar el Deploy

1. **Railway hará redeploy automáticamente** después de agregar las variables
2. **Verifica los logs** para asegurarte de que no hay errores de autenticación
3. **Prueba subir una imagen** desde el admin de Django

### Paso 4: Verificación Post-Deploy

Después del deploy, verifica:

1. **En el admin de Django:**
   - Sube una imagen
   - Verifica que se guarde correctamente

2. **En Google Cloud Console:**
   - Ve a Cloud Storage > Buckets > media_ced
   - Confirma que el archivo aparezca

3. **URL de la imagen:**
   - Debería ser: `https://storage.googleapis.com/media_ced/[nombre-archivo]`

## 🔧 Troubleshooting

### Si sigues teniendo problemas:

1. **Verifica los logs de Railway:**
   ```
   Busca errores como:
   - "google.auth.exceptions.DefaultCredentialsError"
   - "403 Forbidden"
   - "404 Not Found"
   ```

2. **Verifica las credenciales:**
   - El JSON debe estar en una sola línea
   - No debe tener espacios extra
   - Los caracteres de escape deben estar correctos

3. **Verifica permisos en GCP:**
   - Service Account: `django-storage@dias-administrativos.iam.gserviceaccount.com`
   - Rol: "Storage Object Admin"
   - Bucket: `media_ced`

## 📋 Checklist de Verificación

- [ ] Variables de entorno configuradas en Railway
- [ ] Deploy completado sin errores
- [ ] Logs sin errores de autenticación
- [ ] Subida de archivo funciona desde admin
- [ ] Archivo aparece en bucket GCS
- [ ] URL de archivo es accesible

## 🎯 Estado Esperado

Después de esta configuración:
- ✅ **Local:** Funciona con archivo JSON
- ✅ **Railway:** Funciona con variables de entorno
- ✅ **GCS:** Archivos se suben al bucket `media_ced`
- ✅ **URLs:** Accesibles desde `https://storage.googleapis.com/media_ced/`

---

**Nota:** El archivo JSON local seguirá funcionando para desarrollo, mientras que Railway usará las variables de entorno para producción.