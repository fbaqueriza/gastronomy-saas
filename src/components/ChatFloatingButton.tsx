'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';

export default function ChatFloatingButton() {
  const { isChatOpen, openChat, closeChat, unreadCounts } = useChat();
  const [totalUnread, setTotalUnread] = useState(0);

  // Calcular total de mensajes no leídos
  useEffect(() => {
    const total = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
    setTotalUnread(total);
  }, [unreadCounts]);

  const handleToggleChat = () => {
    if (isChatOpen) {
      closeChat();
    } else {
      openChat();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={handleToggleChat}
        className={`relative p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${
          isChatOpen 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
        title={isChatOpen ? 'Cerrar chat' : 'Abrir chat'}
      >
        {isChatOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageSquare className="h-6 w-6" />
        )}
        
        {/* Indicador de mensajes no leídos */}
        {totalUnread > 0 && !isChatOpen && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
            {totalUnread > 99 ? '99+' : totalUnread}
          </div>
        )}
        
        {/* Animación de pulso cuando hay mensajes no leídos */}
        {totalUnread > 0 && !isChatOpen && (
          <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
        )}
      </button>
    </div>
  );
}