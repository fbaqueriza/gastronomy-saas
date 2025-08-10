'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Bell } from 'lucide-react';
// import { useChat } from '../contexts/ChatContext';
import { Contact } from '../types/whatsapp';

interface ChatMessage {
  id: string;
  type: 'sent' | 'received';
  content: string;
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
}

interface ChatPreviewProps {
  providerName: string;
  providerPhone?: string;
  providerId?: string;
  orderId?: string;
  onOpenChat?: () => void;
  hasUnreadMessages?: boolean;
  lastMessage?: ChatMessage;
}

export default function ChatPreview({
  providerName,
  providerPhone,
  providerId,
  orderId,
  onOpenChat,
  hasUnreadMessages = false,
  lastMessage,
}: ChatPreviewProps) {
  // Chat hooks disabled - using placeholders
  const openChat = () => console.log('Chat not available in this context');
  const unreadCounts = {}; // Placeholder when chat is not available
  const [previewText, setPreviewText] = useState('');
  const [timeAgo, setTimeAgo] = useState('');



  useEffect(() => {
    if (lastMessage) {
      // Limitar el preview a 50 caracteres
      const text = lastMessage.content.length > 50 
        ? lastMessage.content.substring(0, 50) + '...' 
        : lastMessage.content;
      setPreviewText(text);

      // Calcular tiempo transcurrido
      const now = new Date();
      const messageTime = new Date(lastMessage.timestamp);
      const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) {
        setTimeAgo('Ahora');
      } else if (diffInMinutes < 60) {
        setTimeAgo(`Hace ${diffInMinutes} min`);
      } else if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60);
        setTimeAgo(`Hace ${hours}h`);
      } else {
        const days = Math.floor(diffInMinutes / 1440);
        setTimeAgo(`Hace ${days}d`);
      }
    } else {
      setPreviewText('Iniciar conversación...');
      setTimeAgo('');
    }
  }, [lastMessage]);

  const handleOpenChat = () => {
    // Llamar al callback original si existe
    if (onOpenChat) {
      onOpenChat();
    }
  };

  return (
    <div 
      className={`relative p-1 rounded border cursor-pointer transition-all duration-200 hover:shadow-sm ${
        hasUnreadMessages 
          ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
          : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}
      onClick={() => {
        handleOpenChat();
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {providerName.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {providerName}
                </h4>
                <span className="text-xs text-gray-500">
                  {timeAgo}
                </span>
              </div>
              <p className="text-xs text-gray-600 truncate">
                {previewText || 'Sin mensajes recientes'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          {hasUnreadMessages && (
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          )}
          <MessageSquare className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
} 