-- Crear tabla para pedidos pendientes de confirmación
CREATE TABLE IF NOT EXISTS pending_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  provider_id UUID NOT NULL,
  provider_phone TEXT NOT NULL,
  order_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_confirmation',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_pending_orders_provider_phone ON pending_orders(provider_phone);
CREATE INDEX IF NOT EXISTS idx_pending_orders_status ON pending_orders(status);
CREATE INDEX IF NOT EXISTS idx_pending_orders_created_at ON pending_orders(created_at);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_pending_orders_updated_at 
    BEFORE UPDATE ON pending_orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentar la tabla
COMMENT ON TABLE pending_orders IS 'Tabla para almacenar pedidos pendientes de confirmación del proveedor';
COMMENT ON COLUMN pending_orders.order_id IS 'ID del pedido original';
COMMENT ON COLUMN pending_orders.provider_id IS 'ID del proveedor';
COMMENT ON COLUMN pending_orders.provider_phone IS 'Número de teléfono del proveedor';
COMMENT ON COLUMN pending_orders.order_data IS 'Datos completos del pedido en formato JSON';
COMMENT ON COLUMN pending_orders.status IS 'Estado del pedido pendiente';
