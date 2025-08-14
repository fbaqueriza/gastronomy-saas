"use client";

import React from 'react';
import { MessageSquare, Clock } from 'lucide-react';

interface ChatPreviewProps {
  providerName: string;
  providerPhone: string;
  providerId: string;
  orderId: string;
  onOpenChat: () => void;
  hasUnreadMessages: boolean;
  lastMessage: {
    id: string;
    type: 'sent' | 'received';
    content: string;
    timestamp: Date;
    status: 'sent' | 'delivered' | 'read';
  };
}

export default function ChatPreview({
  providerName,
  providerPhone,
  providerId,
  orderId,
  onOpenChat,
  hasUnreadMessages,
  lastMessage
}: ChatPreviewProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
      case 'delivered':
        return <div className="w-2 h-2 bg-blue-400 rounded-full" />;
      case 'read':
        return <div className="w-2 h-2 bg-green-400 rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <div 
      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={onOpenChat}
    >
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {providerName}
          </h4>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500">
              {formatTime(lastMessage.timestamp)}
            </span>
            {getStatusIcon(lastMessage.status)}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-gray-600 truncate">
            {lastMessage.content}
          </p>
          {hasUnreadMessages && (
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
            </div>
          )}
        </div>
        
        <p className="text-xs text-gray-500 mt-1">
          {providerPhone}
        </p>
      </div>
    </div>
  );
}
