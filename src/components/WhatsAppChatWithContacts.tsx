'use client';

import { useState, useRef, useEffect } from 'react';
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

interface WhatsAppChatWithContactsProps {
  providers: any[];
  onClose: () => void;
}

export default function WhatsAppChatWithContacts({
  providers,
  onClose
}: WhatsAppChatWithContactsProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
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

  // Cargar mensajes cuando se selecciona un contacto
  useEffect(() => {
    if (selectedContact) {
      const savedMessages = localStorage.getItem(`whatsapp-messages-${selectedContact.id}`);
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      } else {
        setMessages([]);
      }
    }
  }, [selectedContact]);

  // Guardar mensajes cuando cambien
  useEffect(() => {
    if (messages.length > 0 && selectedContact) {
      localStorage.setItem(`whatsapp-messages-${selectedContact.id}`, JSON.stringify(messages));
    }
  }, [messages, selectedContact]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    const message: WhatsAppMessage = {
      id: Date.now().toString(),
      type: 'sent',
      content: newMessage,
      timestamp: new Date(),
      status: 'sent',
    };

    setMessages((prev) => [...prev, message]);
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
        // Actualizar estado del mensaje
        setMessages((prev) =>
          prev.map(msg =>
            msg.id === message.id
              ? { ...msg, status: 'delivered' as const }
              : msg
          )
        );
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[700px] flex">
        {/* Panel izquierdo - Contactos */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Header de contactos */}
          <div className="bg-green-500 text-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">WhatsApp Business</h2>
              <button
                onClick={() => setShowAddContact(true)}
                className="p-2 hover:bg-green-600 rounded-full"
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
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-green-600 rounded-full"
                  >
                    <span className="text-white text-xl">×</span>
                  </button>
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