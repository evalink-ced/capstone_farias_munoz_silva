# Plan de Refactorización - Módulo Evaluación

## Paso 1: Limpieza de Versiones Duplicadas

### Estado Actual
- ✅ Identificados directorios duplicados:
  - `Asignar/` vs `Asignar_new/`
  - `Plantilla/` vs `Plantilla_new/`
  - `autoevaluacion/` vs `autoevaluacion_new/`
  - `common/` vs `common_new/`

### Problema Detectado
- Las versiones `_new` están importando componentes de las versiones antiguas
- Las páginas están usando las versiones antiguas
- Hay dependencias circulares

### Plan de Migración
1. **Fase 1**: Consolidar componentes en versiones `_new`
2. **Fase 2**: Actualizar importaciones en páginas
3. **Fase 3**: Eliminar versiones obsoletas
4. **Fase 4**: Renombrar `_new` para eliminar sufijo

### Archivos que Requieren Actualización
- `src/features/evaluacion/pages/asignar/Asignar.tsx`
- `src/features/evaluacion/pages/asignar/crear-asignacion.tsx`
- `src/features/evaluacion/components/index.ts`

### Próximos Pasos
1. Copiar componentes faltantes a versiones `_new`
2. Actualizar importaciones internas
3. Actualizar páginas para usar versiones nuevas
4. Limpiar exports en index.ts