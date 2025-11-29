# API de Imágenes para PuckEditor

## 🔐 Autenticación
Todos los endpoints requieren autenticación JWT. Incluye el token en el header:
```
Authorization: Bearer <tu_token_jwt>
```

## 🌐 Base URL
```
https://<tu_dominio>/beneficio/api/puck-images/
```

---

## 📋 Endpoints Disponibles

### 1️⃣ SUBIR IMAGEN
**POST** `/create/`

**Tipo de contenido:** `multipart/form-data`

**Campos del formulario:**
- `nombre`: string (requerido) - Nombre descriptivo de la imagen
- `descripcion`: string (opcional) - Descripción de la imagen
- `archivo`: file (requerido) - Archivo de imagen

**Formatos soportados:** JPG, PNG, GIF, WebP, SVG
**Tamaño máximo:** 5MB

**Respuesta exitosa (201):**
```json
{
  "id": 123,
  "url": "/media/puck_images/nombre-archivo.jpg",
  "thumbnail_url": "/media/puck_images/nombre-archivo.jpg",
  "message": "Imagen subida correctamente"
}
```

**Ejemplo con curl:**
```bash
curl -X POST \
  https://tu-dominio.com/beneficio/api/puck-images/create/ \
  -H "Authorization: Bearer tu_token_jwt" \
  -F "nombre=Mi imagen" \
  -F "descripcion=Descripción opcional" \
  -F "archivo=@/ruta/a/imagen.jpg"
```

---

### 2️⃣ LISTAR IMÁGENES
**GET** `/`

**Parámetros opcionales:**
- `name`: string - Filtrar por nombre (búsqueda parcial)

**Respuesta exitosa (200):**
```json
[
  {
    "id": 123,
    "name": "Mi imagen",
    "url": "/media/puck_images/imagen.jpg",
    "thumbnail_url": "/media/puck_images/imagen.jpg",
    "alt_text": "Texto alternativo",
    "description": "Descripción de la imagen",
    "width": 1920,
    "height": 1080,
    "file_size": "2.5 MB",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

**Ejemplo con curl:**
```bash
curl -X GET \
  "https://tu-dominio.com/beneficio/api/puck-images/?name=logo" \
  -H "Authorization: Bearer tu_token_jwt"
```

---

### 3️⃣ OBTENER IMAGEN ESPECÍFICA
**GET** `/<id>/`

**Respuesta exitosa (200):**
```json
{
  "id": 123,
  "name": "Mi imagen",
  "url": "/media/puck_images/imagen.jpg",
  "thumbnail_url": "/media/puck_images/imagen.jpg",
  "alt_text": "Texto alternativo",
  "description": "Descripción de la imagen",
  "width": 1920,
  "height": 1080,
  "file_size": "2.5 MB",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

### 4️⃣ ACTUALIZAR IMAGEN
**PUT/PATCH** `/<id>/update/`

**Tipo de contenido:** `multipart/form-data`

**Campos del formulario:**
- `nombre`: string (opcional)
- `descripcion`: string (opcional)
- `archivo`: file (opcional)

**Respuesta exitosa (200):**
```json
{
  "message": "Imagen actualizada exitosamente",
  "data": { /* datos de la imagen actualizada */ }
}
```

---

### 5️⃣ ELIMINAR IMAGEN
**DELETE** `/<id>/delete/`

**Respuesta exitosa (200):**
```json
{
  "message": "Imagen eliminada exitosamente"
}
```

**Nota:** La eliminación es lógica (se marca como inactiva), no se borra físicamente.

---

## 🚨 Códigos de Error

- **400 Bad Request**: Datos inválidos o archivo no soportado
- **401 Unauthorized**: Token JWT inválido o faltante
- **404 Not Found**: Imagen no encontrada
- **413 Payload Too Large**: Archivo mayor a 5MB
- **415 Unsupported Media Type**: Formato de archivo no soportado

---

## 📝 Notas Importantes

1. **Autenticación obligatoria**: Todos los endpoints requieren JWT válido
2. **Formatos soportados**: JPG, JPEG, PNG, GIF, WebP, SVG
3. **Tamaño máximo**: 5MB por archivo
4. **URLs absolutas**: Las URLs devueltas son relativas, construye la URL completa con tu dominio
5. **Thumbnails**: Por ahora, `thumbnail_url` es igual a `url`. Se puede implementar generación automática de thumbnails más adelante
6. **Eliminación lógica**: Las imágenes "eliminadas" se marcan como inactivas pero no se borran físicamente

---

## 🔧 Configuración en tu Builder

Para integrar con tu builder de PuckEditor:

1. **Endpoint de subida**: `/beneficio/api/puck-images/create/`
2. **Endpoint de listado**: `/beneficio/api/puck-images/`
3. **Mapeo de campos**:
   - `nombre` → campo de nombre en tu formulario
   - `descripcion` → campo de descripción (opcional)
   - `archivo` → input de tipo file

4. **Respuesta esperada**: El campo `url` contiene la ruta de la imagen para usar en tus image blocks