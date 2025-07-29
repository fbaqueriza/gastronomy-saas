'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WhatsAppMessage, Contact } from '../types/whatsapp';

interface ChatContextType {
  // Estado del chat
  selectedContact: Contact | null;
  messages: WhatsAppMessage[];
  unreadCounts: Record<string, number>;
  isChatOpen: boolean;
  messagesByContact: Record<string, WhatsAppMessage[]>;
  
  // Acciones
  setSelectedContact: (contact: Contact | null) => void;
  addMessage: (contactId: string, message: WhatsAppMessage) => void;
  markAsRead: (contactId: string) => void;
  openChat: (contact?: Contact) => void;
  closeChat: () => void;
  sendMessage: (contactId: string, content: string) => Promise<void>;
  
  // Estado de conexión
  isConnected: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [messagesByContact, setMessagesByContact] = useState<Record<string, WhatsAppMessage[]>>({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(true); // Siempre conectado en modo simulado
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');

  // Cargar mensajes desde localStorage al inicializar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('whatsapp-messages-by-contact');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const converted = Object.keys(parsed).reduce((acc, key) => {
            acc[key] = parsed[key].map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }));
            return acc;
          }, {} as Record<string, WhatsAppMessage[]>);
          setMessagesByContact(converted);
        } catch (error) {
          console.error('Error loading messages from localStorage:', error);
        }
      }
    }
  }, []);

  // Guardar mensajes en localStorage cuando cambien
  useEffect(() => {
    if (Object.keys(messagesByContact).length > 0) {
      try {
        localStorage.setItem('whatsapp-messages-by-contact', JSON.stringify(messagesByContact));
      } catch (error) {
        console.error('Error saving messages to localStorage:', error);
      }
    }
  }, [messagesByContact]);

  // Actualizar mensajes cuando cambie el contacto seleccionado
  useEffect(() => {
    if (selectedContact) {
      const contactMessages = messagesByContact[selectedContact.phone] || [];
      setMessages(contactMessages);
    } else {
      setMessages([]);
    }
  }, [selectedContact, messagesByContact]);

  // Función para agregar un mensaje
  const addMessage = useCallback((contactId: string, message: WhatsAppMessage) => {
    // Solo loggear en desarrollo y si es un mensaje nuevo
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 Agregando mensaje al contexto:', { contactId, messageId: message.id });
    }
    
    setMessagesByContact(prev => {
      const contactMessages = prev[contactId] || [];
      const existingIds = new Set(contactMessages.map(msg => msg.id));
      
      if (existingIds.has(message.id)) {
        // Solo loggear en desarrollo
        if (process.env.NODE_ENV === 'development') {
          console.log('⚠️ Mensaje duplicado, ignorando:', message.id);
        }
        return prev;
      }
      
      const updatedMessages = [...contactMessages, message].sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );
      
      // Solo loggear en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Mensaje agregado al contexto:', { contactId, messageCount: updatedMessages.length });
      }
      
      return {
        ...prev,
        [contactId]: updatedMessages
      };
    });

    // Incrementar contador de no leídos si es un mensaje recibido
    if (message.type === 'received') {
      setUnreadCounts(prev => ({
        ...prev,
        [contactId]: (prev[contactId] || 0) + 1
      }));
    }
  }, []);

  // Función para marcar como leído
  const markAsRead = useCallback((contactId: string) => {
    // Solo loggear en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('📖 Marcando como leído:', contactId);
    }
    setUnreadCounts(prev => ({
      ...prev,
      [contactId]: 0
    }));
  }, []);

  // Función para abrir el chat
  const openChat = useCallback((contact?: Contact) => {
    if (contact) {
      // Solo loggear en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log('🔓 Abriendo chat para:', contact.name, contact.phone);
      }
      setSelectedContact(contact);
      markAsRead(contact.phone);
    }
    setIsChatOpen(true);
  }, [markAsRead]);

  // Función para cerrar el chat
  const closeChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  // Función para enviar mensaje
  const sendMessage = useCallback(async (contactId: string, content: string) => {
    // Log temporal para debug
    console.log('🔍 DEBUG sendMessage:', { contactId, content, timestamp: new Date().toISOString() });
    
    // Solo loggear en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 sendMessage llamado con:', { contactId, content });
    }
    
    if (!content.trim()) {
      // Solo loggear en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ Contenido vacío, cancelando envío');
      }
      return;
    }

    const messageId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const message: WhatsAppMessage = {
      id: messageId,
      type: 'sent',
      content: content,
      timestamp: new Date(),
      status: 'sent',
    };

    // Solo loggear en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 Agregando mensaje al contexto:', message);
    }

    // Agregar mensaje inmediatamente
    addMessage(contactId, message);

    // Enviar mensaje a través de la API correcta
    try {
      // Solo loggear en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log('🌐 Enviando mensaje a la API:', { to: contactId, message: content });
      }
      
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: contactId,
          message: content
        }),
      });

      // Solo loggear en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log('📡 Respuesta de la API:', response.status, response.statusText);
      }

      const result = await response.json();
      
      // Solo loggear en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log('📋 Resultado de la API:', result);
      }

      if (result.success) {
        // Solo loggear en desarrollo
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Mensaje enviado exitosamente:', result);
        }
        
        // Actualizar estado del mensaje
        setMessagesByContact(prev => ({
          ...prev,
          [contactId]: (prev[contactId] || []).map(msg =>
            msg.id === messageId
              ? { ...msg, status: 'delivered' as const }
              : msg
          )
        }));
      } else {
        console.error('❌ Error sending message:', result.error);
        // Marcar mensaje como fallido
        setMessagesByContact(prev => ({
          ...prev,
          [contactId]: (prev[contactId] || []).map(msg =>
            msg.id === messageId
              ? { ...msg, status: 'failed' as const }
              : msg
          )
        }));
      }
    } catch (error) {
      console.error('💥 Error sending message:', error);
      // Marcar mensaje como fallido
      setMessagesByContact(prev => ({
        ...prev,
        [contactId]: (prev[contactId] || []).map(msg =>
          msg.id === messageId
            ? { ...msg, status: 'failed' as const }
            : msg
        )
      }));
    }
  }, [addMessage]);

  const value: ChatContextType = {
    selectedContact,
    messages,
    unreadCounts,
    isChatOpen,
    messagesByContact,
    setSelectedContact,
    addMessage,
    markAsRead,
    openChat,
    closeChat,
    sendMessage,
    isConnected,
    connectionStatus
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