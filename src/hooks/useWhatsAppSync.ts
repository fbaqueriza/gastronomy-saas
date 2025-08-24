'use client';

import { useCallback } from 'react';
import { useChat } from '../contexts/ChatContext';
import { WhatsAppMessage } from '../types/whatsapp';

export function useWhatsAppSync() {
  const { addMessage } = useChat();

  // Función para agregar un mensaje entrante manualmente
  const addIncomingMessage = useCallback((contactId: string, message: WhatsAppMessage) => {
    console.log('📝 useWhatsAppSync - addIncomingMessage llamado:', { contactId, messageId: message.id });
    addMessage(contactId, message);
  }, [addMessage]);

  // Función para simular un mensaje entrante
  const simulateIncomingMessage = useCallback((contactId: string, content: string) => {
    const message: WhatsAppMessage = {
      id: `sim_${Date.now()}`,
      type: 'received',
      content,
      timestamp: new Date(),
      status: 'delivered'
    };
    
    console.log('🎭 useWhatsAppSync - Simulando mensaje entrante:', { contactId, content });
    addIncomingMessage(contactId, message);
  }, [addIncomingMessage]);

  return { 
    addIncomingMessage,
    simulateIncomingMessage
  };
}