# Configuración de Permisos de Supabase Storage

## Problema Actual
El error "Error de permisos: El usuario no tiene permisos para subir archivos" indica que las políticas RLS (Row Level Security) no están configuradas correctamente en Supabase Storage.

## Solución: Configurar Políticas RLS

### Paso 1: Acceder al Dashboard de Supabase
1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a la sección "Storage" en el menú lateral

### Paso 2: Crear Bucket (si no existe)
1. En la sección Storage, haz clic en "New bucket"
2. Nombre del bucket: `files`
3. Marca "Public bucket" (para que los archivos sean accesibles públicamente)
4. Haz clic en "Create bucket"

### Paso 3: Configurar Políticas RLS
1. Ve a la pestaña "Policies" en la sección Storage
2. Selecciona el bucket `files`
3. Haz clic en "New policy"

#### Política 1: Permitir INSERT (subir archivos)
```sql
-- Nombre: "Allow authenticated users to upload files"
-- Operación: INSERT
-- Target roles: authenticated
-- Policy definition:
(auth.role() = 'authenticated')
```

#### Política 2: Permitir SELECT (ver archivos)
```sql
-- Nombre: "Allow public to view files"
-- Operación: SELECT
-- Target roles: public
-- Policy definition:
true
```

#### Política 3: Permitir UPDATE (modificar archivos)
```sql
-- Nombre: "Allow authenticated users to update their files"
-- Operación: UPDATE
-- Target roles: authenticated
-- Policy definition:
(auth.role() = 'authenticated')
```

#### Política 4: Permitir DELETE (eliminar archivos)
```sql
-- Nombre: "Allow authenticated users to delete their files"
-- Operación: DELETE
-- Target roles: authenticated
-- Policy definition:
(auth.role() = 'authenticated')
```

### Paso 4: Verificar Configuración
1. Ve a la pestaña "Files" en Storage
2. Intenta subir un archivo de prueba
3. Verifica que se pueda acceder al archivo públicamente

## Configuración Alternativa (Más Restrictiva)

Si quieres una configuración más segura, puedes usar estas políticas que solo permiten a usuarios autenticados acceder a sus propios archivos:

### Política SELECT más restrictiva:
```sql
-- Nombre: "Allow users to view their own files"
-- Operación: SELECT
-- Target roles: authenticated
-- Policy definition:
(auth.uid()::text = (storage.foldername(name))[1])
```

### Política INSERT más restrictiva:
```sql
-- Nombre: "Allow users to upload to their own folder"
-- Operación: INSERT
-- Target roles: authenticated
-- Policy definition:
(auth.uid()::text = (storage.foldername(name))[1])
```

## Nota Importante
- Las políticas actuales en el código están configuradas para usar el fallback local si hay errores de permisos
- Una vez configuradas las políticas correctamente, el sistema intentará usar Supabase Storage primero
- Si las políticas fallan, automáticamente usará el almacenamiento local (Base64)

## Verificación
Después de configurar las políticas:
1. Intenta subir un catálogo desde la aplicación
2. Verifica en la consola del navegador que no aparezcan errores de RLS
3. El archivo debería aparecer en el bucket `files` en Supabase Dashboard 