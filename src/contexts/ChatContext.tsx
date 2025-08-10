'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { normalizePhoneNumber, phoneNumbersMatch } from '../lib/phoneUtils';

export interface WhatsAppMessage {
  id: string;
  type: 'sent' | 'received';
  content: string;
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
  documentUrl?: string;
  documentName?: string;
  documentSize?: number;
  documentType?: string;
}

export interface WhatsAppContact {
  id: string;
  phone: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  providerId?: string;
  email?: string;
  address?: string;
  category?: string;
}

interface ChatContextType {
  messages: WhatsAppMessage[];
  setMessages: (messages: WhatsAppMessage[]) => void;
  messagesByContact: { [contactId: string]: WhatsAppMessage[] };
  selectedContact: WhatsAppContact | null;
  currentContact: WhatsAppContact | null;
  setSelectedContact: (contact: WhatsAppContact | null) => void;
  unreadCounts: { [contactId: string]: number };
  markAsRead: (contactId: string) => void;
  isConnected: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  isChatOpen: boolean;
  openChat: (contact?: WhatsAppContact) => void;
  closeChat: () => void;
  sendMessage: (contactId: string, content: string) => Promise<void>;
  syncMessagesFromDatabase: () => Promise<void>;
  addMessage: (contactId: string, message: WhatsAppMessage) => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [messagesByContact, setMessagesByContact] = useState<{ [contactId: string]: WhatsAppMessage[] }>({});
  const [selectedContact, setSelectedContact] = useState<WhatsAppContact | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<{ [contactId: string]: number }>({});
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Funciones simples
  const openChat = (contact?: WhatsAppContact) => {
    if (contact) {
      setSelectedContact(contact);
    }
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  const sendMessage = async (contactId: string, content: string) => {
    try {
      console.log('📤 ChatContext: Enviando mensaje:', { contactId, content });
      
      // Crear mensaje local inmediatamente para UX
      const messageId = `msg_${Date.now()}`;
      const newMessage: WhatsAppMessage = {
        id: messageId,
        type: 'sent',
        content: content,
        timestamp: new Date(),
        status: 'sent'
      };

      console.log('➕ ChatContext: Agregando mensaje local:', newMessage);
      // Agregar mensaje localmente
      addMessage(contactId, newMessage);

      // Enviar mensaje real a través de la API
      console.log('🌐 ChatContext: Enviando a API:', { to: contactId, message: content });
      const response = await fetch('/api/whatsapp/test-send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: contactId,
          message: content
        }),
      });

      const result = await response.json();
      console.log('📥 ChatContext: Respuesta de API:', result);

