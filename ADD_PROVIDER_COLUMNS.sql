-- =====================================================
-- AGREGAR COLUMNAS FALTANTES A LA TABLA PROVIDERS
-- =====================================================
-- Ejecutar este código en el SQL Editor de Supabase Dashboard
-- Ubicación: Dashboard > SQL Editor > New Query

-- =====================================================
-- PASO 1: Agregar columnas de configuración de entrega y pago
-- =====================================================

-- Agregar columna para días de entrega por defecto
ALTER TABLE providers 
ADD COLUMN IF NOT EXISTS default_delivery_days TEXT[] DEFAULT '{}';

-- Agregar columna para horarios de entrega por defecto
ALTER TABLE providers 
ADD COLUMN IF NOT EXISTS default_delivery_time TEXT[] DEFAULT '{}';

-- Agregar columna para método de pago por defecto
ALTER TABLE providers 
ADD COLUMN IF NOT EXISTS default_payment_method TEXT DEFAULT 'efectivo';

-- Agregar columna para catálogos
ALTER TABLE providers 
ADD COLUMN IF NOT EXISTS catalogs JSONB DEFAULT '[]';

-- =====================================================
-- PASO 2: Verificar que las columnas se crearon correctamente
-- =====================================================

-- Consulta para verificar la estructura de la tabla
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'providers' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- PASO 3: Actualizar registros existentes (opcional)
-- =====================================================

-- Actualizar registros existentes para asegurar que tengan valores por defecto
UPDATE providers 
SET 
  default_delivery_days = '{}' WHERE default_delivery_days IS NULL;

UPDATE providers 
SET 
  default_delivery_time = '{}' WHERE default_delivery_time IS NULL;

UPDATE providers 
SET 
  default_payment_method = 'efectivo' WHERE default_payment_method IS NULL;

UPDATE providers 
SET 
  catalogs = '[]' WHERE catalogs IS NULL;

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
- Este script agrega las columnas faltantes que causan el error
- Las columnas se crean con valores por defecto seguros
- Después de ejecutar esto, el error debería desaparecer
*/ 