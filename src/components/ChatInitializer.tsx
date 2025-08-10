'use client';

import { useEffect, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';

/**
 * Componente que mantiene una conexión SSE permanente
 * para recibir mensajes de WhatsApp en tiempo real
 */
export default function ChatInitializer() {
  const { isConnected, connectionStatus, addMessage } = useChat();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    
    // Verificar que estamos en el cliente
    if (typeof window === 'undefined') {
  
      return;
    }

    // Evitar múltiples conexiones
    if (eventSourceRef.current) {
  
      return;
    }


    const eventSource = new EventSource('/api/whatsapp/sse');
    
    eventSource.onopen = () => {

    };
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Solo procesar mensajes de WhatsApp, ignorar pings
        if (data.type === 'whatsapp_message') {
  
          
          // Normalizar el contactId
          let normalizedContactId = data.contactId;
          if (normalizedContactId && !normalizedContactId.startsWith('+')) {
            normalizedContactId = `+${normalizedContactId}`;
          }
          
          // Crear el mensaje
          const newMessage = {
            id: data.id || `msg_${Date.now()}`,
            type: 'received' as const,
            content: data.content,
            timestamp: new Date(data.timestamp),
            status: 'delivered' as const
          };
          

          
          // Agregar al contexto de chat
          addMessage(normalizedContactId, newMessage);
          
  
        }
      } catch (error) {
        console.error('❌ ChatInitializer - Error procesando mensaje SSE:', error);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('❌ ChatInitializer - Error en conexión SSE:', error);
      eventSourceRef.current = null;
    };
    
    eventSourceRef.current = eventSource;

    // Cleanup al desmontar
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []); // Sin dependencias para evitar loops



  // Este componente no renderiza nada visible
  return null;
}
