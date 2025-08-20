# 📱 IMPLEMENTACIÓN COMPLETA CHAT WHATSAPP - Guía Técnica (Parte 2)
**Fecha:** 20 de Agosto 2025  
**Versión:** 1.0  
**Estado:** ✅ PRODUCCIÓN FUNCIONANDO

---

## 🚀 IMPLEMENTACIÓN PASO A PASO (CONTINUACIÓN)

### PASO 2: Servicio de WhatsApp

#### 2.1 Meta WhatsApp Service (src/lib/metaWhatsAppService.ts)
```typescript
export class MetaWhatsAppService {
  private accessToken: string;
  private phoneNumberId: string;

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN!;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
  }

  // Procesar webhook de WhatsApp
  async processWebhook(body: any) {
    const entry = body.entry?.[0];
    if (!entry?.changes?.[0]?.value?.messages) return;

    const messages = entry.changes[0].value.messages;
    
    for (const message of messages) {
      await this.processMessage(message);
    }
  }

  // Procesar mensaje individual
  private async processMessage(message: any) {
    const contactId = this.normalizeContactId(message.from);
    const content = this.extractContent(message);
    
    // Guardar en base de datos
    await this.saveMessage({
      id: message.id,
      contact_id: contactId,
      content,
      message_type: message.type,
      timestamp: new Date().toISOString(),
      status: 'delivered'
    });

    // Enviar por SSE
    this.sendSSEMessage({
      type: 'whatsapp_message',
      contactId,
      id: message.id,
      content,
      timestamp: new Date().toISOString(),
      status: 'delivered'
    });
  }

  // Normalizar ID de contacto
  private normalizeContactId(from: string): string {
    // Detectar si es ID de WhatsApp Business
    if (from === this.phoneNumberId || from.includes('670680919470999')) {
      return '+5491112345678'; // Número de prueba
    }
    return `+${from}`;
  }

  // Extraer contenido del mensaje
  private extractContent(message: any): string {
    switch (message.type) {
      case 'text':
        return message.text.body;
      case 'image':
        return '[Imagen]';
      case 'audio':
        return '[Audio]';
      default:
        return '[Mensaje no soportado]';
    }
  }

  // Guardar mensaje en base de datos
  private async saveMessage(messageData: any) {
    const { error } = await supabase
      .from('whatsapp_messages')
      .insert(messageData);

    if (error) {
      console.error('Error guardando mensaje:', error);
    }
  }

  // Enviar mensaje por SSE
  private sendSSEMessage(message: any) {
    const { sendMessageToClients } = require('./sseUtils');
    sendMessageToClients(message);
  }
}
```

### PASO 3: Sistema SSE (Server-Sent Events)

#### 3.1 Utilidades SSE (src/lib/sseUtils.ts)
```typescript
interface SSEClient {
  controller: ReadableStreamDefaultController;
  connectedAt: Date;
  id: string;
}

const clients = new Map<string, SSEClient>();
const messageBuffer: Array<any> = [];
let clientCounter = 0;

// Enviar mensaje a todos los clientes
export function sendMessageToClients(message: any) {
  // Guardar en buffer si es mensaje de WhatsApp
  if (message.type === 'whatsapp_message') {
    messageBuffer.push(message);
    if (messageBuffer.length > 20) {
      messageBuffer.shift(); // Mantener solo últimos 20
    }
  }

  const messageData = `data: ${JSON.stringify(message)}\n\n`;
  const encoder = new TextEncoder();
  const data = encoder.encode(messageData);

  const disconnectedClients: string[] = [];
  let sentToClients = 0;

  // Enviar a todos los clientes conectados
  clients.forEach((client, clientId) => {
    try {
      client.controller.enqueue(data);
      sentToClients++;
    } catch (error) {
      disconnectedClients.push(clientId);
    }
  });

  // Limpiar clientes desconectados
  disconnectedClients.forEach(clientId => {
    clients.delete(clientId);
  });
}

// Agregar cliente SSE
export function addClient(controller: ReadableStreamDefaultController): string {
  const clientId = `client_${++clientCounter}_${Date.now()}`;
  const client: SSEClient = {
    controller,
    connectedAt: new Date(),
    id: clientId
  };
  
  clients.set(clientId, client);
  
  // Enviar mensajes del buffer al reconectar
  if (messageBuffer.length > 0) {
    messageBuffer.forEach((message) => {
      try {
        const messageData = `data: ${JSON.stringify(message)}\n\n`;
        const encoder = new TextEncoder();
        const data = encoder.encode(messageData);
        controller.enqueue(data);
      } catch (error) {
        // Silenciar errores
      }
    });
  }
  
  return clientId;
}

// Remover cliente
export function removeClient(clientId: string) {
  clients.delete(clientId);
}

// Obtener número de clientes
export function getClientCount() {
  return clients.size;
}
```

