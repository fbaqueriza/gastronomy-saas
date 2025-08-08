-- =====================================================
-- POLÍTICAS RLS PARA SUPABASE STORAGE
-- =====================================================
-- Ejecutar este código en el SQL Editor de Supabase Dashboard
-- Ubicación: Dashboard > SQL Editor > New Query

-- =====================================================
-- PASO 1: Crear bucket 'files' si no existe
-- =====================================================

-- Nota: El bucket debe crearse manualmente desde la UI de Storage
-- Nombre: files
-- Marcar como: Public bucket

-- =====================================================
-- PASO 2: Crear políticas RLS para el bucket 'files'
-- =====================================================

-- Política 1: Permitir INSERT (subir archivos)
-- Permite a usuarios autenticados subir archivos
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'files');

-- Política 2: Permitir SELECT (ver archivos)
-- Permite acceso público para ver archivos
CREATE POLICY "Allow public to view files" ON storage.objects
FOR SELECT 
TO public
USING (bucket_id = 'files');

-- Política 3: Permitir UPDATE (modificar archivos)
-- Permite a usuarios autenticados modificar archivos
CREATE POLICY "Allow authenticated users to update files" ON storage.objects
FOR UPDATE 
TO authenticated
USING (bucket_id = 'files')
WITH CHECK (bucket_id = 'files');

-- Política 4: Permitir DELETE (eliminar archivos)
-- Permite a usuarios autenticados eliminar archivos
CREATE POLICY "Allow authenticated users to delete files" ON storage.objects
FOR DELETE 
TO authenticated
USING (bucket_id = 'files');

-- =====================================================
-- POLÍTICAS ALTERNATIVAS (MÁS RESTRICTIVAS)
-- =====================================================
-- Descomenta estas políticas si quieres que los usuarios
-- solo puedan acceder a sus propios archivos

/*
-- Política SELECT más restrictiva:
CREATE POLICY "Allow users to view their own files" ON storage.objects
FOR SELECT 
TO authenticated
USING (
  bucket_id = 'files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política INSERT más restrictiva:
CREATE POLICY "Allow users to upload to their own folder" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política UPDATE más restrictiva:
CREATE POLICY "Allow users to update their own files" ON storage.objects
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política DELETE más restrictiva:
CREATE POLICY "Allow users to delete their own files" ON storage.objects
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
*/

-- =====================================================
-- VERIFICACIÓN DE POLÍTICAS
-- =====================================================

-- Consulta para verificar que las políticas se crearon correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- =====================================================
-- INSTRUCCIONES DE USO
-- =====================================================
/*
1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a SQL Editor en el menú lateral
4. Haz clic en "New Query"
5. Copia y pega todo este código
6. Haz clic en "Run" para ejecutar

NOTAS IMPORTANTES:
- Primero crea el bucket 'files' desde la UI de Storage
- Las políticas básicas permiten acceso público para ver archivos
- Las políticas comentadas son más restrictivas (solo archivos propios)
- Descomenta las políticas restrictivas si necesitas más seguridad
*/ 