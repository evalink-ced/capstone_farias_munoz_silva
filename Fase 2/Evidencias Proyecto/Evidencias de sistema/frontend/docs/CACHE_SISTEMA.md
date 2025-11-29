# Sistema de Caché para Imágenes de Fondo

## Descripción

Se ha implementado un sistema de caché avanzado para las imágenes de fondo del componente `FondoEmpresa` que evita consultas constantes al servidor y mejora significativamente el rendimiento de la aplicación.

## Características del Sistema de Caché

### 1. **Caché en Memoria (Map)**
- Almacena las imágenes en memoria durante la sesión del navegador
- Acceso instantáneo para imágenes ya cargadas
- Se limpia automáticamente al cerrar la pestaña/navegador

### 2. **Caché Persistente (localStorage)**
- Convierte las imágenes a formato Data URL (base64)
- Persiste entre sesiones del navegador
- Expiración automática después de 24 horas
- Limpieza automática de cachés antiguos (>12 horas) cuando localStorage está lleno

### 3. **Detección de Caché del Navegador**
- Verifica si la imagen ya está en caché del navegador
- Mide el tiempo de carga para determinar si está cacheada
- Evita conversiones innecesarias a Data URL

## Flujo de Funcionamiento

```
1. Verificar caché en memoria → Si existe: usar inmediatamente
2. Verificar localStorage → Si existe y no expiró: usar
3. Verificar caché del navegador → Si está cacheada: usar URL original
4. Cargar imagen nueva → Convertir a Data URL → Guardar en caché
```

## Beneficios

- **Reducción de consultas al servidor**: Las imágenes se cargan solo una vez
- **Mejora en velocidad de carga**: Acceso instantáneo a imágenes cacheadas
- **Experiencia de usuario mejorada**: Eliminación de parpadeos y recargas
- **Optimización de ancho de banda**: Menos transferencia de datos
- **Persistencia entre sesiones**: Las imágenes permanecen disponibles offline

## Configuración

### Tiempo de Expiración
- **Caché principal**: 24 horas
- **Limpieza automática**: 12 horas

### Formato de Almacenamiento
- **Formato**: JPEG con calidad 80%
- **Clave de caché**: `fondo_empresa_[hash_base64_url]`

## Manejo de Errores

- **Fallback automático**: Si falla el caché, usa la URL original
- **Limpieza de errores**: Elimina entradas corruptas automáticamente
- **Cross-origin**: Maneja imágenes de diferentes dominios
- **Canvas no disponible**: Fallback a URL original si no se puede crear canvas

## Implementación Técnica

### Componente Afectado
- `src/features/beneficio/components/FondoEmpresa.tsx`

### Funciones Principales
- `preloadImage()`: Gestión principal del caché
- `isImageCached()`: Detección de caché del navegador
- `getCacheKey()`: Generación de claves únicas

### Estados del Componente
- `cachedImageUrl`: URL de la imagen cacheada
- `loaded`: Estado de carga de la imagen

## Monitoreo y Debugging

### Logs en Consola
- Advertencias para errores de caché
- Información sobre fallbacks automáticos
- Detalles de limpieza de caché

### Verificación Manual
```javascript
// Ver caché en localStorage
Object.keys(localStorage).filter(key => key.startsWith('fondo_empresa_'))

// Limpiar caché manualmente
Object.keys(localStorage)
  .filter(key => key.startsWith('fondo_empresa_'))
  .forEach(key => localStorage.removeItem(key))
```

## Consideraciones de Rendimiento

- **Memoria**: El caché en memoria se libera automáticamente
- **Almacenamiento**: localStorage tiene límite (~5-10MB según navegador)
- **Procesamiento**: Conversión a Data URL solo para imágenes nuevas
- **Red**: Reducción significativa de peticiones HTTP

## Compatibilidad

- **Navegadores modernos**: Soporte completo
- **Navegadores antiguos**: Fallback automático a carga normal
- **Dispositivos móviles**: Optimizado para conexiones lentas

## Mantenimiento

El sistema es completamente automático y no requiere mantenimiento manual. La limpieza de caché se realiza automáticamente según las políticas configuradas.