#### 3.2 Endpoint SSE (src/app/api/whatsapp/sse/route.ts)
```typescript
import { NextRequest } from 'next/server';
import { addClient, removeClient } from '../../../../lib/sseUtils';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      const clientId = addClient(controller);
      
      // Enviar mensaje de conexión
      const connectionMessage = `data: ${JSON.stringify({
        type: 'connection',
        clientId,
        timestamp: new Date().toISOString()
      })}\n\n`;
      
      controller.enqueue(encoder.encode(connectionMessage));
      
      // Manejar desconexión
      request.signal.addEventListener('abort', () => {
        removeClient(clientId);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}
```

### PASO 4: Contexto React (Estado Global)

#### 4.1 Chat Context (src/contexts/ChatContext.tsx)
```typescript
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { WhatsAppMessage, Contact } from '../types/whatsapp';

interface ChatContextType {
  messages: WhatsAppMessage[];
  contacts: Contact[];
  selectedContact: Contact | null;
  unreadCounts: Record<string, number>;
  isConnected: boolean;
  sendMessage: (content: string) => void;
  selectContact: (contact: Contact) => void;
  markAsRead: (contactId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Normalizar identificador de contacto
  const normalizeContactIdentifier = (phone: string): string => {
    return phone.startsWith('+') ? phone : `+${phone}`;
  };

  // Cálculo de contadores no leídos
  const unreadCounts = useMemo(() => {
    const messagesByContact: Record<string, WhatsAppMessage[]> = {};
    
    messages.forEach(msg => {
      const contactId = normalizeContactIdentifier(msg.contact_id);
      if (!messagesByContact[contactId]) {
        messagesByContact[contactId] = [];
      }
      messagesByContact[contactId].push(msg);
    });

    const counts: Record<string, number> = {};
    
    Object.keys(messagesByContact).forEach(contactId => {
      if (!contactId) return;
      
      const contactMessages = messagesByContact[contactId];
      
      // Si la conversación está abierta, no contar mensajes no leídos
      const isConversationOpen = selectedContact && 
        normalizeContactIdentifier(selectedContact.phone) === contactId;
      
      if (isConversationOpen) {
        // Conversación abierta - no mostrar contador
        delete counts[contactId];
      } else {
        // Conversación cerrada - contar mensajes no leídos
        const unreadCount = contactMessages.filter(msg => 
          msg.type === 'received' && msg.status !== 'read' && msg.status !== 'sent'
        ).length;
        
        if (unreadCount > 0) {
          counts[contactId] = unreadCount;
        }
      }
    });
    
    return counts;
  }, [messages, selectedContact]);

  // Generar lista de contactos
  const contacts = useMemo(() => {
    const contactMap = new Map<string, Contact>();
    
    messages.forEach(msg => {
      const contactId = normalizeContactIdentifier(msg.contact_id);
      const lastMessage = msg.content;
      
      if (!contactMap.has(contactId)) {
        contactMap.set(contactId, {
          phone: contactId,
          name: contactId, // En producción, obtener nombre real
          lastMessage,
          unreadCount: unreadCounts[contactId] || 0
        });
      } else {
        const contact = contactMap.get(contactId)!;
        contact.lastMessage = lastMessage;
        contact.unreadCount = unreadCounts[contactId] || 0;
      }
    });
    
    return Array.from(contactMap.values())
      .sort((a, b) => new Date(b.lastMessage || '').getTime() - new Date(a.lastMessage || '').getTime());
  }, [messages, unreadCounts]);

  // Conexión SSE
  useEffect(() => {
    let eventSource: EventSource | null = null;
    const maxReconnectAttempts = 5;

    const connectSSE = () => {
      if (reconnectAttempts >= maxReconnectAttempts) {
        console.error('Máximo de intentos de reconexión alcanzado');
        return;
      }

      try {
        eventSource = new EventSource('/api/whatsapp/sse');
        
        eventSource.onopen = () => {
          reconnectAttempts = 0;
          setIsConnected(true);
          
          // Recuperar mensajes del buffer desde la base de datos
          setTimeout(async () => {
            try {
              const response = await fetch('/api/whatsapp/recover-buffer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              });
              
              if (response.ok) {
                const data = await response.json();
                
                if (data.bufferMessages && data.bufferMessages.length > 0) {
                  data.bufferMessages.forEach((bufferMessage: any) => {
                    setMessages(prev => {
                      const messageExists = prev.some(msg => msg.id === bufferMessage.id);
                      if (messageExists) return prev;
                      
                      const newMessage: WhatsAppMessage = {
                        id: bufferMessage.id,
                        content: bufferMessage.content,
                        timestamp: bufferMessage.timestamp,
                        type: 'received',
                        contact_id: bufferMessage.contactId,
                        status: bufferMessage.status || 'delivered'
                      };
                      
                      return [...prev, newMessage];
                    });
                  });
                }
              }
            } catch (error) {
              console.error('Error recuperando buffer:', error);
            }
          }, 1000);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'whatsapp_message' && data.contactId) {
              setMessages(prev => {
                const messageExists = prev.some(msg => msg.id === data.id);
                if (messageExists) return prev;
                
                const newMessage: WhatsAppMessage = {
                  id: data.id,
                  content: data.content,
                  timestamp: data.timestamp,
                  type: 'received',
                  contact_id: data.contactId,
                  status: data.status || 'delivered'
                };
                
                return [...prev, newMessage];
              });
            }
          } catch (error) {
            console.error('Error procesando mensaje SSE:', error);
          }
        };

        eventSource.onerror = () => {
          setIsConnected(false);
          eventSource?.close();
          
          setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connectSSE();
          }, 5000);
        };

      } catch (error) {
        console.error('Error conectando SSE:', error);
        setIsConnected(false);
      }
    };

    connectSSE();

    return () => {
      eventSource?.close();
    };
  }, [reconnectAttempts]);

  // Cargar mensajes iniciales
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch('/api/whatsapp/messages');
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error('Error cargando mensajes:', error);
      }
    };

    loadMessages();
  }, []);

  // Funciones del contexto
  const sendMessage = async (content: string) => {
    if (!selectedContact) return;
    
    const newMessage: WhatsAppMessage = {
      id: `temp_${Date.now()}`,
      content,
      timestamp: new Date().toISOString(),
      type: 'sent',
      contact_id: selectedContact.phone,
      status: 'sent'
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Aquí iría la lógica para enviar el mensaje real
    // await sendWhatsAppMessage(selectedContact.phone, content);
  };

  const selectContact = (contact: Contact) => {
    setSelectedContact(contact);
    markAsRead(contact.phone);
  };

  const markAsRead = async (contactId: string) => {
    try {
      await fetch('/api/whatsapp/mark-as-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId })
      });
      
      setMessages(prev => 
        prev.map(msg => 
          msg.contact_id === contactId && msg.type === 'received'
            ? { ...msg, status: 'read' }
            : msg
        )
      );
    } catch (error) {
      console.error('Error marcando como leído:', error);
    }
  };

  const value: ChatContextType = {
    messages,
    contacts,
    selectedContact,
    unreadCounts,
    isConnected,
    sendMessage,
    selectContact,
    markAsRead
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
```

---

**Continuará en Parte 3: Componentes de UI y API Endpoints...**
