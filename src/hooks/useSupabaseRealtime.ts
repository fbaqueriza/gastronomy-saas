import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import type { Message, Conversation } from '@/lib/supabase/messaging';

export function useSupabaseRealtime() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  // Cargar conversaciones iniciales
  useEffect(() => {
    loadConversations();
  }, []);

  // Cargar mensajes cuando se selecciona una conversación
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    let conversationsSubscription: any = null;
    let messagesSubscription: any = null;

    const setupSubscriptions = async () => {
      try {
        const supabaseClient = supabase;
        
        if (!supabaseClient) {
          console.warn('⚠️ Cliente de Supabase no disponible');
          return;
        }

        console.log('🔄 Iniciando suscripciones de Supabase Realtime...');
        
        // Suscripción a conversaciones
        conversationsSubscription = supabaseClient
          .channel('conversations')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'conversations'
            },
            (payload: any) => {
              console.log('🔄 Cambio en conversaciones:', payload);
              handleConversationChange(payload);
            }
          )
          .subscribe();

        // Suscripción a mensajes
        messagesSubscription = supabaseClient
          .channel('messages')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'messages'
            },
            (payload: any) => {
              console.log('🔄 Cambio en mensajes:', payload);
              handleMessageChange(payload);
            }
          )
          .subscribe();
      } catch (error) {
        console.error('❌ Error configurando suscripciones:', error);
      }
    };

    setupSubscriptions();

    return () => {
      console.log('🔄 Desuscribiendo de Supabase Realtime...');
      if (conversationsSubscription) {
        conversationsSubscription.unsubscribe();
      }
      if (messagesSubscription) {
        messagesSubscription.unsubscribe();
      }
    };
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      console.log('📋 Cargando conversaciones...');
      
      const supabaseClient = supabase;
      
      if (!supabaseClient) {
        console.warn('⚠️ Cliente de Supabase no disponible');
        return;
      }

      const { data, error } = await supabaseClient
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      console.log('✅ Conversaciones cargadas:', data?.length || 0);
      setConversations(data || []);
      updateUnreadCount(data || []);
    } catch (error) {
      console.error('❌ Error cargando conversaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      console.log(`📨 Cargando mensajes para conversación: ${conversationId}`);
      
      const supabaseClient = supabase;
      
      if (!supabaseClient) {
        console.warn('⚠️ Cliente de Supabase no disponible');
        return;
      }

      const { data, error } = await supabaseClient
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      console.log(`✅ Mensajes cargados: ${data?.length || 0}`);
      setMessages(prev => ({
        ...prev,
        [conversationId]: data || []
      }));
    } catch (error) {
      console.error('❌ Error cargando mensajes:', error);
    }
  };

  const handleConversationChange = (payload: any) => {
    console.log('🔄 Procesando cambio en conversación:', payload.eventType);
    
    if (payload.eventType === 'INSERT') {
      setConversations(prev => [payload.new, ...prev]);
    } else if (payload.eventType === 'UPDATE') {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === payload.new.id ? payload.new : conv
        )
      );
      updateUnreadCount(conversations);
    } else if (payload.eventType === 'DELETE') {
      setConversations(prev => 
        prev.filter(conv => conv.id !== payload.old.id)
      );
    }
  };

  const handleMessageChange = (payload: any) => {
    console.log('🔄 Procesando cambio en mensaje:', payload.eventType);
    
    if (payload.eventType === 'INSERT') {
      const newMessage = payload.new;
      setMessages(prev => ({
        ...prev,
        [newMessage.conversation_id]: [
          ...(prev[newMessage.conversation_id] || []),
          newMessage
        ]
      }));
    } else if (payload.eventType === 'UPDATE') {
      const updatedMessage = payload.new;
      setMessages(prev => ({
        ...prev,
        [updatedMessage.conversation_id]: 
          (prev[updatedMessage.conversation_id] || []).map(msg =>
            msg.id === updatedMessage.id ? updatedMessage : msg
          )
      }));
    }
  };

  const updateUnreadCount = (conversations: Conversation[]) => {
    const total = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
    setUnreadCount(total);
  };

  const markAsRead = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/mark-read`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Error marcando como leído');
      
              // console.log('✅ Mensajes marcados como leídos');
    } catch (error) {
      console.error('❌ Error marcando como leído:', error);
    }
  };

  const selectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    // Cargar mensajes si no están cargados
    if (!messages[conversationId]) {
      loadMessages(conversationId);
    }
  };

  return {
    conversations,
    messages,
    unreadCount,
    loading,
    selectedConversation,
    loadMessages,
    markAsRead,
    selectConversation
  };
}
