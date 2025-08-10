'use client';

import React, { useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useGlobalChat } from '../contexts/GlobalChatContext';
import IntegratedChatPanel from './IntegratedChatPanel';
import { MessageCircle, X } from 'lucide-react';

export default function GlobalChatPanel() {
  const { currentContact, messages, sendMessage, isConnected, openChat } = useChat();
  const { isGlobalChatOpen, closeGlobalChat, currentGlobalContact } = useGlobalChat();

  // Sincronizar el contacto global con el ChatContext
  useEffect(() => {
    if (isGlobalChatOpen && currentGlobalContact) {
      openChat(currentGlobalContact as any);
    }
  }, [isGlobalChatOpen, currentGlobalContact, openChat]);

  if (!isGlobalChatOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-4xl h-full max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-green-600 text-white">
          <div className="flex items-center space-x-3">
            <MessageCircle className="h-6 w-6" />
            <div>
              <h2 className="text-lg font-semibold">
                {currentGlobalContact ? `Chat con ${currentGlobalContact.name}` : 'Chat de WhatsApp'}
              </h2>
              <p className="text-sm opacity-90">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </p>
            </div>
          </div>
          <button
            onClick={closeGlobalChat}
            className="p-2 hover:bg-green-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-hidden">
          <IntegratedChatPanel 
            providers={[]}
            isOpen={isGlobalChatOpen}
            onClose={closeGlobalChat}
          />
        </div>
      </div>
    </div>
  );
}
