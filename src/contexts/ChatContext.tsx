'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { WhatsAppMessage, Contact } from '../types/whatsapp';
import { normalizePhoneNumber } from '../lib/phoneUtils';
import { sendWhatsAppNotification, requestNotificationPermission, areNotificationsEnabled } from '../lib/pushNotifications';

interface ChatContextType {
  messages: WhatsAppMessage[];
  setMessages: (messages: WhatsAppMessage[]) => void;
  messagesByContact: { [contactId: string]: WhatsAppMessage[] };
  setMessagesByContact: (messagesByContact: { [contactId: string]: WhatsAppMessage[] }) => void;
  selectedContact: Contact | null;
  currentContact: Contact | null;
  setSelectedContact: (contact: Contact | null) => void;
  unreadCounts: { [contactId: string]: number };
  markAsRead: (contactId: string) => void;
  isConnected: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (contactId: string, content: string) => Promise<void>;
  syncMessagesFromDatabase: () => Promise<void>;
  addMessage: (contactId: string, message: WhatsAppMessage) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Exportar el contexto para que otros componentes puedan usarlo
export { ChatContext };

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [messagesByContact, setMessagesByContact] = useState<{ [contactId: string]: WhatsAppMessage[] }>({});
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<{ [contactId: string]: number }>({});
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Solicitar permisos de notificación al inicializar (solo una vez)
  useEffect(() => {
    // Solo solicitar permisos si no se han solicitado antes
    if (Notification.permission === 'default') {
      requestNotificationPermission();
    }
  }, []); // Sin dependencias para evitar bucles

