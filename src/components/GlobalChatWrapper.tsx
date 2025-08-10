'use client';

import React, { useState, useEffect } from 'react';
import { useGlobalChat } from '../contexts/GlobalChatContext';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import IntegratedChatPanel from './IntegratedChatPanel';

export default function GlobalChatWrapper() {
  const { isGlobalChatOpen, closeGlobalChat } = useGlobalChat();
  const { user } = useSupabaseAuth();
  const [providers, setProviders] = useState<any[]>([]);

  // Cargar providers cuando se abra el chat
  useEffect(() => {
    if (isGlobalChatOpen && providers.length === 0 && user?.email) {
      console.log('🔄 GlobalChatWrapper: Cargando providers para usuario:', user.email);
      
                        // Cargar providers desde la API de prueba (temporal)
                  fetch('/api/providers-test')
                    .then(r => r.json())
                    .then(result => {
                      console.log('🔄 GlobalChatWrapper: Providers cargados:', {
                        userEmail: user.email,
                        providers: result.providers?.length || 0
                      });
                      setProviders(result.providers || []);
                    })
                    .catch(error => {
                      console.error('Error cargando providers:', error);
                      setProviders([]);
                    });
    }
  }, [isGlobalChatOpen, providers.length, user?.email]);

  return (
    <IntegratedChatPanel 
      providers={providers || []}
      isOpen={isGlobalChatOpen}
      onClose={closeGlobalChat}
    />
  );
}
