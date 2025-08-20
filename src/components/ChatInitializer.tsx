'use client';

import { useEffect, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';

export default function ChatInitializer() {
  const { isConnected, connectionStatus, syncMessagesFromDatabase } = useChat();
  const hasInitialized = useRef(false);

  // Inicializar el chat cuando se monta el componente
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      console.log('🚀 ChatInitializer - Inicializando chat...');
      syncMessagesFromDatabase();
      
      // Forzar reconexión SSE después de 2 segundos
      setTimeout(() => {
        console.log('🔄 ChatInitializer - Forzando reconexión SSE...');
        // El useEffect del ChatContext se ejecutará nuevamente
      }, 2000);
    }
  }, [syncMessagesFromDatabase]); // Solo se ejecuta una vez al montar

  // Este componente no renderiza nada, solo inicializa el contexto
  return null;
}
