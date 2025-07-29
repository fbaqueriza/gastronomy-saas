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
        return;
      }

      // Solo conectar una vez para todos los mensajes
      const eventSource = new EventSource(`/api/whatsapp/twilio/webhook`);
      
      eventSource.onopen = () => {
        console.log(`🔌 SSE conectado para todos los contactos`);
        isConnectedRef.current = true;
      };
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'test') {
            return;
          }
          
          // Solo procesar si es un mensaje de WhatsApp
          if (data.type === 'whatsapp_message' && data.contactId && data.content) {
            const newMessage: WhatsAppMessage = {
              id: data.id || data.messageId || `msg_${Date.now()}`,
              type: 'received' as const,
              content: data.content,
              timestamp: new Date(data.timestamp || Date.now()),
              status: 'received' as const
            };
            
            console.log(`📨 Mensaje SSE recibido para ${data.contactId}:`, newMessage);
            
            // Solo agregar al contacto específico que envió el mensaje
            addMessage(data.contactId, newMessage);
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };
      
      eventSource.onerror = (error) => {
        console.error(`❌ Error en SSE:`, error);
        isConnectedRef.current = false;
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