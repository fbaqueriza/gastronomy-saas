'use client';

import { useState } from 'react';
import IntegratedChatPanel from './IntegratedChatPanel';
import ChatFloatingButton from './ChatFloatingButton';
import { useChat } from '../contexts/ChatContext';
import { useData } from './DataProvider';

export default function GlobalChat() {
  const { isChatOpen, openChat, closeChat } = useChat();
  const { providers } = useData();

  // Usar los proveedores reales del contexto de datos
  const realProviders = providers || [];

  return (
    <>
      <IntegratedChatPanel
        providers={realProviders}
        isOpen={isChatOpen}
        onClose={closeChat}
      />
      <ChatFloatingButton />
    </>
  );
}