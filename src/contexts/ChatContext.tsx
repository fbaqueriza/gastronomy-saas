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
  syncMessagesFromDatabase: (contactId?: string) => Promise<void>;
  
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

  // Función para sincronizar mensajes desde la base de datos
  const syncMessagesFromDatabase = useCallback(async (contactId?: string) => {
    console.log('🔄 syncMessagesFromDatabase - Iniciando sincronización:', { contactId });
    
    // Evitar llamadas innecesarias si no hay contactId
    if (!contactId) {
      console.log('🛑 syncMessagesFromDatabase - No hay contactId, evitando llamada al endpoint');
      return;
    }
    
    try {
      // Obtener todos los mensajes para poder filtrar tanto enviados como recibidos
      const url = '/api/whatsapp/messages';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.error) {
        console.error('❌ syncMessagesFromDatabase - Error:', data.error);
        return;
      }
      
      console.log('📥 syncMessagesFromDatabase - Mensajes recibidos:', data.messages?.length || 0);
      
      // Filtrar mensajes relevantes para el contacto
      const relevantMessages = (data.messages || []).filter((dbMessage: any) => {
        if (!contactId) return true; // Si no hay contacto, mostrar todos
        
        // Incluir mensajes recibidos del contacto
        if (dbMessage.contact_id === contactId) return true;
        
        // Incluir mensajes enviados al contacto (cuando contact_id es el número de WhatsApp Business)
        if (dbMessage.contact_id === '670680919470999') return true;
        
        return false;
      });
      
      console.log('🔍 syncMessagesFromDatabase - Mensajes relevantes:', relevantMessages.length);
      
      // Convertir mensajes de la BD al formato del frontend
      const convertedMessages = relevantMessages.map((dbMessage: any) => {
        // Determinar si el mensaje es enviado o recibido basado en el campo 'contact_id'
        const isFromBusiness = dbMessage.contact_id === '670680919470999'; // Tu número de WhatsApp Business
        
        console.log('🔄 Conversión de mensaje:', {
          messageId: dbMessage.message_sid || dbMessage.id,
          contactId: dbMessage.contact_id,
          isFromBusiness,
          content: dbMessage.content?.substring(0, 30) + '...'
        });
        
        return {
          id: dbMessage.message_sid || dbMessage.id,
          type: isFromBusiness ? 'sent' : 'received',
          content: dbMessage.content,
          timestamp: new Date(dbMessage.timestamp || Date.now()),
          status: dbMessage.status || 'delivered'
        } as WhatsAppMessage;
      });
      
      console.log('🔄 syncMessagesFromDatabase - Mensajes convertidos:', convertedMessages.length);
      
      // Agrupar mensajes por contacto
      const messagesByContactNew: Record<string, WhatsAppMessage[]> = {};
      
      convertedMessages.forEach(message => {
        // Determinar el contacto basado en el tipo de mensaje
        const contactId = message.type === 'sent' ? '670680919470999' : message.id.split('_')[0];
        
        if (!messagesByContactNew[contactId]) {
          messagesByContactNew[contactId] = [];
        }
        messagesByContactNew[contactId].push(message);
      });
      
      // Ordenar mensajes por timestamp
      Object.keys(messagesByContactNew).forEach(contactId => {
        messagesByContactNew[contactId].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      });
      
      console.log('✅ syncMessagesFromDatabase - Mensajes sincronizados:', Object.keys(messagesByContactNew));
      
      setMessagesByContact(prev => ({
        ...prev,
        ...messagesByContactNew
      }));
      
      // Actualizar mensajes del contacto seleccionado
      if (selectedContact?.phone === contactId) {
        const contactMessages = messagesByContactNew[contactId] || [];
        setMessages(contactMessages);
        console.log('✅ syncMessagesFromDatabase - Mensajes actualizados para contacto seleccionado:', contactMessages.length);
      }
      
    } catch (error) {
      console.error('💥 syncMessagesFromDatabase - Error:', error);
    }
  }, [selectedContact?.phone]);

  // Cargar mensajes desde localStorage al inicializar y sincronizar con BD
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('🚀 ChatContext - Inicializando y sincronizando mensajes...');
      
      // Cargar desde localStorage
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
          console.log('✅ ChatContext - Mensajes cargados desde localStorage');
        } catch (error) {
          console.error('Error loading messages from localStorage:', error);
        }
      }
      
      // Sincronizar con la base de datos automáticamente
      const syncWithDatabase = async () => {
        try {
          console.log('🔄 ChatContext - Sincronizando con base de datos...');
          const response = await fetch('/api/whatsapp/messages');
          const data = await response.json();
          
          if (data.success && data.messages) {
            console.log('✅ ChatContext - Mensajes sincronizados desde BD:', data.messages.length);
            
            // Procesar y actualizar mensajes
            const processedMessages = data.messages.map((dbMessage: any) => {
              const isFromBusiness = dbMessage.contact_id === '670680919470999';
              return {
                id: dbMessage.message_sid || dbMessage.id,
                type: isFromBusiness ? 'sent' : 'received',
                content: dbMessage.content,
                timestamp: new Date(dbMessage.timestamp || Date.now()),
                status: dbMessage.status || 'delivered'
              } as WhatsAppMessage;
            });
            
            // Agrupar por contacto
            const messagesByContactMap: Record<string, WhatsAppMessage[]> = {};
            processedMessages.forEach(message => {
              const contactId = message.type === 'sent' ? '670680919470999' : message.id.split('_')[0];
              if (!messagesByContactMap[contactId]) {
                messagesByContactMap[contactId] = [];
              }
              messagesByContactMap[contactId].push(message);
            });
            
            // Ordenar por timestamp
            Object.keys(messagesByContactMap).forEach(contactId => {
              messagesByContactMap[contactId].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            });
            
            setMessagesByContact(messagesByContactMap);
            console.log('✅ ChatContext - Sincronización completa exitosa');
          }
        } catch (error) {
          console.error('❌ ChatContext - Error en sincronización:', error);
        }
      };
      
      // Ejecutar sincronización después de un breve delay
      setTimeout(syncWithDatabase, 1000);
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

  // Sincronización en tiempo real usando SSE
  useEffect(() => {
    console.log('🔌 ChatContext - Configurando SSE para sincronización en tiempo real...');
    
    const eventSource = new EventSource('/api/whatsapp/sse');
    
    eventSource.onopen = () => {
      console.log('✅ ChatContext - SSE conectado para sincronización en tiempo real');
    };
    
    eventSource.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 ChatContext - Mensaje SSE recibido:', data);
        
        if (data.type === 'whatsapp_message') {
          console.log('🔄 ChatContext - Sincronizando mensaje nuevo...');
          
          // Obtener todos los mensajes actualizados
          const response = await fetch('/api/whatsapp/messages');
          const messagesData = await response.json();
          
          if (messagesData.success && messagesData.messages) {
            const processedMessages = messagesData.messages.map((dbMessage: any) => {
              const isFromBusiness = dbMessage.contact_id === '670680919470999';
              return {
                id: dbMessage.message_sid || dbMessage.id,
                type: isFromBusiness ? 'sent' : 'received',
                content: dbMessage.content,
                timestamp: new Date(dbMessage.timestamp || Date.now()),
                status: dbMessage.status || 'delivered'
              } as WhatsAppMessage;
            });
            
            // Agrupar por contacto
            const messagesByContactMap: Record<string, WhatsAppMessage[]> = {};
            processedMessages.forEach(message => {
              const contactId = message.type === 'sent' ? '670680919470999' : message.id.split('_')[0];
              if (!messagesByContactMap[contactId]) {
                messagesByContactMap[contactId] = [];
              }
              messagesByContactMap[contactId].push(message);
            });
            
            // Ordenar por timestamp
            Object.keys(messagesByContactMap).forEach(contactId => {
              messagesByContactMap[contactId].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            });
            
            setMessagesByContact(messagesByContactMap);
            
            // Actualizar mensajes del contacto seleccionado si hay uno
            if (selectedContact) {
              const contactMessages = messagesByContactMap[selectedContact.phone] || [];
              setMessages(contactMessages);
              console.log('✅ ChatContext - Mensajes actualizados en tiempo real para contacto seleccionado:', contactMessages.length);
            }
            
            console.log('✅ ChatContext - Sincronización en tiempo real completada');
          }
        }
      } catch (error) {
        console.error('❌ ChatContext - Error procesando mensaje SSE:', error);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('❌ ChatContext - Error en SSE:', error);
    };
    
    return () => {
      console.log('🔌 ChatContext - Cerrando conexión SSE');
      eventSource.close();
    };
  }, [selectedContact]);

  // Actualizar mensajes cuando cambie el contacto seleccionado
  useEffect(() => {
    console.log('🔄 useEffect - Contacto seleccionado cambiado:', selectedContact);
    
    if (selectedContact) {
      console.log('✅ useEffect - Sincronizando mensajes para contacto:', selectedContact.phone);
      const contactMessages = messagesByContact[selectedContact.phone] || [];
      setMessages(contactMessages);
      
      // Sincronizar mensajes desde la BD cuando se selecciona un contacto
      // Solo sincronizar si no hay mensajes ya cargados para este contacto
      if (!messagesByContact[selectedContact.phone] || messagesByContact[selectedContact.phone].length === 0) {
        syncMessagesFromDatabase(selectedContact.phone);
      }
    } else {
      console.log('⚠️ useEffect - No hay contacto seleccionado, limpiando mensajes');
      setMessages([]);
    }
  }, [selectedContact, messagesByContact]); // Removido syncMessagesFromDatabase de las dependencias

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
    syncMessagesFromDatabase,
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