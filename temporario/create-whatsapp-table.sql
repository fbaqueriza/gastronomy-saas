-- Crear tabla whatsapp_messages
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id TEXT PRIMARY KEY,
    from_number TEXT NOT NULL,
    to_number TEXT NOT NULL,
    content TEXT,
    message_type TEXT DEFAULT 'text',
    status TEXT DEFAULT 'received',
    user_id UUID REFERENCES auth.users(id),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_user_id ON whatsapp_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_timestamp ON whatsapp_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_from_number ON whatsapp_messages(from_number);

-- Habilitar RLS (Row Level Security)
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Política para que usuarios solo vean sus propios mensajes
CREATE POLICY "Users can view their own messages" ON whatsapp_messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages" ON whatsapp_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages" ON whatsapp_messages
    FOR UPDATE USING (auth.uid() = user_id);

-- Comentarios
COMMENT ON TABLE whatsapp_messages IS 'Tabla para almacenar mensajes de WhatsApp';
COMMENT ON COLUMN whatsapp_messages.id IS 'ID único del mensaje';
COMMENT ON COLUMN whatsapp_messages.from_number IS 'Número de teléfono del remitente';
COMMENT ON COLUMN whatsapp_messages.to_number IS 'Número de teléfono del destinatario';
COMMENT ON COLUMN whatsapp_messages.content IS 'Contenido del mensaje';
COMMENT ON COLUMN whatsapp_messages.message_type IS 'Tipo de mensaje (text, image, document, etc.)';
COMMENT ON COLUMN whatsapp_messages.status IS 'Estado del mensaje (received, sent, delivered, read)';
COMMENT ON COLUMN whatsapp_messages.user_id IS 'ID del usuario propietario del mensaje';
COMMENT ON COLUMN whatsapp_messages.timestamp IS 'Timestamp del mensaje';
