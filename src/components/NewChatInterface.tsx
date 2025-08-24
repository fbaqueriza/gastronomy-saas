'use client';

import React, { useState } from 'react';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';

export default function NewChatInterface() {
  const {
    conversations,
    messages,
    unreadCount,
    loading,
    selectedConversation,
    markAsRead,
    selectConversation
  } = useSupabaseRealtime();

  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    // TODO: Implementar envío de mensajes
    console.log('Enviando mensaje:', newMessage);
    setNewMessage('');
  };

  const handleConversationClick = async (conversationId: string) => {
    selectConversation(conversationId);
    await markAsRead(conversationId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Cargando conversaciones...</div>
      </div>
    );
  }

  const selectedMessages = selectedConversation ? messages[selectedConversation] || [] : [];
  const selectedConversationData = selectedConversation 
    ? conversations.find(c => c.id === selectedConversation) 
    : null;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar con conversaciones */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Chat WhatsApp</h1>
          {unreadCount > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              {unreadCount} mensaje{unreadCount !== 1 ? 's' : ''} no leído{unreadCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No hay conversaciones
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationClick(conversation.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {conversation.contact_name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {conversation.phone_number}
                    </div>
                  </div>
                  {conversation.unread_count > 0 && (
                    <div className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {conversation.unread_count}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(conversation.last_message_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Área principal del chat */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header de la conversación */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="text-lg font-semibold text-gray-900">
                    {selectedConversationData?.contact_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedConversationData?.phone_number}
                  </div>
                </div>
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedMessages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  No hay mensajes en esta conversación
                </div>
              ) : (
                selectedMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.source === 'kapso_agent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.source === 'kapso_agent'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <div className="text-sm">{message.content}</div>
                      <div className={`text-xs mt-1 ${
                        message.source === 'kapso_agent' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(message.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input para enviar mensajes */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Enviar
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-lg mb-2">Selecciona una conversación</div>
              <div className="text-sm">Elige una conversación del panel izquierdo para comenzar a chatear</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
