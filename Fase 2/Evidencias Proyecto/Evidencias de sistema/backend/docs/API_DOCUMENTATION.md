# API de Beneficios (Asociaciones)

Esta documentación describe los endpoints disponibles para la gestión de beneficios/asociaciones.

## Endpoints Disponibles

### 1. Listar Asociaciones
**GET** `/beneficio/api/asociaciones/`

**Descripción:** Obtiene la lista de asociaciones activas filtradas por la empresa del usuario autenticado.

**Parámetros de consulta opcionales:**
- `title`: Filtrar por título (búsqueda parcial)

**Respuesta exitosa (200):**
```json
{
  "results": [
    {
      "id": 1,
      "title": "Beneficio Ejemplo",
      "icono": "http://localhost:8000/media/imgb/icono.png",
      "file": "http://localhost:8000/media/pdfs/documento.pdf",
      "url": "https://ejemplo.com",
      "thumbnail": "http://localhost:8000/media/thumbnails/thumbnail.png",
      "text": "<p>Contenido del beneficio</p>",
      "empresas": [
        {
          "id": 1,
          "nombre": "Empresa Ejemplo"
        }
      ],
      "is_active": true,
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T10:00:00Z"
    }
  ],
  "count": 1,
  "css_file": "empresa1.css"
}
```

### 2. Obtener Asociación Específica
**GET** `/beneficio/api/asociaciones/{id}/`

**Descripción:** Obtiene los detalles de una asociación específica.

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "title": "Beneficio Ejemplo",
  "icono": "http://localhost:8000/media/imgb/icono.png",
  "file": "http://localhost:8000/media/pdfs/documento.pdf",
  "url": "https://ejemplo.com",
  "thumbnail": "http://localhost:8000/media/thumbnails/thumbnail.png",
  "text": "<p>Contenido del beneficio</p>",
  "empresas": [
    {
      "id": 1,
      "nombre": "Empresa Ejemplo"
    }
  ],
  "is_active": true,
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

### 3. Crear Nueva Asociación
**POST** `/beneficio/api/asociaciones/create/`

**Descripción:** Crea una nueva asociación.

**Cuerpo de la petición (multipart/form-data):**
```json
{
  "title": "Nuevo Beneficio",
  "text": "<p>Descripción del beneficio</p>",
  "icono": "[archivo de imagen]",
  "file": "[archivo PDF/documento]",
  "url": "https://ejemplo.com",
  "empresas_ids": [1, 2],
  "is_active": true
}
```

**Campos obligatorios:**
- `title`: Título del beneficio
- `text`: Contenido/descripción del beneficio

**Campos opcionales:**
- `icono`: Imagen del icono (máximo 2MB, formatos: JPEG, PNG, GIF, WebP)
- `file`: Archivo adjunto (máximo 10MB, formatos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX)
- `url`: URL externa relacionada
- `empresas_ids`: Lista de IDs de empresas a asociar
- `is_active`: Estado activo (por defecto: true)

**Respuesta exitosa (201):**
```json
{
  "id": 2,
  "title": "Nuevo Beneficio",
  "icono": "http://localhost:8000/media/imgb/nuevo_icono.png",
  "file": "http://localhost:8000/media/pdfs/nuevo_documento.pdf",
  "url": "https://ejemplo.com",
  "thumbnail": "http://localhost:8000/media/thumbnails/nuevo_thumbnail.png",
  "text": "<p>Descripción del beneficio</p>",
  "empresas": [
    {
      "id": 1,
      "nombre": "Empresa Ejemplo"
    }
  ],
  "is_active": true,
  "created_at": "2024-01-01T11:00:00Z",
  "updated_at": "2024-01-01T11:00:00Z"
}
```

### 4. Actualizar Asociación
**PUT/PATCH** `/beneficio/api/asociaciones/{id}/update/`

**Descripción:** Actualiza una asociación existente.

**Cuerpo de la petición:** Igual que en la creación, pero todos los campos son opcionales para PATCH.

**Respuesta exitosa (200):** Igual que en la creación.

### 5. Eliminar Asociación
**DELETE** `/beneficio/api/asociaciones/{id}/delete/`

**Descripción:** Elimina (desactiva) una asociación.

**Respuesta exitosa (204):**
```json
{
  "message": "Asociación eliminada correctamente"
}
```

## URLs de Compatibilidad

Para mantener compatibilidad con el frontend existente, también están disponibles estos endpoints:

- **GET** `/beneficio/api/asociacion/get/pdf/` → Lista de asociaciones
- **GET** `/beneficio/api/asociacion/get/{id}/` → Detalle de asociación
- **POST** `/beneficio/api/asociacion/create/` → Crear asociación
- **PUT** `/beneficio/api/asociacion/update/{id}/` → Actualizar asociación
- **DELETE** `/beneficio/api/asociacion/delete/{id}/` → Eliminar asociación

## Autenticación

Todos los endpoints requieren autenticación. El usuario debe estar autenticado y tener permisos para acceder a las asociaciones de su empresa.

## Filtros de Seguridad

- Los usuarios solo pueden ver asociaciones de su empresa
- Solo se muestran asociaciones activas (`is_active=True`)
- Los archivos subidos se validan por tamaño y tipo
- Las miniaturas de PDF se generan automáticamente

## Códigos de Error

- **400**: Datos de entrada inválidos
- **401**: No autenticado
- **403**: Sin permisos
- **404**: Recurso no encontrado
- **500**: Error interno del servidor