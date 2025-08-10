'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip, Phone, Video, MoreVertical, Plus, Search, MessageSquare, UserPlus } from 'lucide-react';

interface WhatsAppMessage {
  id: string;
  type: 'sent' | 'received';
  content: string;
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
}

interface WhatsAppIntegratedChatProps {
  providers: any[];
}

export default function WhatsAppIntegratedChat({
  providers
}: WhatsAppIntegratedChatProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [messagesByContact, setMessagesByContact] = useState<Record<string, WhatsAppMessage[]>>(() => {
    // Cargar desde localStorage al inicializar
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('whatsapp-messages-by-contact');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Convertir timestamps de string a Date
          const converted = Object.keys(parsed).reduce((acc, key) => {
            acc[key] = parsed[key].map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }));
            return acc;
          }, {} as Record<string, WhatsAppMessage[]>);
          return converted;
        } catch (error) {
          console.error('Error loading messages from localStorage:', error);
        }
      }
    }
    return {};
  });
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Convertir proveedores a contactos
  useEffect(() => {
    const providerContacts: Contact[] = providers.map(provider => ({
      id: provider.id,
      name: provider.name || 'Sin nombre',
      phone: provider.phone || '',
      lastMessage: '',
      lastMessageTime: new Date(),
      unreadCount: 0
    }));
    setContacts(providerContacts);
  }, [providers]);

  // Función para cargar mensajes desde la base de datos
  const loadMessagesFromDB = async (contactPhone: string) => {
    try {
  
      
      // Obtener todos los mensajes para poder filtrar tanto enviados como recibidos
      const response = await fetch('/api/whatsapp/messages');
      const data = await response.json();
      
      if (data.error) {
        console.error('❌ loadMessagesFromDB - Error:', data.error);
        setMessages([]);
        return;
      }
      
      console.log('📥 loadMessagesFromDB - Mensajes recibidos:', data.messages?.length || 0);
      
      // Filtrar mensajes relevantes para el contacto
      const relevantMessages = (data.messages || []).filter((dbMessage: any) => {
        // Incluir mensajes recibidos del contacto
        if (dbMessage.contact_id === contactPhone) return true;
        
        // Incluir mensajes enviados al contacto (cuando contact_id es el número de WhatsApp Business)
        if (dbMessage.contact_id === '670680919470999') return true;
        
        return false;
      });
      
      
      
      // Convertir mensajes de la BD al formato del frontend
      const dbMessages: WhatsAppMessage[] = relevantMessages.map((dbMessage: any) => {
        // Determinar si el mensaje es enviado o recibido basado en el campo 'contact_id'
        const isFromBusiness = dbMessage.contact_id === '670680919470999'; // Tu número de WhatsApp Business
        

        
        return {
          id: dbMessage.message_sid || dbMessage.id,
          type: isFromBusiness ? 'sent' : 'received',
          content: dbMessage.content,
          timestamp: new Date(dbMessage.timestamp || Date.now()),
          status: dbMessage.status || 'delivered'
        };
      });
      

      
      // Ordenar mensajes por timestamp
      dbMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      

      
      // Actualizar tanto el estado local como el persistente
      setMessages(dbMessages);
      setMessagesByContact(prev => ({
        ...prev,
        [contactPhone]: dbMessages
      }));
      
    } catch (error) {
      console.error('💥 loadMessagesFromDB - Error cargando mensajes de BD:', error);
      setMessages([]);
    }
  };

  // Estado para manejar la conexión SSE
  const [sseConnection, setSseConnection] = useState<EventSource | null>(null);
  const [sseConnected, setSseConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 segundos

  // Función para conectar SSE
  const connectSSE = useCallback((contactPhone: string) => {
    if (sseConnection) {
      sseConnection.close();
    }
    
    const eventSource = new EventSource(`/api/whatsapp/twilio/webhook?contactId=${contactPhone}`);
    
    eventSource.onopen = () => {
      setSseConnected(true);
      setReconnectAttempts(0); // Resetear intentos en conexión exitosa
    };
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Ignorar mensajes de prueba
        if (data.type === 'test') {
          return;
        }
        
        // Nuevo mensaje entrante
        const newMessage = {
          id: data.id,
          type: data.type as 'sent' | 'received',
          content: data.content,
          timestamp: new Date(data.timestamp),
          status: data.status as 'sent' | 'delivered' | 'read'
        };
        

        
        setMessages(prev => {
          // Evitar duplicados
          const existingIds = new Set(prev.map(msg => msg.id));
          if (existingIds.has(newMessage.id)) {
            return prev;
          }
          const updatedMessages = [...prev, newMessage];
          // Ordenar por timestamp
          updatedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
          
          return updatedMessages;
        });
        
        // Actualizar el estado persistente por separado
        setMessagesByContact(prev => {
          const contactMessages = prev[contactPhone] || [];
          const existingIds = new Set(contactMessages.map(msg => msg.id));
          
          if (existingIds.has(newMessage.id)) {
            console.log('⚠️ Mensaje duplicado en estado persistente, ignorando');
            return prev;
          }
          
          console.log('💾 Actualizando estado persistente');
          return {
            ...prev,
            [contactPhone]: [...contactMessages, newMessage].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
          };
        });
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('❌ Error en SSE:', error);
      setSseConnected(false);
      
      // Intentar reconectar si no hemos excedido el máximo de intentos
      if (reconnectAttempts < maxReconnectAttempts) {
        console.log(`🔄 Intentando reconectar en ${reconnectDelay/1000} segundos... (${reconnectAttempts + 1}/${maxReconnectAttempts})`);
        
        setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          if (selectedContact) {
            connectSSE(selectedContact.phone);
          }
        }, reconnectDelay);
      } else {
        console.log('❌ Máximo de intentos de reconexión alcanzado');
      }
    };
    
    setSseConnection(eventSource);
    return eventSource;
  }, [selectedContact, reconnectAttempts]);

  // Cargar mensajes cuando se selecciona un contacto
  useEffect(() => {
    if (selectedContact) {
  
      
      // Cargar mensajes del estado persistente
      const existingMessages = messagesByContact[selectedContact.phone] || [];
      setMessages(existingMessages);
      
      // Si no hay mensajes en el estado persistente, cargar desde BD
      if (existingMessages.length === 0) {
        console.log('📱 No hay mensajes en estado persistente, cargando desde BD');
        loadMessagesFromDB(selectedContact.phone);
      }
      
      // Conectar SSE
      const eventSource = connectSSE(selectedContact.phone);
      
      // Limpiar conexión cuando cambie el contacto
      return () => {
        console.log('🔌 Limpiando conexión SSE para:', selectedContact.phone);
        if (eventSource) {
          eventSource.close();
        }
        setSseConnected(false);
        setReconnectAttempts(0);
      };
    }
  }, [selectedContact?.phone]); // Removido connectSSE de las dependencias

  // Limpiar conexión al desmontar el componente
  useEffect(() => {
    return () => {
      if (sseConnection) {
        console.log('🔌 Limpiando conexión SSE al desmontar componente');
        sseConnection.close();
      }
    };
  }, [sseConnection]);

  // Guardar mensajes en localStorage cuando cambien
  useEffect(() => {
    if (Object.keys(messagesByContact).length > 0) {
      try {
        localStorage.setItem('whatsapp-messages-by-contact', JSON.stringify(messagesByContact));
        console.log('💾 Mensajes guardados en localStorage');
      } catch (error) {
        console.error('Error guardando mensajes en localStorage:', error);
      }
    }
  }, [messagesByContact]);







  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    const messageId = Date.now().toString();
    const message: WhatsAppMessage = {
      id: messageId,
      type: 'sent',
      content: newMessage,
      timestamp: new Date(),
      status: 'sent',
    };

    setMessages((prev) => {
      const updatedMessages = [...prev, message];
      return updatedMessages;
    });
    
    // Actualizar el estado persistente por separado
    setMessagesByContact(prev => ({
      ...prev,
      [selectedContact.phone]: [...(prev[selectedContact.phone] || []), message]
    }));
    setNewMessage('');

    // Enviar mensaje real a través de la API
    try {
      const response = await fetch('/api/whatsapp/test-send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: selectedContact.phone,
          message: newMessage
        }),
      });

      const result = await response.json();

      if (result.success) {
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
              contactId: selectedContact.phone,
              content: newMessage,
              messageType: 'sent',
              status: 'sent',
              userId: userId
            }),
          });
      
        } catch (error) {
          console.error('Error guardando mensaje enviado:', error);
        }

        // Actualizar estado del mensaje
        setMessages((prev) => {
          const updatedMessages = prev.map(msg =>
            msg.id === messageId
              ? { ...msg, status: 'delivered' as const }
              : msg
          );
          
          return updatedMessages;
        });
        
        // Actualizar el estado persistente por separado
        setMessagesByContact(prev => ({
          ...prev,
          [selectedContact.phone]: (prev[selectedContact.phone] || []).map(msg =>
            msg.id === messageId
              ? { ...msg, status: 'delivered' as const }
              : msg
          )
        }));
      } else {
        console.error('Error sending message:', result.error);
        alert(`Error enviando mensaje: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error enviando mensaje');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      alert('Por favor completa nombre y teléfono');
      return;
    }

    const contact: Contact = {
      id: `contact-${Date.now()}`,
      name: newContact.name,
      phone: newContact.phone,
      lastMessage: '',
      lastMessageTime: new Date(),
      unreadCount: 0
    };

    setContacts(prev => [...prev, contact]);
    setNewContact({ name: '', phone: '' });
    setShowAddContact(false);
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-xl h-[700px] flex">
      {/* Panel izquierdo - Contactos */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header de contactos */}
        <div className="bg-green-500 text-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Contactos</h2>
            <button
              onClick={() => setShowAddContact(true)}
              className="p-2 hover:bg-green-600 rounded-full"
              title="Agregar nuevo contacto"
            >
              <UserPlus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar contactos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Lista de contactos */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedContact?.id === contact.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
              }`}
              onClick={() => setSelectedContact(contact)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">
                    {contact.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {contact.name}
                    </h3>
                    {contact.unreadCount && contact.unreadCount > 0 && (
                      <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {contact.phone}
                  </p>
                  {contact.lastMessage && (
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {contact.lastMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel derecho - Chat */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Header del chat */}
            <div className="bg-green-500 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <span className="text-green-500 font-bold text-lg">
                      {selectedContact.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedContact.name}</h3>
                    <p className="text-sm text-green-100">{selectedContact.phone}</p>
                  </div>
                </div>
                {/* Indicador de estado SSE */}
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                  sseConnected 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    sseConnected ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span>{sseConnected ? 'Conectado' : 'Desconectado'}</span>
                  {!sseConnected && reconnectAttempts > 0 && (
                    <span className="text-xs">({reconnectAttempts}/{maxReconnectAttempts})</span>
                  )}
                </div>
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 bg-gray-100 p-4 overflow-y-auto">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">💬</div>
                    <p>No hay mensajes aún</p>
                    <p className="text-sm">Comienza la conversación enviando un mensaje</p>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'sent'
                          ? 'bg-green-500 text-white'
                          : 'bg-white text-gray-800'
                      }`}
                    >
                      <div className="whitespace-pre-line">
                        {message.content}
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          message.type === 'sent' ? 'text-green-100' : 'text-gray-500'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {message.type === 'sent' && message.status && (
                          <span className="ml-2">
                            {message.status === 'sent' && '✓'}
                            {message.status === 'delivered' && '✓✓'}
                            {message.status === 'read' && '✓✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="bg-white p-4 border-t">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-500 hover:text-gray-700">
                  <Paperclip className="h-5 w-5" />
                </button>
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe un mensaje..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={1}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Selecciona un contacto</h3>
              <p className="text-sm">Elige un contacto de la lista para comenzar a chatear</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal para agregar contacto */}
      {showAddContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Agregar nuevo contacto</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nombre del contacto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="+5491135562673"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddContact(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddContact}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 