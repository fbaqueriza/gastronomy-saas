'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Phone, Video, MoreVertical } from 'lucide-react';

interface WhatsAppMessage {
  id: string;
  type: 'sent' | 'received';
  content: string;
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
}

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

interface WhatsAppChatProps {
  providerId: string;
  providerName: string;
  providerPhone: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function WhatsAppChat({
  providerId,
  providerName,
  providerPhone,
  isOpen,
  onClose
}: WhatsAppChatProps) {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar mensajes específicos para este proveedor
  useEffect(() => {
    const savedMessages = localStorage.getItem(`whatsapp-messages-${providerId}`);
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages);
      // Convertir timestamps de string a Date
      const messagesWithDates = parsedMessages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
      setMessages(messagesWithDates);
    }
  }, [providerId]);

  // Guardar mensajes cuando cambien
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`whatsapp-messages-${providerId}`, JSON.stringify(messages));
    }
  }, [messages, providerId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const message: WhatsAppMessage = {
      id: Date.now().toString(),
      type: 'sent',
      content: newMessage,
      timestamp: new Date(),
      status: 'sent',
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage('');

    // Enviar mensaje real a través de la API
    try {
      const response = await fetch('/api/whatsapp/test-send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          to: providerPhone, 
          message: newMessage 
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Actualizar estado del mensaje
        setMessages((prev) => 
          prev.map(msg => 
            msg.id === message.id 
              ? { ...msg, status: 'delivered' as const }
              : msg
          )
        );
      } else {
        console.error('Error sending message:', result.error);
        alert(`Error enviando mensaje: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error enviando mensaje');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-green-500 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-green-500 font-bold text-lg">
                  {providerName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold">{providerName}</h3>
                <p className="text-sm text-green-100">{providerPhone}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-green-600 rounded-full"
            >
              <span className="text-white text-xl">×</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 bg-gray-100 p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">💬</div>
                <p>No hay mensajes aún</p>
                <p className="text-sm">Comienza la conversación enviando un mensaje</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === 'sent'
                      ? 'bg-green-500 text-white'
                      : 'bg-white text-gray-800'
                  }`}
                >
                  <div className="whitespace-pre-line">
                    {message.content}
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      message.type === 'sent' ? 'text-green-100' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {message.type === 'sent' && message.status && (
                      <span className="ml-2">
                        {message.status === 'sent' && '✓'}
                        {message.status === 'delivered' && '✓✓'}
                        {message.status === 'read' && '✓✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="bg-white p-4 border-t">
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <Paperclip className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe un mensaje..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={1}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 