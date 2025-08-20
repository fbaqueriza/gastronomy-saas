'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';

// Tipos
interface WhatsAppMessage {
  id: string;
  content: string;
  timestamp: string;
  type: 'sent' | 'received';
  contact_id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

interface Contact {
  phone: string;
  name: string;
  lastMessage?: string;
  unreadCount?: number;
}

interface ChatContextType {
  messages: WhatsAppMessage[];
  messagesByContact: { [contactId: string]: WhatsAppMessage[] };
  selectedContact: Contact | null;
  unreadCounts: { [contactId: string]: number };
  isConnected: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (contactId: string, content: string) => Promise<void>;
  markAsRead: (contactId: string) => Promise<void>;
  selectContact: (contact: Contact) => void;
  loadMessages: () => Promise<void>;
  forceReconnectSSE: () => void;
}

// Contexto
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Hook personalizado
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Función para normalizar identificadores de contacto
const normalizeContactIdentifier = (contactId: string): string => {
  if (!contactId) return '';
  let normalized = contactId.replace(/[\s\-\(\)]/g, '');
  if (!normalized.startsWith('+')) {
    normalized = `+${normalized}`;
  }
  return normalized;
};

// Provider
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Hook de notificaciones push
  const { sendNotification } = usePushNotifications();

  // Funciones de notificación push
  const sendWhatsAppNotification = useCallback((contactName: string, message: string) => {
    sendNotification({
      title: `Nuevo mensaje de ${contactName}`,
      body: message,
      icon: '/favicon.ico',
      actions: [
        { action: 'close', title: 'Cerrar' },
        { action: 'open', title: 'Abrir chat' }
      ]
    });
  }, [sendNotification]);