      if (result.success) {
        // Actualizar estado del mensaje a entregado
        setMessagesByContact(prev => ({
          ...prev,
          [contactId]: (prev[contactId] || []).map(msg =>
            msg.id === messageId
              ? { ...msg, status: 'delivered' as const }
              : msg
          )
        }));

        // Guardar mensaje en base de datos
        const userId = localStorage.getItem('currentUserId') || 'default-user';
        try {
          await fetch('/api/whatsapp/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messageSid: messageId,
              contactId: contactId,
              content: content,
              messageType: 'sent',
              status: 'delivered',
              userId: userId
            }),
          });
        } catch (error) {
          console.error('Error guardando mensaje:', error);
        }
      } else {
        // Marcar mensaje como fallido
        setMessagesByContact(prev => ({
          ...prev,
          [contactId]: (prev[contactId] || []).map(msg =>
            msg.id === messageId
              ? { ...msg, status: 'failed' as const }
              : msg
          )
        }));
        throw new Error(result.error || 'Error enviando mensaje');
      }
    } catch (error) {
      console.error('Error en sendMessage:', error);
      throw error;
    }
  };

  const markAsRead = (contactId: string) => {
    setUnreadCounts(prev => ({
      ...prev,
      [contactId]: 0
    }));
  };

  const addMessage = (contactId: string, message: WhatsAppMessage) => {
    console.log('➕ ChatContext: addMessage llamado:', { contactId, messageId: message.id });
    setMessagesByContact(prev => {
      const currentMessages = prev[contactId] || [];
      const newMessages = [...currentMessages, message];
      console.log(`📊 ChatContext: Mensajes para ${contactId}: ${currentMessages.length} → ${newMessages.length}`);
      return {
        ...prev,
        [contactId]: newMessages
      };
    });
  };

  const syncMessagesFromDatabase = async () => {
    try {
      console.log('🔄 ChatContext: Sincronizando mensajes desde BD...');
      const response = await fetch('/api/whatsapp/messages');
      if (!response.ok) {
        throw new Error('Error al obtener mensajes');
      }

      const data = await response.json();

      if (data.messages && Array.isArray(data.messages)) {
        const messagesByContactFromDB: { [contactId: string]: WhatsAppMessage[] } = {};

        data.messages.forEach((msg: any) => {
          const contactId = msg.from === '670680919470999' ? msg.to : msg.from;
          if (!contactId) return;

          const normalizedContactId = normalizePhoneNumber(contactId);

          if (!messagesByContactFromDB[normalizedContactId]) {
            messagesByContactFromDB[normalizedContactId] = [];
          }

          const whatsappMessage: WhatsAppMessage = {
            id: msg.id,
            type: msg.from === '670680919470999' ? 'sent' : 'received',
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            status: 'delivered'
          };

          messagesByContactFromDB[normalizedContactId].push(whatsappMessage);
        });

        // Ordenar mensajes por timestamp
        Object.keys(messagesByContactFromDB).forEach(contactId => {
          messagesByContactFromDB[contactId].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        });

        console.log('📊 ChatContext: Mensajes de BD:', Object.keys(messagesByContactFromDB).map(k => `${k}: ${messagesByContactFromDB[k].length}`));
        
        // Solo actualizar si no hay mensajes locales para evitar sobrescribir
        setMessagesByContact(prev => {
          const merged = { ...prev };
          
          Object.keys(messagesByContactFromDB).forEach(contactId => {
            // Solo agregar mensajes de BD si no existen localmente
            const existingMessages = prev[contactId] || [];
            const dbMessages = messagesByContactFromDB[contactId];
            
            // Filtrar mensajes que ya existen localmente
            const newMessages = dbMessages.filter(dbMsg => 
              !existingMessages.some(existingMsg => existingMsg.id === dbMsg.id)
            );
            
            if (newMessages.length > 0) {
              merged[contactId] = [...existingMessages, ...newMessages];
              console.log(`➕ ChatContext: Agregados ${newMessages.length} mensajes de BD para ${contactId}`);
            }
          });
          
          return merged;
        });

        // Actualizar mensajes del contacto seleccionado si existe
        if (selectedContact?.phone && messagesByContactFromDB[selectedContact.phone]) {
          setMessages(messagesByContactFromDB[selectedContact.phone]);
        }
      }
    } catch (error) {
      console.error('Error sincronizando mensajes:', error);
    }
  };

  // useEffect simple para conexión
  useEffect(() => {
    setIsConnected(true);
    setConnectionStatus('connected');
  }, []);

  // useEffect para cargar mensajes
  useEffect(() => {
    console.log('🔄 ChatContext: Iniciando carga de mensajes...');
    syncMessagesFromDatabase();
  }, []);

  // useEffect para conexión SSE con reconexión automática
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    
    const connectSSE = () => {
      try {
        console.log('🔌 ChatContext: Iniciando conexión SSE...');
        eventSource = new EventSource('/api/whatsapp/sse');
        
        eventSource.onopen = () => {
          console.log('✅ ChatContext: SSE conectado exitosamente');
          setIsConnected(true);
          setConnectionStatus('connected');
        };
        
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Ignorar mensajes de ping y conexión
            if (data.type === 'ping' || data.type === 'connection') {
              return;
            }
            
            // Procesar mensaje de WhatsApp
            if (data.type === 'whatsapp_message') {
              console.log('📨 ChatContext: Mensaje recibido via SSE:', data);
              const rawContactId = data.contactId || data.from;
              const contactId = normalizePhoneNumber(rawContactId);
              
              if (contactId) {
                const newMessage: WhatsAppMessage = {
                  id: data.id || `sse_${Date.now()}`,
                  type: 'received',
                  content: data.content || data.message || '',
                  timestamp: new Date(data.timestamp || Date.now()),
                  status: 'delivered'
                };
                
                console.log('➕ ChatContext: Agregando mensaje recibido:', newMessage);
                addMessage(contactId, newMessage);
                
                // Incrementar contador de no leídos
                setUnreadCounts(prev => ({
                  ...prev,
                  [contactId]: (prev[contactId] || 0) + 1
                }));
              }
            }
          } catch (error) {
            console.error('❌ ChatContext: Error procesando mensaje SSE:', error);
          }
        };
        
        eventSource.onerror = (error) => {
          console.error('❌ ChatContext: Error en conexión SSE:', error);
          setIsConnected(false);
          setConnectionStatus('disconnected');
          
          // Reconectar automáticamente después de 3 segundos
          if (eventSource) {
            eventSource.close();
            eventSource = null;
            
            reconnectTimeout = setTimeout(() => {
              console.log('🔄 ChatContext: Reconectando SSE automáticamente...');
              connectSSE();
            }, 3000);
          }
        };
        
        eventSource.onclose = () => {
          console.log('🔌 ChatContext: Conexión SSE cerrada, reconectando...');
          setIsConnected(false);
          setConnectionStatus('disconnected');
          
          // Reconectar automáticamente después de 1 segundo
          reconnectTimeout = setTimeout(() => {
            console.log('🔄 ChatContext: Reconectando SSE después de cierre...');
            connectSSE();
          }, 1000);
        };
        
      } catch (error) {
        console.error('❌ ChatContext: Error creando conexión SSE:', error);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // Reconectar automáticamente después de 3 segundos
        reconnectTimeout = setTimeout(() => {
          console.log('🔄 ChatContext: Reconectando SSE...');
          connectSSE();
        }, 3000);
      }
    };
    
    // Iniciar conexión
    connectSSE();
    
    // Cleanup
    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  const value: ChatContextType = {
    messages,
    setMessages,
    messagesByContact,
    selectedContact,
    currentContact: selectedContact,
    setSelectedContact,
    unreadCounts,
    markAsRead,
    isConnected,
    connectionStatus,
    isChatOpen,
    openChat,
    closeChat,
    sendMessage,
    syncMessagesFromDatabase,
    addMessage
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}