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

interface WhatsAppChatProps {
  orderId: string;
  providerName: string;
  providerPhone: string;
  isOpen: boolean;
  onClose: () => void;
  orderStatus?: string; // Nuevo prop opcional para saber el estado del pedido
}

export default function WhatsAppChat({
  orderId,
  providerName,
  providerPhone,
  isOpen,
  onClose,
  orderStatus, // Nuevo prop
}: WhatsAppChatProps) {
  
  const [messages, setMessages] = useState<WhatsAppMessage[]>([
    {
      id: '1',
      type: 'sent',
      content: `Hola ${providerName}! Necesito hacer un pedido. ¿Podés confirmar disponibilidad?`,
      timestamp: new Date(Date.now() - 3600000),
      status: 'read',
    },
    {
      id: '2',
      type: 'received',
      content: '¡Hola! Sí, tenemos todo en stock. ¿Qué necesitás?',
      timestamp: new Date(Date.now() - 3500000),
    },
    {
      id: '3',
      type: 'sent',
      content: '¡Perfecto! Necesito:\n• 7kg Bife de Chorizo\n• 7kg Asado de Tira\n\n¿Me podés pasar el total?',
      timestamp: new Date(Date.now() - 3400000),
      status: 'delivered',
    },
    {
      id: '4',
      type: 'received',
      content: '¡Excelente! Acá tenés tu pedido:\n\n🥩 Bife de Chorizo: 7kg × $8.500 = $59.500\n🥩 Asado de Tira: 7kg × $7.200 = $50.400\n\nTotal: $109.900\n\n¿Cuándo necesitás la entrega?',
      timestamp: new Date(Date.now() - 3300000),
    },
    {
      id: '5',
      type: 'sent',
      content: 'Mañana a la mañana estaría perfecto. Por favor enviame la factura cuando esté lista.',
      timestamp: new Date(Date.now() - 3200000),
      status: 'sent',
    },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Si el chat está abierto y el pedido está en estado 'sent', agregar mensaje de factura mock si no existe
    if (isOpen && orderStatus === 'sent') {
      setMessages((prev) => {
        const alreadySent = prev.some(m => m.type === 'received' && m.content.includes('Descargar factura'));
        if (alreadySent) return prev;
        return [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'received',
            content: 'Adjunto la factura correspondiente a tu pedido. Puedes descargarla aquí: [Descargar factura](/mock-factura.pdf)',
            timestamp: new Date(),
          },
        ];
      });
    }
  }, [isOpen, orderStatus]);

  const handleSendMessage = () => {
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

    // Simulate provider response after 2 seconds
    setTimeout(() => {
      const responses = [
        '¡Perfecto! Ya procesamos tu pedido.',
        '¡Excelente! Te mando la factura en un rato.',
        '¡Pedido confirmado! La entrega será mañana a la mañana.',
        '¡Gracias! Te aviso cuando salga el camión.',
      ];
      
      const response: WhatsAppMessage = {
        id: (Date.now() + 1).toString(),
        type: 'received',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, response]);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-green-500 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-green-500 font-bold text-lg">
                  {providerName.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold">{providerName}</h3>
                <p className="text-sm text-green-100">{providerPhone}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-green-600 rounded-full">
                <Video className="h-5 w-5" />
              </button>
              <button className="p-2 hover:bg-green-600 rounded-full">
                <Phone className="h-5 w-5" />
              </button>
              <button className="p-2 hover:bg-green-600 rounded-full">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 bg-gray-100 p-4 overflow-y-auto">
          <div className="space-y-4">
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
                    {/* Renderizar enlaces en el mensaje */}
                    {message.content.includes('[Descargar factura]') ? (
                      <span>
                        Adjunto la factura correspondiente a tu pedido. Puedes descargarla aquí: <a href="/mock-factura.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Descargar factura</a>
                      </span>
                    ) : (
                      message.content
                    )}
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
                placeholder="Type a message..."
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

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-200"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
} 