  // CARGAR MENSAJES - VERSIÓN SIMPLE DE LA GUÍA TÉCNICA
  const loadMessages = useCallback(async () => {
    try {
      const response = await fetch('/api/whatsapp/messages');
      const data = await response.json();
      
      if (data.messages && Array.isArray(data.messages)) {
        const transformedMessages = data.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          timestamp: msg.timestamp || msg.created_at,
          type: msg.message_type === 'text' ? 'received' : 'sent',
          contact_id: msg.contact_id || msg.from,
          status: msg.status || 'delivered'
        }));
        
        setMessages(transformedMessages);
      }
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    }
  }, []);

  const forceReconnectSSE = useCallback(() => {
    console.log('🔄 Forzando reconexión SSE...');
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }, []);

  // CARGAR MENSAJES INICIALES - VERSIÓN SIMPLE
  useEffect(() => {
    loadMessages();
    
    // Solicitar permisos de notificación
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [loadMessages]); // Solo ejecutar al montar

  // Recargar mensajes cuando se abre el chat si no hay mensajes
  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      loadMessages();
    }
  }, [isChatOpen, loadMessages, messages.length]);

  // CONEXIÓN SSE SIMPLE - VERSIÓN FUNCIONAL DE LA GUÍA TÉCNICA
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const baseReconnectDelay = 1000;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/whatsapp/sse');

        eventSource.onopen = () => {
          reconnectAttempts = 0;
          setIsConnected(true);
          setConnectionStatus('connected');
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Procesar mensajes de WhatsApp
            if (data.type === 'whatsapp_message' && data.contactId) {
              setMessages(prev => {
                const messageExists = prev.some(msg => msg.id === data.id);
                if (messageExists) {
                  return prev;
                }
                
                const newMessage: WhatsAppMessage = {
                  id: data.id,
                  content: data.content,
                  timestamp: data.timestamp,
                  type: 'received',
                  contact_id: data.contactId,
                  status: data.status || 'delivered'
                };
                
                // Notificación push solo si el chat no está abierto
                if (data.content && !isChatOpen) {
                  const contactName = data.contactId.replace('+', '');
                  sendWhatsAppNotification(contactName, data.content);
                }
                
                return [...prev, newMessage];
              });
            }
          } catch (error) {
            console.error('Error procesando mensaje SSE:', error);
          }
        };

        eventSource.onerror = (error) => {
          setIsConnected(false);
          setConnectionStatus('disconnected');
          
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          
          // Reconectar automáticamente
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            const delay = Math.min(3000, baseReconnectDelay * Math.pow(1.5, reconnectAttempts - 1));
            reconnectTimeout = setTimeout(connectSSE, delay);
          }
        };
      } catch (error) {
        console.error('Error al conectar SSE:', error);
      }
    };

    // Iniciar conexión
    connectSSE();

    // Cleanup al desmontar
    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []); // Sin dependencias para evitar reconexiones constantes

  // Función para enviar mensaje
  const sendMessage = useCallback(async (contactId: string, content: string) => {
    if (!content.trim()) return;

    const newMessage: WhatsAppMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      timestamp: new Date().toISOString(),
      type: 'sent',
      contact_id: contactId,
      status: 'sent'
    };

    // Agregar mensaje localmente inmediatamente
    setMessages(prev => [...prev, newMessage]);

    try {
      // Enviar mensaje al servidor
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: contactId,
          message: content.trim()
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Actualizar estado del mensaje
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id 
              ? { ...msg, status: 'delivered' as const }
              : msg
          )
        );
      } else {
        // Marcar como fallido si hay error
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id 
              ? { ...msg, status: 'failed' as const }
              : msg
          )
        );
      }
    } catch (error) {
    }
  }, []);

  // SOLUCIÓN INTEGRAL markAsRead - ACTUALIZACIÓN INMEDIATA Y PERSISTENTE
  const markAsRead = useCallback(async (contactId: string) => {
    
    // Usar la función unificada de normalización
    const normalizedContactId = normalizeContactIdentifier(contactId);
    
    try {
      // Actualizar estado local INMEDIATAMENTE
      setMessages(prev => {
        const updatedMessages = prev.map(msg => {
          const normalizedMsgContactId = normalizeContactIdentifier(msg.contact_id);
          const shouldMarkAsRead = normalizedMsgContactId === normalizedContactId && msg.type === 'received';
          
          return shouldMarkAsRead
            ? { ...msg, status: 'read' as const }
            : msg;
        });
        
        return updatedMessages;
      });

      // Actualizar en Supabase
      const response = await fetch('/api/whatsapp/mark-as-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactId: normalizedContactId
        }),
      });

      if (!response.ok) {
      } else {
      }
    } catch (error) {
    }
  }, [normalizeContactIdentifier]);

  // Función para seleccionar contacto
  const selectContact = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    // Marcar mensajes como leídos al seleccionar contacto
    markAsRead(contact.phone);
  }, [markAsRead]);

  // Función para abrir chat
  const openChat = useCallback(() => {
    setIsChatOpen(true);
  }, []);

  // Función para cerrar chat
  const closeChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  // Calcular mensajes agrupados por contacto
  const messagesByContact = useMemo(() => {
    const grouped: { [contactId: string]: WhatsAppMessage[] } = {};
    
    messages.forEach(message => {
      const contactId = normalizeContactIdentifier(message.contact_id);
      if (!grouped[contactId]) {
        grouped[contactId] = [];
      }
      grouped[contactId].push(message);
    });
    
    // Ordenar mensajes por timestamp
    Object.keys(grouped).forEach(contactId => {
      grouped[contactId].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    });
    
    return grouped;
  }, [messages]);

  // Calcular contadores de mensajes no leídos
  const unreadCounts = useMemo(() => {
    const counts: { [contactId: string]: number } = {};
    
    Object.keys(messagesByContact).forEach(contactId => {
      if (!contactId) return;
      const contactMessages = messagesByContact[contactId];
      const isConversationOpen = selectedContact &&
        normalizeContactIdentifier(selectedContact.phone) === contactId;

      if (isConversationOpen) {
        delete counts[contactId];
      } else {
        const unreadCount = contactMessages.filter(msg =>
          msg.type === 'received' && msg.status !== 'read' && msg.status !== 'sent'
        ).length;
        if (unreadCount > 0) {
          counts[contactId] = unreadCount;
        } else {
          delete counts[contactId];
        }
      }
    });
    
    return counts;
  }, [messages, selectedContact]);

  const value = useMemo(() => ({
    messages,
    messagesByContact,
    selectedContact,
    unreadCounts,
    isConnected,
    connectionStatus,
    isChatOpen,
    openChat,
    closeChat,
    sendMessage,
    markAsRead,
    selectContact,
    loadMessages,
    forceReconnectSSE
  }), [
    messages,
    messagesByContact,
    selectedContact,
    unreadCounts,
    isConnected,
    connectionStatus,
    isChatOpen,
    openChat,
    closeChat,
    sendMessage,
    markAsRead,
    selectContact,
    loadMessages,
    forceReconnectSSE
  ]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}