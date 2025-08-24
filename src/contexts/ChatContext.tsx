'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import supabase from '../lib/supabaseClient';

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
  sortedContacts: Contact[];
  selectedContact: Contact | null;
  unreadCounts: { [contactId: string]: number };
  totalUnreadCount: number;
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

  // CARGAR MENSAJES - VERSIÓN OPTIMIZADA CON NOTIFICACIONES
  const loadMessages = useCallback(async () => {
    try {
      const response = await fetch('/api/whatsapp/messages');
      const data = await response.json();
      
      if (data.messages && Array.isArray(data.messages)) {
        const transformedMessages = data.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          timestamp: msg.timestamp || msg.created_at,
          type: msg.message_type === 'sent' ? 'sent' : 'received',
          contact_id: msg.contact_id || msg.from,
          status: msg.status || 'delivered'
        }));
        
        // PRESERVAR MENSAJES LOCALES Y DETECTAR NUEVOS MENSAJES
        setMessages(prev => {
          const newMessages = [...transformedMessages];
          const hasNewMessages = newMessages.length !== prev.length || 
            newMessages.some((msg, index) => !prev[index] || msg.id !== prev[index].id);
          
          if (hasNewMessages) {
            return newMessages;
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, []);

  const forceReconnectSSE = useCallback(() => {
    console.log('🔄 Reconectando Supabase Realtime...');
    // Solo reconectar si hay problemas de conexión
    if (connectionStatus === 'disconnected') {
      window.location.reload();
    }
  }, [connectionStatus]);

  // CARGAR MENSAJES INICIALES Y POLLING OPTIMIZADO
  useEffect(() => {
    // Cargar inmediatamente
    loadMessages();
    
    // Solicitar permisos de notificación
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Listener para actualizar mensajes cuando se envía una orden
    const handleOrderSent = () => {
      setTimeout(() => {
        loadMessages();
      }, 1000);
    };

    window.addEventListener('orderSent', handleOrderSent);

                                       // Recargar cada 3 segundos para reducir carga y logs
       const interval = setInterval(() => {
         loadMessages();
       }, 3000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('orderSent', handleOrderSent);
    };
  }, []); // Remover loadMessages de las dependencias para evitar múltiples inicializaciones

  // SIMULAR CONEXIÓN EXITOSA - POLLING FUNCIONA
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Verificar si ya se inicializó para evitar múltiples instancias
    if (connectionStatus !== 'disconnected' || isConnected) return;
    
         // console.log('🔄 Iniciando sistema de mensajes con polling...');
     setConnectionStatus('connecting');
     
     // Simular conexión exitosa más rápido
     setTimeout(() => {
       setIsConnected(true);
       setConnectionStatus('connected');
       // console.log('✅ Sistema de mensajes conectado exitosamente');
     }, 500);
  }, []); // Solo ejecutar una vez al montar el componente

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
        
        // Guardar mensaje en base de datos después de envío exitoso
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          );
          
          const generateUUID = () => {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
              const r = Math.random() * 16 | 0;
              const v = c == 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
            });
          };
          
          await supabase.from('whatsapp_messages').insert({
            id: generateUUID(),
            message_sid: result.messageId || `msg_${Date.now()}`,
            from: process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID || '670680919470999',
            to: contactId,
            content: content.trim(),
            timestamp: new Date().toISOString(),
            status: 'sent',
            message_type: 'sent',
            user_id: 'default_user'
          });
        } catch (error) {
          console.error('Error saving message to DB:', error);
        }
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
      console.error('Error sending message:', error);
      // Marcar como fallido si hay error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'failed' as const }
            : msg
        )
      );
    }
  }, [loadMessages]);

  // SOLUCIÓN INTEGRAL markAsRead - ACTUALIZACIÓN INMEDIATA Y PERSISTENTE
  const markAsRead = useCallback(async (contactId: string) => {
    if (!contactId) return;
    
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

      // Actualizar en Supabase (solo una vez)
      const response = await fetch('/api/whatsapp/mark-as-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactId: normalizedContactId
        }),
      });

             if (response.ok) {
         const result = await response.json();
         // console.log('✅ Mensajes marcados como leídos para:', normalizedContactId);
       }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, []);

  // Función para seleccionar contacto
  const selectContact = useCallback((contact: Contact) => {
    // Solo marcar como leído si es un contacto diferente
    if (selectedContact && selectedContact.phone !== contact.phone) {
      markAsRead(selectedContact.phone);
    }
    
    setSelectedContact(contact);
    // Marcar mensajes como leídos del nuevo contacto
    markAsRead(contact.phone);
  }, [markAsRead, selectedContact]);

  // Función para abrir chat
  const openChat = useCallback(() => {
    setIsChatOpen(true);
  }, []);

  // Función para cerrar chat
  const closeChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  // Calcular mensajes agrupados por contacto y ordenar por última actividad
  const messagesByContact = useMemo(() => {
    const grouped: { [contactId: string]: WhatsAppMessage[] } = {};
    
    messages.forEach(message => {
      const contactId = normalizeContactIdentifier(message.contact_id);
      if (!grouped[contactId]) {
        grouped[contactId] = [];
      }
      grouped[contactId].push(message);
    });
    
    // Ordenar mensajes por timestamp dentro de cada contacto
    Object.keys(grouped).forEach(contactId => {
      grouped[contactId].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    });
    
    return grouped;
  }, [messages]);

  // Obtener contactos ordenados por última actividad - SOLO CONTACTOS VÁLIDOS
  const sortedContacts = useMemo(() => {
    const contacts: Contact[] = [];
    
    // Solo procesar si tenemos mensajes válidos
    if (!messages || messages.length === 0) {
      return contacts;
    }
    
    Object.entries(messagesByContact).forEach(([contactId, contactMessages]) => {
      if (contactMessages.length === 0) return;
      
      // Filtrar el contacto de prueba (ambas versiones)
      if (contactId === '+5491112345678' || contactId === '5491112345678') {
        return;
      }
      
      // Solo incluir contactos argentinos válidos
      if (!contactId.includes('+549')) {
        return;
      }
      
      // Obtener el último mensaje para determinar la última actividad
      const lastMessage = contactMessages[contactMessages.length - 1];
      
      // Contar mensajes no leídos
      const unreadCount = contactMessages.filter(msg =>
        msg.type === 'received' && msg.status !== 'read'
      ).length;
      
      // No generar nombres temporales - dejar que IntegratedChatPanel los maneje
      const phoneNumber = contactId.replace('+', '');
      contacts.push({
        phone: contactId,
        name: `Contacto ${phoneNumber.slice(-4)}`, // Nombre temporal básico
        lastMessage: lastMessage.content,
        unreadCount: unreadCount > 0 ? unreadCount : undefined
      });
    });
    
    // Ordenar por timestamp del último mensaje (más reciente primero)
    return contacts.sort((a, b) => {
      const aMessages = messagesByContact[a.phone];
      const bMessages = messagesByContact[b.phone];
      
      if (!aMessages.length || !bMessages.length) return 0;
      
      const aLastMessage = aMessages[aMessages.length - 1];
      const bLastMessage = bMessages[bMessages.length - 1];
      
      return new Date(bLastMessage.timestamp).getTime() - new Date(aLastMessage.timestamp).getTime();
    });
  }, [messagesByContact, messages]);

  // Calcular contadores de mensajes no leídos - VERSIÓN CORREGIDA
  const unreadCounts = useMemo(() => {
    const counts: { [contactId: string]: number } = {};
    
    Object.entries(messagesByContact).forEach(([contactId, contactMessages]) => {
      if (!contactId) return;
      
      // Filtrar el contacto de prueba
      if (contactId === '+5491112345678' || contactId === '5491112345678') return;
      
      // Solo incluir contactos argentinos válidos
      if (!contactId.includes('+549')) return;
      
      // Contar solo mensajes recibidos que no están leídos
      const unreadCount = contactMessages.filter(msg =>
        msg.type === 'received' && msg.status !== 'read'
      ).length;
      
      if (unreadCount > 0) {
        counts[contactId] = unreadCount;
      }
    });
    
         // Log temporal para debug (solo si hay cambios)
     // if (Object.keys(counts).length > 0) {
     //   console.log('🔢 Contadores no leídos calculados:', counts);
     // }
    
    return counts;
  }, [messagesByContact, messages]);

  // Calcular total de mensajes no leídos para la navegación
  const totalUnreadCount = useMemo(() => {
    return Object.values(unreadCounts).reduce((total, count) => total + count, 0);
  }, [unreadCounts]);

  const value = useMemo(() => ({
    messages,
    messagesByContact,
    sortedContacts,
    selectedContact,
    unreadCounts,
    totalUnreadCount,
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
    sortedContacts,
    selectedContact,
    unreadCounts,
    totalUnreadCount,
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