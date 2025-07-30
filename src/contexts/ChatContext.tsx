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
    console.log('📝 addMessage - Iniciando:', { contactId, messageId: message.id, messageType: message.type });
    
    setMessagesByContact(prev => {
      const contactMessages = prev[contactId] || [];
      const existingIds = new Set(contactMessages.map(msg => msg.id));
      
      console.log('📊 addMessage - Estado actual:', { 
        contactId, 
        existingMessages: contactMessages.length,
        existingIds: Array.from(existingIds)
      });
      
      if (existingIds.has(message.id)) {
        console.log('⚠️ addMessage - Mensaje duplicado, ignorando:', message.id);
        return prev;
      }
      
      const updatedMessages = [...contactMessages, message].sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );
      
      console.log('✅ addMessage - Mensaje agregado al contexto:', { 
        contactId, 
        messageCount: updatedMessages.length,
        newMessageId: message.id 
      });
      
      return {
        ...prev,
        [contactId]: updatedMessages
      };
    });

    // Incrementar contador de no leídos si es un mensaje recibido
    if (message.type === 'received') {
      console.log('📈 addMessage - Incrementando contador de no leídos para:', contactId);
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
    
    // Resetear contador de no leídos
    setUnreadCounts(prev => ({
      ...prev,
      [contactId]: 0
    }));
    
    // Marcar mensajes enviados como leídos cuando se abre el chat
    setMessagesByContact(prev => ({
      ...prev,
      [contactId]: (prev[contactId] || []).map(msg =>
        msg.type === 'sent' && msg.status === 'delivered'
          ? { ...msg, status: 'read' as const }
          : msg
      )
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
    console.log('🔍 DEBUG sendMessage - Iniciando envío:', { contactId, content });
    
    if (!contactId || !content.trim()) {
      console.error('❌ sendMessage - Parámetros inválidos:', { contactId, content });
      return;
    }

    // Normalizar número de teléfono
    let normalizedPhone = contactId.replace(/[\s\-\(\)]/g, '');
    if (!normalizedPhone.startsWith('+')) {
      normalizedPhone = `+${normalizedPhone}`;
    }
    
    console.log('📞 sendMessage - Teléfono normalizado:', { original: contactId, normalized: normalizedPhone });

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Crear mensaje temporal
    const tempMessage: WhatsAppMessage = {
      id: messageId,
      type: 'sent',
      content: content.trim(),
      timestamp: new Date(),
      status: 'sent'
    };

    console.log('📝 sendMessage - Mensaje temporal creado:', tempMessage);

    // Agregar mensaje al estado inmediatamente
    addMessage(normalizedPhone, tempMessage);
    
    console.log('✅ sendMessage - Mensaje agregado al estado local');

    try {
      console.log('🌐 sendMessage - Enviando a la API:', { to: normalizedPhone, message: content });
      
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: normalizedPhone,
          message: content
        }),
      });

      console.log('📡 sendMessage - Respuesta de la API:', response.status, response.statusText);

      const result = await response.json();
      
      console.log('📋 sendMessage - Resultado de la API:', result);

      if (result.success) {
        console.log('✅ sendMessage - Mensaje enviado exitosamente:', result);
        
        // Actualizar estado del mensaje a entregado
        setMessagesByContact(prev => ({
          ...prev,
          [normalizedPhone]: (prev[normalizedPhone] || []).map(msg =>
            msg.id === messageId
              ? { ...msg, status: 'delivered' as const }
              : msg
          )
        }));
        
        // Simular lectura después de 2 segundos (simulación de WhatsApp)
        setTimeout(() => {
          setMessagesByContact(prev => ({
            ...prev,
            [normalizedPhone]: (prev[normalizedPhone] || []).map(msg =>
              msg.id === messageId
                ? { ...msg, status: 'read' as const }
                : msg
            )
          }));
          console.log('📖 sendMessage - Mensaje marcado como leído:', messageId);
        }, 2000);
      } else {
        console.error('❌ sendMessage - Error sending message:', result.error);
        // Marcar mensaje como fallido
        setMessagesByContact(prev => ({
          ...prev,
          [normalizedPhone]: (prev[normalizedPhone] || []).map(msg =>
            msg.id === messageId
              ? { ...msg, status: 'failed' as const }
              : msg
          )
        }));
      }
    } catch (error) {
      console.error('💥 sendMessage - Error sending message:', error);
      // Marcar mensaje como fallido
      setMessagesByContact(prev => ({
        ...prev,
        [normalizedPhone]: (prev[normalizedPhone] || []).map(msg =>
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