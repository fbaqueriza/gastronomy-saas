# 📱 IMPLEMENTACIÓN COMPLETA CHAT WHATSAPP - Guía Técnica (Parte 3)
**Fecha:** 20 de Agosto 2025  
**Versión:** 1.0  
**Estado:** ✅ PRODUCCIÓN FUNCIONANDO

---

## 🚀 IMPLEMENTACIÓN PASO A PASO (CONTINUACIÓN)

### PASO 5: Componentes de la Interfaz

#### 5.1 Componente Principal (src/components/ChatInterface.tsx)
```typescript
import React from 'react';
import { useChat } from '../contexts/ChatContext';
import ContactList from './ContactList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

export default function ChatInterface() {
  const { selectedContact, isConnected } = useChat();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Lista de contactos */}
      <div className="w-1/3 bg-white border-r border-gray-200">
        <ContactList />
      </div>
      
      {/* Área de chat */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Header del chat */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedContact.name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold">{selectedContact.name}</h3>
                  <p className="text-sm text-gray-500">
                    {isConnected ? 'En línea' : 'Desconectado'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Lista de mensajes */}
            <div className="flex-1 overflow-y-auto">
              <MessageList />
            </div>
            
            {/* Input de mensaje */}
            <div className="bg-white border-t border-gray-200 p-4">
              <MessageInput />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Selecciona un contacto para comenzar a chatear</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

#### 5.2 Lista de Contactos (src/components/ContactList.tsx)
```typescript
import React from 'react';
import { useChat } from '../contexts/ChatContext';

