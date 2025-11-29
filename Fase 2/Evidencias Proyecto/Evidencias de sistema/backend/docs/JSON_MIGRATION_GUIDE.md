# Guía de Migración: HTML a JSON para PuckEditor

## Resumen de Cambios

Se ha migrado el campo `text` del modelo `Asociacion` de `CKEditor5Field` (HTML) a `JSONField` para soportar PuckEditor. La implementación incluye conversión automática de contenido HTML legacy.

## Cambios Realizados

### 1. Modelo de Base de Datos
- **Archivo**: `beneficio/models/asociacion.py`
- **Cambio**: Campo `text` migrado de `CKEditor5Field` a `JSONField`
- **Migración**: `0006_convert_html_to_json.py` - Convierte datos existentes automáticamente

### 2. Serializer
- **Archivo**: `beneficio/serializers/serializers.py`
- **Funcionalidad**: Conversión automática de HTML legacy a JSON
- **Campos nuevos**: 
  - `text_json`: Alias para el campo `text` con mejor documentación
  - Validación inteligente que maneja tanto HTML como JSON

### 3. Admin Interface
- **Archivo**: `beneficio/admin.py`
- **Mejoras**: 
  - Formulario personalizado con validación JSON
  - Widget textarea optimizado para contenido JSON
  - Validación en tiempo real

## Compatibilidad con Contenido Legacy

### Conversión Automática
El sistema maneja automáticamente:

1. **JSON válido**: Se procesa directamente
2. **HTML legacy**: Se convierte automáticamente al formato:
   ```json
   {
     "content": [
       {
         "type": "Text",
         "props": {
           "children": "<contenido HTML original>"
         }
       }
     ]
   }
   ```
3. **Texto plano**: Se trata como HTML legacy

### Ejemplos de Uso

#### Envío de JSON (Recomendado)
```json
{
  "title": "Mi Beneficio",
  "text": {
    "content": [
      {
        "type": "Heading",
        "props": {
          "rank": 1,
          "children": "Título Principal"
        }
      },
      {
        "type": "Text",
        "props": {
          "children": "Contenido del beneficio..."
        }
      }
    ]
  },
  "is_active": true
}
```

#### Envío de HTML Legacy (Soportado)
```json
{
  "title": "Mi Beneficio",
  "text": "<h1>Título Principal</h1><p>Contenido del beneficio...</p>",
  "is_active": true
}
```

## Endpoints de API

Todos los endpoints existentes mantienen compatibilidad:

- `GET /api/beneficio/asociaciones/` - Listar asociaciones
- `POST /api/beneficio/asociaciones/` - Crear asociación
- `GET /api/beneficio/asociaciones/{id}/` - Obtener asociación
- `PUT /api/beneficio/asociaciones/{id}/update/` - Actualizar asociación
- `DELETE /api/beneficio/asociaciones/{id}/` - Eliminar asociación

## Campos del Serializer

- `text`: Campo principal (acepta HTML legacy o JSON)
- `text_json`: Alias del campo `text` con documentación específica para JSON
- Ambos campos apuntan al mismo dato en la base de datos

## Validación

### Reglas de Validación
1. El contenido no puede estar vacío
2. Si es JSON string, debe ser válido
3. Si es HTML/texto, se convierte automáticamente
4. El resultado final debe ser un objeto JSON válido

### Mensajes de Error
- `"El contenido es obligatorio."` - Campo vacío
- `"El contenido debe ser un JSON válido o texto HTML."` - Formato inválido
- `"El contenido debe ser un objeto JSON válido."` - Tipo de dato incorrecto

## Pruebas

### Script de Prueba
Ejecute `python test_legacy_html_conversion.py` para verificar:
- Conversión de HTML a JSON
- Validación de JSON
- Compatibilidad con datos legacy

### Casos de Prueba Cubiertos
- ✅ HTML con tags
- ✅ Texto plano
- ✅ JSON válido como string
- ✅ JSON válido como objeto
- ✅ Validación de serializer completo

## Migración de Datos

### Datos Existentes
Todos los datos HTML existentes fueron convertidos automáticamente durante la migración `0006_convert_html_to_json.py`.

### Verificación Post-Migración
```python
# Verificar que los datos se convirtieron correctamente
from beneficio.models.asociacion import Asociacion
import json

for asociacion in Asociacion.objects.all():
    try:
        if isinstance(asociacion.text, str):
            json.loads(asociacion.text)
        print(f"✅ Asociación {asociacion.id}: JSON válido")
    except:
        print(f"❌ Asociación {asociacion.id}: Requiere revisión")
```

## Notas Importantes

1. **Retrocompatibilidad**: El sistema acepta tanto HTML legacy como JSON nuevo
2. **Conversión Automática**: No se requiere migración manual de datos
3. **Validación Robusta**: Manejo de errores comprehensivo
4. **Performance**: La conversión solo ocurre durante la validación, no en cada consulta
5. **Admin Interface**: Formulario optimizado para edición JSON manual

## Solución de Problemas

### Error 400 en Actualización
Si recibe errores 400 al actualizar beneficios:
1. Verifique que el servidor esté ejecutando la versión actualizada
2. Confirme que la migración se aplicó correctamente
3. Revise los logs del servidor para detalles específicos

### Contenido No Válido
Si el contenido no se valida:
1. Verifique que sea JSON válido o HTML/texto
2. Use el script de prueba para validar el formato
3. Consulte los mensajes de error específicos