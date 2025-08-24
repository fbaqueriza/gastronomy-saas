'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Minimize2, Loader2 } from 'lucide-react';
import { useSupabaseRealtime } from '../hooks/useSupabaseRealtime';
import { getSupabaseClient } from '../lib/supabaseClient';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: string;
  conversation_id: string;
}

interface KapsoChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  phoneNumber?: string;
}

export default function KapsoChatWidget({ 
  isOpen, 
  onToggle, 
  phoneNumber = '5491135562673' 
}: KapsoChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hook para Supabase Realtime - escuchar cambios en mensajes
  const { data: realtimeMessages } = useSupabaseRealtime('messages', {
    select: '*',
    orderBy: { column: 'created_at', ascending: true }
  });

  // Cargar mensajes existentes
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const supabase = await getSupabaseClient();
        
        // Buscar conversación por número de teléfono
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .select('id')
          .eq('phone_number', phoneNumber)
          .single();
        
        if (convError && convError.code !== 'PGRST116') {
          console.error('Error cargando conversación:', convError);
          return;
        }
        
        if (conversation) {
          setConversationId(conversation.id);
          
          // Cargar mensajes de la conversación
          const { data: messagesData, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: true });
          
          if (messagesError) {
            console.error('Error cargando mensajes:', messagesError);
            return;
          }
          
          if (messagesData) {
            setMessages(messagesData.map((msg: any) => ({
              id: msg.id,
              content: msg.content,
              sender: msg.sender_type === 'whatsapp' ? 'user' : 'agent',
              timestamp: msg.created_at,
              conversation_id: msg.conversation_id
            })));
          }
        }
      } catch (error) {
        console.error('Error cargando mensajes:', error);
      }
    };

    if (isOpen) {
      loadMessages();
    }
  }, [isOpen, phoneNumber]);

  // Actualizar mensajes en tiempo real
  useEffect(() => {
    if (realtimeMessages && realtimeMessages.length > 0) {
      const newMessages = realtimeMessages
        .filter((msg: any) => msg.conversation_id === conversationId)
        .map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender_type === 'whatsapp' ? 'user' : 'agent',
          timestamp: msg.created_at,
          conversation_id: msg.conversation_id
        }));
      
      setMessages(newMessages);
    }
  }, [realtimeMessages, conversationId]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enviar mensaje
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    setIsLoading(true);
    const messageToSend = inputMessage;
    setInputMessage('');

    try {
      const supabase = await getSupabaseClient();
      
      // Crear o obtener conversación
      let currentConversationId = conversationId;
      
      if (!currentConversationId) {
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            phone_number: phoneNumber,
            contact_name: `Usuario ${phoneNumber}`,
            last_message_at: new Date().toISOString()
          })
          .select('id')
          .single();
        
        if (convError) {
          throw convError;
        }
        
        currentConversationId = newConversation.id;
        setConversationId(currentConversationId);
      }
      
      // Guardar mensaje en Supabase
      const { data: savedMessage, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: currentConversationId,
          content: messageToSend,
          sender_type: 'agent',
          sender_id: 'system',
          message_type: 'text',
          metadata: {
            source: 'widget',
            sent_via: 'kapso_ai'
          }
        })
        .select('*')
        .single();
      
      if (messageError) {
        throw messageError;
      }
      
      console.log('✅ Mensaje guardado en Supabase:', savedMessage);
      
      // Enviar mensaje a Kapso AI (opcional - para respuestas automáticas)
      try {
        await fetch('/api/kapso/send-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: phoneNumber,
            message: messageToSend,
            phoneNumberId: '670680919470999'
          }),
        });
      } catch (kapsoError) {
        console.log('⚠️ Error enviando a Kapso AI (no crítico):', kapsoError);
      }
      
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error);
      setInputMessage(messageToSend);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar Enter para enviar
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={onToggle}
          className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[500px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">Chat WhatsApp</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggle}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Inicia una conversación</p>
            <p className="text-sm">Los mensajes aparecerán aquí</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-green-600 text-white'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-gray-500' : 'text-green-100'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-1"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        
        {/* Status */}
        <div className="mt-2 text-xs text-gray-500 flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Conectado a Supabase Realtime</span>
        </div>
      </div>
    </div>
  );
}