export default function ContactList() {
  const { contacts, selectedContact, selectContact } = useChat();

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Chats</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {contacts.map((contact) => (
          <div
            key={contact.phone}
            onClick={() => selectContact(contact)}
            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
              selectedContact?.phone === contact.phone ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <h3 className="font-medium">{contact.name}</h3>
                  <p className="text-sm text-gray-500 truncate">
                    {contact.lastMessage}
                  </p>
                </div>
              </div>
              
              {contact.unreadCount > 0 && (
                <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {contact.unreadCount}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 5.3 Lista de Mensajes (src/components/MessageList.tsx)
```typescript
import React, { useEffect, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';

export default function MessageList() {
  const { messages, selectedContact } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!selectedContact) return null;

  const contactMessages = messages.filter(
    msg => msg.contact_id === selectedContact.phone
  );

  return (
    <div className="flex-1 p-4 space-y-4">
      {contactMessages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.type === 'sent'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            <p className="text-sm">{message.content}</p>
            <p className={`text-xs mt-1 ${
              message.type === 'sent' ? 'text-blue-100' : 'text-gray-500'
            }`}>
              {new Date(message.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
```

#### 5.4 Input de Mensaje (src/components/MessageInput.tsx)
```typescript
import React, { useState, KeyboardEvent } from 'react';
import { useChat } from '../contexts/ChatContext';

export default function MessageInput() {
  const { sendMessage, selectedContact } = useChat();
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && selectedContact) {
      sendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Escribe un mensaje..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={!selectedContact}
      />
      <button
        onClick={handleSend}
        disabled={!message.trim() || !selectedContact}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Enviar
      </button>
    </div>
  );
}
```

### PASO 6: API Endpoints

#### 6.1 Webhook de WhatsApp (src/app/api/whatsapp/webhook/route.ts)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { MetaWhatsAppService } from '../../../../lib/metaWhatsAppService';

const whatsAppService = new MetaWhatsAppService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verificar que es un webhook de WhatsApp
    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 });
    }

    // Procesar webhook
    await whatsAppService.processWebhook(body);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get('hub.mode');
  const token = request.nextUrl.searchParams.get('hub.verify_token');
  const challenge = request.nextUrl.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}
```

#### 6.2 Obtener Mensajes (src/app/api/whatsapp/messages/route.ts)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../../lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { data: messages, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .order('timestamp', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Error fetching messages' }, { status: 500 });
    }

    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

#### 6.3 Marcar como Leído (src/app/api/whatsapp/mark-as-read/route.ts)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../../lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { contactId } = await request.json();

    const { error } = await supabase
      .from('whatsapp_messages')
      .update({ status: 'read' })
      .eq('contact_id', contactId)
      .eq('message_type', 'received')
      .eq('status', 'delivered');

    if (error) {
      return NextResponse.json({ error: 'Error updating messages' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

#### 6.4 Buffer Persistente (src/app/api/whatsapp/recover-buffer/route.ts)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../../lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    // Obtener mensajes recientes que no han sido leídos
    const { data: messages, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('message_type', 'text') // Mensajes entrantes de WhatsApp
      .order('timestamp', { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json({ error: 'Error recuperando mensajes' }, { status: 500 });
    }

    // Transformar mensajes al formato SSE
    const bufferMessages = messages?.map(msg => ({
      type: 'whatsapp_message',
      contactId: msg.contact_id,
      id: msg.id,
      content: msg.content,
      timestamp: msg.timestamp,
      status: msg.status || 'delivered'
    })) || [];

    return NextResponse.json({
      success: true,
      bufferMessages,
      count: bufferMessages.length
    });

  } catch (error) {
    return NextResponse.json({ error: 'Error recuperando buffer' }, { status: 500 });
  }
}
```

#### 6.5 Limpieza de Base de Datos (src/app/api/whatsapp/cleanup-database/route.ts)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../../lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { data: messages, error: fetchError } = await supabase
      .from('whatsapp_messages')
      .select('*');

    if (fetchError) {
      return NextResponse.json({ error: 'Error fetching messages' }, { status: 500 });
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json({ message: 'No messages found' });
    }

    const messagesToUpdate = messages.filter((msg: any) =>
      msg.contact_id === '+670680919470999' ||
      msg.contact_id === '670680919470999'
    );

    if (messagesToUpdate.length === 0) {
      return NextResponse.json({ message: 'No messages to clean up' });
    }

    let successCount = 0;
    let errorCount = 0;

    for (const message of messagesToUpdate) {
      const { error: updateError } = await supabase
        .from('whatsapp_messages')
        .update({ contact_id: '+5491112345678' })
        .eq('id', message.id);

      if (updateError) {
        errorCount++;
      } else {
        successCount++;
      }
    }

    return NextResponse.json({
      message: `Database cleanup completed`,
      totalMessages: messages.length,
      messagesToUpdate: messagesToUpdate.length,
      updatedMessages: successCount,
      errors: errorCount
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### PASO 7: Página Principal

#### 7.1 Dashboard (src/app/dashboard/page.tsx)
```typescript
'use client';

import { ChatProvider } from '../../contexts/ChatContext';
import ChatInterface from '../../components/ChatInterface';

export default function DashboardPage() {
  return (
    <ChatProvider>
      <ChatInterface />
    </ChatProvider>
  );
}
```

---

## 🧪 TESTING

### 1. Test de Conexión SSE
```javascript
// En consola del navegador
const eventSource = new EventSource('/api/whatsapp/sse');
eventSource.onmessage = (event) => console.log('SSE:', JSON.parse(event.data));
```

### 2. Test de Webhook
```bash
# Simular webhook de WhatsApp
curl -X POST http://localhost:3001/api/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "test",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "5491141780300",
            "phone_number_id": "670680919470999"
          },
          "contacts": [{
            "profile": {"name": "Test User"},
            "wa_id": "5491135562673"
          }],
          "messages": [{
            "from": "5491135562673",
            "id": "test_message_id",
            "timestamp": "1755699439",
            "text": {"body": "Test message"},
            "type": "text"
          }]
        },
        "field": "messages"
      }]
    }]
  }'
```

### 3. Test de Base de Datos
```sql
-- Verificar mensajes
SELECT * FROM whatsapp_messages ORDER BY timestamp DESC LIMIT 10;

-- Verificar contadores
SELECT contact_id, COUNT(*) as total_messages,
       COUNT(CASE WHEN status = 'delivered' AND message_type = 'received' THEN 1 END) as unread
FROM whatsapp_messages 
GROUP BY contact_id;
```

---

## 🚀 DESPLIEGUE

### 1. Variables de Entorno de Producción
```env
# Supabase (producción)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=tu_access_token
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id
WHATSAPP_VERIFY_TOKEN=tu_verify_token

# Configuración
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

### 2. Build y Deploy
```bash
# Build de producción
npm run build

# Deploy (ejemplo con Vercel)
vercel --prod
```

### 3. Configurar Webhook en Producción
1. Actualizar URL del webhook en Meta Developer Console
2. Verificar que el webhook responde correctamente
3. Probar envío de mensajes

---

## ✅ CHECKLIST FINAL

### Desarrollo:
- [ ] Cliente Supabase configurado
- [ ] Servicio WhatsApp implementado
- [ ] Sistema SSE implementado
- [ ] Contexto React creado
- [ ] Componentes de UI implementados
- [ ] API endpoints creados

### Testing:
- [ ] Webhook funciona correctamente
- [ ] SSE conecta y recibe mensajes
- [ ] Mensajes se guardan en BD
- [ ] Contadores funcionan correctamente
- [ ] UI responde correctamente

### Producción:
- [ ] Variables de entorno de producción
- [ ] Build de producción exitoso
- [ ] Deploy completado
- [ ] Webhook actualizado en Meta
- [ ] Monitoreo configurado

---

**Estado:** ✅ DOCUMENTACIÓN COMPLETA  
**Última actualización:** 20 de Agosto 2025  
**Versión:** 1.0  
**Autor:** Sistema de Chat WhatsApp
