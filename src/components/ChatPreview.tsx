'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Bell } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
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
  const { openChat, unreadCounts } = useChat();
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
    if (providerPhone && providerId) {
      // Normalizar el número de teléfono para que coincida con el webhook
      const normalizedPhone = providerPhone.startsWith('+') ? providerPhone : `+${providerPhone}`;
      
      // Crear contacto para el contexto global
      const contact: Contact = {
        id: providerId,
        name: providerName,
        phone: normalizedPhone,
        providerId: providerId,
        lastMessage: previewText,
        lastMessageTime: lastMessage?.timestamp,
        unreadCount: unreadCounts[normalizedPhone] || 0
      };
      
      // Abrir el chat global
      openChat(contact);
    }
    
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
      onClick={handleOpenChat}
    >
      {/* Indicador de mensajes no leídos */}
      {hasUnreadMessages && (
        <div className="absolute -top-0.5 -right-0.5">
          <div className="bg-red-500 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center">
            <Bell className="w-1.5 h-1.5" />
          </div>
        </div>
      )}

      <div className="flex items-center space-x-1">
        {/* Contenido del preview */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            {timeAgo && (
              <span className="text-xs text-gray-500 flex-shrink-0">
                {timeAgo}
              </span>
            )}
          </div>
          
          <div className="flex items-center">
            <MessageSquare className="w-2.5 h-2.5 text-gray-400 mr-1 flex-shrink-0" />
            <p className={`text-xs truncate ${
              hasUnreadMessages ? 'text-blue-700 font-medium' : 'text-gray-600'
            }`}>
              {previewText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 