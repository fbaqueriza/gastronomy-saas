'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Bell, FileText, Download } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { WhatsAppMessage, Contact } from '../types/whatsapp';

interface EnhancedChatPreviewProps {
  providerId: string;
  providerName: string;
  providerPhone: string;
  onOpenChat: () => void;
}

export default function EnhancedChatPreview({ 
  providerId, 
  providerName, 
  providerPhone, 
  onOpenChat 
}: EnhancedChatPreviewProps) {
  const { unreadCounts, messagesByContact, openChat } = useChat();
  const [previewText, setPreviewText] = useState('');
  const [timeAgo, setTimeAgo] = useState('');
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [lastMessage, setLastMessage] = useState<WhatsAppMessage | null>(null);

  // Normalizar número de teléfono para buscar en el contexto
  const normalizedPhone = providerPhone.startsWith('+') ? providerPhone : `+${providerPhone}`;

  useEffect(() => {
    // Obtener mensajes del contexto global
    const contactMessages = messagesByContact[normalizedPhone] || [];
    
    if (contactMessages.length > 0) {
      const latestMessage = contactMessages[contactMessages.length - 1];
      setLastMessage(latestMessage);
      
      // Generar preview del mensaje
      if (latestMessage.messageType === 'document') {
        setPreviewText(`📎 ${latestMessage.documentName || 'Documento'}`);
      } else {
        setPreviewText(latestMessage.content);
      }
      
      // Calcular tiempo transcurrido
      const now = new Date();
      const messageTime = latestMessage.timestamp;
      const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) {
        setTimeAgo('Ahora');
      } else if (diffInMinutes < 60) {
        setTimeAgo(`Hace ${diffInMinutes} min`);
      } else if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60);
        setTimeAgo(`Hace ${hours} h`);
      } else {
        const days = Math.floor(diffInMinutes / 1440);
        setTimeAgo(`Hace ${days} d`);
      }
    } else {
      setPreviewText('');
      setTimeAgo('');
      setLastMessage(null);
    }
    
    // Verificar mensajes no leídos
    const unreadCount = unreadCounts[normalizedPhone] || 0;
    setHasUnreadMessages(unreadCount > 0);
  }, [messagesByContact, unreadCounts, normalizedPhone]);

  const handleOpenChat = () => {
    // Crear contacto para el contexto
    const contact: Contact = {
      id: providerId,
      name: providerName,
      phone: normalizedPhone,
      providerId: providerId,
      lastMessage: previewText,
      lastMessageTime: lastMessage?.timestamp,
      unreadCount: unreadCounts[normalizedPhone] || 0
    };
    
    // Abrir el chat global con este contacto
    openChat(contact);
    
    // No llamar a onOpenChat para evitar crear chats separados
    // onOpenChat();
  };

  const getMessageIcon = (message: WhatsAppMessage) => {
    if (message.messageType === 'document') {
      return <FileText className="h-4 w-4 text-blue-500" />;
    }
    return null;
  };

  const getMessagePreview = (message: WhatsAppMessage) => {
    if (message.messageType === 'document') {
      return `📎 ${message.documentName || 'Documento'}`;
    }
    return message.content;
  };

  return (
    <div 
      className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
      onClick={handleOpenChat}
    >
      {/* Avatar del proveedor */}
      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-green-600 font-bold text-sm">
          {providerName.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Contenido del preview */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 truncate">
            {providerName}
          </h3>
          <span className="text-xs text-gray-500 flex-shrink-0">
            {timeAgo}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {lastMessage && getMessageIcon(lastMessage)}
          <p className="text-sm text-gray-600 truncate flex-1">
            {lastMessage ? getMessagePreview(lastMessage) : 'No hay mensajes'}
          </p>
        </div>
      </div>

      {/* Indicador de mensajes no leídos */}
      {hasUnreadMessages && (
        <div className="flex-shrink-0">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
}