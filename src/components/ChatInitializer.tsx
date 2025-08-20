'use client';

import { useEffect, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';

export default function ChatInitializer() {
  const { loadMessages } = useChat();
  const hasInitialized = useRef(false);

  // Inicializar el chat cuando se monta el componente
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      
      // Cargar mensajes iniciales
      if (loadMessages) {
        loadMessages();
      }
    }
  }, [loadMessages]);

  // Este componente no renderiza nada, solo inicializa el contexto
  return null;
}
