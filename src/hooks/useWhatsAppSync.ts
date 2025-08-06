'use client';

import { useEffect, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';
import { WhatsAppMessage } from '../types/whatsapp';

export function useWhatsAppSync() {
  const { addMessage, messagesByContact } = useChat();
  const eventSourceRef = useRef<EventSource | null>(null);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    // Función para conectar SSE y sincronizar mensajes
    const connectSSE = () => {
      // Evitar múltiples conexiones
      if (eventSourceRef.current || isConnectedRef.current) {
        console.log('⚠️ connectSSE - Ya hay una conexión activa, evitando nueva conexión');
        return;
      }

      console.log('🔌 Conectando SSE para mensajes en tiempo real...');
      console.log('📡 URL del SSE:', `/api/whatsapp/sse`);
      
      // Conectar al endpoint SSE específico
      const eventSource = new EventSource(`/api/whatsapp/sse`);
      
      eventSource.onopen = () => {
        console.log(`✅ SSE conectado para mensajes en tiempo real`);
        isConnectedRef.current = true;
      };
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          console.log('📨 Mensaje SSE recibido:', data);
          
          if (data.type === 'test' || data.type === 'ping') {
            console.log('🔄 SSE ping/test recibido');
            return;
          }
          
          // Solo procesar si es un mensaje de WhatsApp
          if (data.type === 'whatsapp_message' && data.contactId && data.content) {
            const newMessage: WhatsAppMessage = {
              id: data.id || data.messageId || `msg_${Date.now()}`,
              type: 'received' as const,
              content: data.content,
              timestamp: new Date(data.timestamp || Date.now())
            };
            
            console.log(`📨 Mensaje SSE procesado para ${data.contactId}:`, newMessage);
            console.log('📝 addMessage será llamado con:', { contactId: data.contactId, message: newMessage });
            
            // Agregar al contacto específico que envió el mensaje
            addMessage(data.contactId, newMessage);
            
            console.log('✅ addMessage llamado exitosamente');
          } else {
            console.log('⚠️ Mensaje SSE no procesado:', {
              type: data.type,
              hasContactId: !!data.contactId,
              hasContent: !!data.content,
              data: data
            });
          }
        } catch (error) {
          console.error('❌ Error parsing SSE message:', error);
        }
      };
      
      eventSource.onerror = (error) => {
        console.error(`❌ Error en SSE:`, error);
        isConnectedRef.current = false;
        
        // Reintentar conexión después de 5 segundos
        setTimeout(() => {
          console.log('🔄 Reintentando conexión SSE...');
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }
          isConnectedRef.current = false;
          connectSSE();
        }, 5000);
      };
      
      eventSourceRef.current = eventSource;
    };

    // Conectar SSE solo una vez
    if (!isConnectedRef.current) {
      connectSSE();
    }

    // Limpiar conexión al desmontar
    return () => {
      if (eventSourceRef.current) {
        console.log('🔌 Cerrando conexión SSE');
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        isConnectedRef.current = false;
      }
    };
  }, [addMessage]);

  // Función para agregar un mensaje entrante manualmente
  const addIncomingMessage = (contactId: string, message: WhatsAppMessage) => {
    addMessage(contactId, message);
  };

  return { addIncomingMessage };
}