  // Funciones simples
  const openChat = useCallback((contact?: Contact) => {
    if (contact) {
      setSelectedContact(contact);
    }
    setIsChatOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  const sendMessage = async (contactId: string, content: string) => {
    try {
      // Crear mensaje local inmediatamente para UX
      const messageId = `msg_${Date.now()}`;
      const newMessage: WhatsAppMessage = {
        id: messageId,
        type: 'sent',
        content: content,
        timestamp: new Date(),
        status: 'sent'
      };

      // Agregar mensaje localmente
      addMessage(contactId, newMessage);

      // Enviar mensaje real a través de la API
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
              message_sid: messageId,
              contact_id: contactId,
              content: content,
              message_type: 'sent',
              status: 'delivered',
              user_id: userId
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

  const markAsRead = useCallback((contactId: string) => {
    console.log(`📖 Marcando mensajes como leídos para ${contactId}`);
    
    // Solo marcar como leído si hay mensajes no leídos
    setUnreadCounts(prev => {
      if (prev[contactId] && prev[contactId] > 0) {
        console.log(`📖 Marcando ${prev[contactId]} mensajes como leídos para ${contactId}`);
        
        // También marcar como leído en la base de datos
        fetch('/api/whatsapp/mark-as-read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ contactId }),
        }).catch(error => {
          console.error('❌ Error marcando como leído:', error);
        });
        
        return {
          ...prev,
          [contactId]: 0
        };
      }
      return prev;
    });
  }, []);

  const addMessage = useCallback((contactId: string, message: WhatsAppMessage) => {
    console.log('📨 ChatContext - addMessage llamado:', { contactId, message });
    
    setMessagesByContact(prev => {
      const currentMessages = prev[contactId] || [];
      const newMessages = [...currentMessages, message];
      
      console.log('📨 ChatContext - Mensajes actualizados para', contactId, ':', newMessages.length);
      
      return {
        ...prev,
        [contactId]: newMessages
      };
    });
  }, []);

  const syncMessagesFromDatabase = async () => {
    try {
      // console.log('🔄 Sincronizando mensajes...');
      const response = await fetch('/api/whatsapp/messages');
      
      if (!response.ok) {
        throw new Error(`Error al obtener mensajes: ${response.status}`);
      }

      const data = await response.json();
              // console.log('📥 API Response:', { success: data.success, messageCount: data.messages?.length || 0 });

      if (data.success && data.messages && Array.isArray(data.messages)) {
        const messagesByContactFromDB: { [contactId: string]: WhatsAppMessage[] } = {};

        data.messages.forEach((msg: any) => {
          // Usar contact_id si está disponible, sino usar from/to
          const contactId = msg.contact_id || (msg.from === '670680919470999' ? msg.to : msg.from);
          
          if (!contactId) {
            return;
          }

          const normalizedContactId = normalizePhoneNumber(contactId);

          if (!messagesByContactFromDB[normalizedContactId]) {
            messagesByContactFromDB[normalizedContactId] = [];
          }

          const whatsappMessage: WhatsAppMessage = {
            id: msg.id || msg.message_sid,
            type: msg.message_type === 'sent' ? 'sent' : 'received',
            content: msg.content,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(msg.created_at || Date.now()),
            status: msg.status || 'delivered'
          };

          messagesByContactFromDB[normalizedContactId].push(whatsappMessage);
        });

        // Ordenar mensajes por timestamp
        Object.keys(messagesByContactFromDB).forEach(contactId => {
          messagesByContactFromDB[contactId].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        });

                      // console.log('✅ Mensajes cargados:', Object.keys(messagesByContactFromDB).map(id => `${id}: ${messagesByContactFromDB[id].length} mensajes`));
        setMessagesByContact(messagesByContactFromDB);
      } else if (data.messages && Array.isArray(data.messages)) {
        // Formato alternativo sin 'success'
        // console.log('📋 Procesando mensajes (formato alternativo)...');
        const messagesByContactFromDB: { [contactId: string]: WhatsAppMessage[] } = {};

        data.messages.forEach((msg: any) => {
          const contactId = msg.contact_id || (msg.from === '670680919470999' ? msg.to : msg.from);
          if (!contactId) {
            return;
          }

          const normalizedContactId = normalizePhoneNumber(contactId);

          if (!messagesByContactFromDB[normalizedContactId]) {
            messagesByContactFromDB[normalizedContactId] = [];
          }

          const whatsappMessage: WhatsAppMessage = {
            id: msg.id || msg.message_sid,
            type: msg.message_type === 'sent' ? 'sent' : 'received',
            content: msg.content,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(msg.created_at || Date.now()),
            status: msg.status || 'delivered'
          };

          messagesByContactFromDB[normalizedContactId].push(whatsappMessage);
        });

        // Ordenar mensajes por timestamp
        Object.keys(messagesByContactFromDB).forEach(contactId => {
          messagesByContactFromDB[contactId].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        });

        console.log('📋 Mensajes organizados por contacto:', messagesByContactFromDB);
        setMessagesByContact(messagesByContactFromDB);
      } else {
        console.log('⚠️ No se recibieron mensajes válidos de la API');
        console.log('📋 Estructura de datos recibida:', JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.error('❌ Error sincronizando mensajes:', error);
    }
  };

  // useEffect simple para conexión
  // useEffect para cargar mensajes solo una vez al montar
  useEffect(() => {
    syncMessagesFromDatabase();
  }, []); // Solo se ejecuta una vez al montar

  // REFS para acceder a valores actuales sin dependencias
  const selectedContactRef = useRef(selectedContact);
  const isChatOpenRef = useRef(isChatOpen);
  
  // Actualizar refs cuando cambian los valores
  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);
  
  useEffect(() => {
    isChatOpenRef.current = isChatOpen;
  }, [isChatOpen]);
  
     // REFS para SSE (Server-Sent Events)
   const eventSourceRef = useRef<EventSource | null>(null);
   const isSSEActiveRef = useRef<boolean>(false);
   
   // SSE (Server-Sent Events) - SOLUCIÓN DEFINITIVA
   useEffect(() => {
     console.log('🔄 ChatContext - useEffect SSE ejecutándose...');
     console.log('🔄 ChatContext - isSSEActiveRef.current:', isSSEActiveRef.current);
     
     // Solo iniciar si no está activo
     if (isSSEActiveRef.current) {
       console.log('🔄 ChatContext - SSE ya está activo, saltando...');
       return;
     }
     
     console.log('🔄 ChatContext - Iniciando SSE para mensajes en tiempo real...');
     console.log('🔄 ChatContext - URL SSE:', '/api/whatsapp/sse');
     setConnectionStatus('connecting');
     setIsConnected(true);
     isSSEActiveRef.current = true;
     
     // Crear conexión SSE
     console.log('🔄 ChatContext - Creando EventSource...');
     const eventSource = new EventSource('/api/whatsapp/sse');
     console.log('🔄 ChatContext - EventSource creado:', eventSource);
     eventSourceRef.current = eventSource;
     
            // Manejar mensajes entrantes
       eventSource.onmessage = (event) => {
         try {
           const data = JSON.parse(event.data);
           console.log('📨 ChatContext - Mensaje SSE recibido (DETALLADO):', {
             type: data.type,
             from: data.from,
             contactId: data.contactId,
             content: data.content,
             id: data.id,
             timestamp: data.timestamp,
             fullData: data
           });
           
           if (data.type === 'whatsapp_message') {
             // Usar contactId si está disponible, sino normalizar from
             const contactId = data.contactId || normalizePhoneNumber(data.from);
             console.log('📨 ChatContext - ContactId extraído:', contactId);
             
             if (contactId) {
               const newMessage: WhatsAppMessage = {
                 id: data.id || `msg_${Date.now()}`,
                 type: 'received',
                 content: data.content || 'Mensaje sin contenido',
                 timestamp: new Date(data.timestamp || Date.now()),
                 status: data.status || 'delivered'
               };
               
               console.log('📨 ChatContext - Agregando mensaje desde SSE:', newMessage);
               
               setMessagesByContact(prev => {
                 const currentMessages = prev[contactId] || [];
                 const newMessages = [...currentMessages, newMessage];
                 console.log('📨 ChatContext - Mensajes actualizados para', contactId, ':', newMessages.length);
                 return { ...prev, [contactId]: newMessages };
               });
               
               // Incrementar contador si no estamos en la conversación activa
               const isCurrentConversation = selectedContactRef.current?.phone === contactId && isChatOpenRef.current;
               if (!isCurrentConversation) {
                 setUnreadCounts(prev => ({
                   ...prev,
                   [contactId]: (prev[contactId] || 0) + 1
                 }));
                 
                 if (areNotificationsEnabled()) {
                   const contactName = selectedContactRef.current?.name || 'Contacto';
                   sendWhatsAppNotification(contactName, newMessage.content);
                 }
               }
             } else {
               console.log('❌ ChatContext - No se pudo extraer contactId de:', data);
             }
           } else {
             console.log('📨 ChatContext - Mensaje SSE no es whatsapp_message:', data.type);
           }
         } catch (error) {
           console.error('❌ ChatContext - Error procesando mensaje SSE:', error);
         }
       };
     
     // Manejar conexión abierta
     eventSource.onopen = () => {
       console.log('🔔 ChatContext - SSE conectado exitosamente');
       setConnectionStatus('connected');
     };
     
     // Manejar errores
     eventSource.onerror = (error) => {
       console.error('❌ ChatContext - Error en SSE:', error);
       setConnectionStatus('disconnected');
       setIsConnected(false);
       isSSEActiveRef.current = false;
       
       // Reconexión automática después de 3 segundos
       setTimeout(() => {
         console.log('🔄 ChatContext - Intentando reconexión SSE...');
         if (eventSourceRef.current) {
           eventSourceRef.current.close();
         }
         isSSEActiveRef.current = false;
         // El useEffect se ejecutará nuevamente para reconectar
       }, 3000);
     };
     

     
     // Cleanup cuando el componente se desmonta
     return () => {
       console.log('🔌 ChatContext - Cleanup del SSE');
       if (eventSourceRef.current) {
         eventSourceRef.current.close();
         eventSourceRef.current = null;
       }
       isSSEActiveRef.current = false;
       setIsConnected(false);
       setConnectionStatus('disconnected');
     };
      }, []); // Se ejecuta inmediatamente al montar el componente

   // Reconexión automática cuando se pierde la conexión
   useEffect(() => {
     if (connectionStatus === 'disconnected' && !isSSEActiveRef.current) {
       console.log('🔄 ChatContext - Detectada desconexión, intentando reconectar...');
       // El useEffect principal se ejecutará nuevamente para reconectar
       setTimeout(() => {
         isSSEActiveRef.current = false;
       }, 1000);
     }
   }, [connectionStatus]);

   // Sincronización automática de mensajes - ELIMINADA para mensajes inmediatos
  // Los mensajes ahora llegan directamente por SSE sin necesidad de sincronización periódica
  // Esto elimina el delay y hace que los mensajes lleguen instantáneamente

  const value: ChatContextType = {
    messages,
    setMessages,
    messagesByContact,
    setMessagesByContact,
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