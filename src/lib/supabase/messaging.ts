import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente con service role para operaciones del backend (solo servidor)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Cliente público para el frontend
export const supabaseClient = createClient(
  supabaseUrl,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Tipos de datos
export interface Message {
  id: string;
  message_id: string;
  conversation_id: string;
  from_phone: string;
  to_phone: string;
  content: string;
  message_type: 'text' | 'image' | 'document' | 'audio' | 'video';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  source: 'whatsapp' | 'kapso_agent' | 'system';
  metadata: Record<string, any>;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  phone_number: string;
  contact_name?: string;
  last_message_at: string;
  unread_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface KapsoWebhookPayload {
  from: string;
  to: string;
  message: string;
  agent_id?: string;
  execution_id?: string;
  session_id?: string;
  message_id?: string;
  type?: 'message_received' | 'message_sent' | 'status_update';
  timestamp?: string;
}

// Servicio de mensajería (solo para servidor)
export class MessagingService {
  // Guardar mensaje con idempotencia
  static async saveMessage(payload: KapsoWebhookPayload, source: 'whatsapp' | 'kapso_agent' = 'whatsapp'): Promise<Message | null> {
    try {
      console.log('💾 Guardando mensaje:', payload);
      
      // Generar message_id único si no existe
      const messageId = payload.message_id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Obtener o crear conversación
      const conversationId = await this.getOrCreateConversation(payload.from);
      
      // Verificar si el mensaje ya existe (idempotencia)
      const { data: existingMessage } = await supabaseAdmin
        .from('messages')
        .select('*')
        .eq('message_id', messageId)
        .single();
      
      if (existingMessage) {
        console.log('⚠️ Mensaje ya existe, saltando inserción:', messageId);
        return existingMessage;
      }
      
      // Insertar nuevo mensaje
      const { data: message, error } = await supabaseAdmin
        .from('messages')
        .insert({
          message_id: messageId,
          conversation_id: conversationId,
          from_phone: payload.from,
          to_phone: payload.to,
          content: payload.message,
          message_type: 'text',
          status: 'delivered',
          source: source,
          metadata: {
            agent_id: payload.agent_id,
            execution_id: payload.execution_id,
            session_id: payload.session_id,
            type: payload.type
          }
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error guardando mensaje:', error);
        return null;
      }
      
      console.log('✅ Mensaje guardado exitosamente:', message.id);
      return message;
      
    } catch (error) {
      console.error('❌ Error en saveMessage:', error);
      return null;
    }
  }
  
  // Obtener o crear conversación
  static async getOrCreateConversation(phoneNumber: string): Promise<string> {
    try {
      // Intentar obtener conversación existente
      const { data: conversation } = await supabaseAdmin
        .from('conversations')
        .select('id')
        .eq('phone_number', phoneNumber)
        .single();
      
      if (conversation) {
        return conversation.id;
      }
      
      // Crear nueva conversación
      const { data: newConversation, error } = await supabaseAdmin
        .from('conversations')
        .insert({
          phone_number: phoneNumber,
          contact_name: `Contact ${phoneNumber}`
        })
        .select('id')
        .single();
      
      if (error) {
        console.error('❌ Error creando conversación:', error);
        throw error;
      }
      
      // Agregar miembro a la conversación
      await supabaseAdmin
        .from('conversation_members')
        .insert({
          conversation_id: newConversation.id,
          phone_number: phoneNumber
        });
      
      return newConversation.id;
      
    } catch (error) {
      console.error('❌ Error en getOrCreateConversation:', error);
      throw error;
    }
  }
  
  // Obtener conversaciones
  static async getConversations(): Promise<Conversation[]> {
    try {
      const { data: conversations, error } = await supabaseAdmin
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error obteniendo conversaciones:', error);
        return [];
      }
      
      return conversations || [];
      
    } catch (error) {
      console.error('❌ Error en getConversations:', error);
      return [];
    }
  }
  
  // Obtener mensajes de una conversación
  static async getMessages(conversationId: string, limit: number = 50): Promise<Message[]> {
    try {
      const { data: messages, error } = await supabaseAdmin
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('❌ Error obteniendo mensajes:', error);
        return [];
      }
      
      return (messages || []).reverse(); // Ordenar por fecha ascendente
      
    } catch (error) {
      console.error('❌ Error en getMessages:', error);
      return [];
    }
  }
  
  // Marcar mensajes como leídos
  static async markAsRead(conversationId: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('is_read', false);
      
      if (error) {
        console.error('❌ Error marcando mensajes como leídos:', error);
        return false;
      }
      
              // console.log('✅ Mensajes marcados como leídos');
      return true;
      
    } catch (error) {
      console.error('❌ Error en markAsRead:', error);
      return false;
    }
  }
  
  // Obtener contador total de no leídos
  static async getTotalUnreadCount(): Promise<number> {
    try {
      const { data, error } = await supabaseAdmin
        .from('conversations')
        .select('unread_count');
      
      if (error) {
        console.error('❌ Error obteniendo contador de no leídos:', error);
        return 0;
      }
      
      const total = (data || []).reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
      return total;
      
    } catch (error) {
      console.error('❌ Error en getTotalUnreadCount:', error);
      return 0;
    }
  }
}
