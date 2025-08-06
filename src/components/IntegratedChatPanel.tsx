'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip, Phone, Video, MoreVertical, Plus, Search, MessageSquare, UserPlus, X, FileText, Download, Image, File } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { WhatsAppMessage, Contact } from '../types/whatsapp';
import React from 'react'; // Added missing import for React

interface IntegratedChatPanelProps {
  providers: any[];
  isOpen: boolean;
  onClose: () => void;
}

// Componente optimizado para contactos
const ContactItem = React.memo(({ 
  contact, 
  isSelected, 
  onSelect 
}: { 
  contact: Contact; 
  isSelected: boolean; 
  onSelect: (contact: Contact) => void; 
}) => (
  <div
    onClick={() => onSelect(contact)}
    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
      isSelected ? 'bg-green-50 border-green-200' : ''
    }`}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{contact.name}</h3>
        <p className="text-sm text-gray-500 truncate">{contact.phone}</p>
        {contact.lastMessage && (
          <p className="text-xs text-gray-400 truncate mt-1">
            {contact.lastMessage}
          </p>
        )}
      </div>
      {contact.unreadCount && contact.unreadCount > 0 && (
        <span className="ml-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {contact.unreadCount}
        </span>
      )}
    </div>
  </div>
));

ContactItem.displayName = 'ContactItem';

export default function IntegratedChatPanel({
  providers,
  isOpen,
  onClose
}: IntegratedChatPanelProps) {
  const {
    selectedContact,
    messages,
    unreadCounts,
    setSelectedContact,
    addMessage,
    markAsRead,
    sendMessage,
    closeChat,
    isConnected,
    connectionStatus
  } = useChat();

  const [contacts, setContacts] = useState<Contact[]>([]);
  
  // Debug logs
  console.log('🔍 IntegratedChatPanel - Estado actual:', {
    selectedContact: selectedContact?.name || 'null',
    messagesCount: messages?.length || 0,
    contactsCount: contacts.length,
    isOpen
  });
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Función para cerrar el chat usando el contexto
  const handleClose = () => {
    closeChat();
    if (onClose) {
      onClose();
    }
  };

  // Convertir proveedores a contactos (optimizado)
  useEffect(() => {
    if (!providers || providers.length === 0) return;
    
    // Evitar re-renderizaciones innecesarias
    const providerContacts: Contact[] = providers.map(provider => {
      // Normalizar el número de teléfono - remover espacios y guiones, agregar + si no tiene
      let normalizedPhone = provider.phone || '';
      
      // Remover espacios, guiones y paréntesis
      normalizedPhone = normalizedPhone.replace(/[\s\-\(\)]/g, '');
      
      // Agregar + si no tiene
      if (!normalizedPhone.startsWith('+')) {
        normalizedPhone = `+${normalizedPhone}`;
      }
      
      // Solo loggear si el número cambió
      if (provider.phone !== normalizedPhone) {
        console.log(`📞 Normalizando teléfono: "${provider.phone}" -> "${normalizedPhone}"`);
      }
      
      return {
        id: provider.id,
        name: provider.name || 'Sin nombre',
        phone: normalizedPhone,
        lastMessage: '',
        lastMessageTime: new Date(),
        unreadCount: unreadCounts[normalizedPhone] || 0,
        providerId: provider.id,
        email: provider.email,
        address: provider.address,
        category: provider.category
      };
    });
    
    // Solo actualizar si los contactos realmente cambiaron
    const currentContactsString = JSON.stringify(contacts.map(c => ({ id: c.id, phone: c.phone })));
    const newContactsString = JSON.stringify(providerContacts.map(c => ({ id: c.id, phone: c.phone })));
    
    if (currentContactsString !== newContactsString) {
      setContacts(providerContacts);
    }
  }, [providers, unreadCounts]); // Mantener unreadCounts para actualizar contadores

  // Seleccionar automáticamente el primer contacto cuando se abre el chat
  useEffect(() => {
    if (isOpen && contacts.length > 0 && !selectedContact) {
      console.log('🔄 Auto-seleccionando primer contacto:', contacts[0]);
      setSelectedContact(contacts[0]);
    }
  }, [isOpen, contacts, selectedContact, setSelectedContact]);

  // Scroll al final de los mensajes (optimizado)
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    // Hacer scroll al final cuando se selecciona un contacto o hay nuevos mensajes
    if (selectedContact && messages && messages.length > 0) {
      // Pequeño delay para asegurar que el DOM se actualice
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [selectedContact, messages, scrollToBottom]);

  const handleSendMessage = async () => {
    console.log('🔍 DEBUG handleSendMessage - Iniciando:', { 
      newMessage: newMessage, 
      selectedContact: selectedContact,
      hasMessage: !!newMessage.trim(),
      hasContact: !!selectedContact
    });
    
    if (!newMessage.trim() || !selectedContact) {
      console.log('❌ handleSendMessage - No se puede enviar mensaje:', { 
        hasMessage: !!newMessage.trim(), 
        hasContact: !!selectedContact,
        messageLength: newMessage.length,
        contact: selectedContact 
      });
      return;
    }

    const messageToSend = newMessage.trim();
    console.log('📤 handleSendMessage - Enviando mensaje desde panel integrado:', { 
      message: messageToSend, 
      to: selectedContact.phone,
      contact: selectedContact 
    });
    
    // Limpiar el input inmediatamente para mejor UX
    setNewMessage('');
    console.log('🧹 handleSendMessage - Input limpiado inmediatamente');
    
    try {
      console.log('📞 handleSendMessage - Llamando a sendMessage con:', {
        contactId: selectedContact.phone,
        content: messageToSend
      });
      
      await sendMessage(selectedContact.phone, messageToSend);
      console.log('✅ handleSendMessage - Mensaje enviado exitosamente desde panel integrado');
    } catch (error) {
      console.error('💥 handleSendMessage - Error sending message from integrated panel:', error);
      // Restaurar el mensaje si falla
      setNewMessage(messageToSend);
      alert('Error al enviar mensaje. Inténtalo de nuevo.');
    }
  };

  const handleSendDocument = async (file: File) => {
    if (!selectedContact) return;

    setUploadingDocument(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('recipient', selectedContact.phone);

      const response = await fetch('/api/whatsapp/send-document', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Documento enviado:', result);
        
        // Agregar mensaje de documento al chat
        const documentMessage: WhatsAppMessage = {
          id: `doc-${Date.now()}`,
          type: 'sent',
          content: `Documento enviado: ${file.name}`,
          timestamp: new Date(),
          status: 'sent',
          documentUrl: result.documentUrl,
          documentName: file.name,
          documentSize: file.size,
          documentType: file.type
        };
        
        addMessage(selectedContact.phone, documentMessage);
      } else {
        throw new Error('Error al enviar documento');
      }
    } catch (error) {
      console.error('Error sending document:', error);
      alert('Error al enviar documento. Inténtalo de nuevo.');
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedContact) {
      handleSendDocument(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Solo enviar si hay mensaje y contacto seleccionado
      if (newMessage.trim() && selectedContact) {
        handleSendMessage();
      }
    }
  };

  const handleAddContact = () => {
    if (newContact.name && newContact.phone) {
      const contact: Contact = {
        id: Date.now().toString(),
        name: newContact.name,
        phone: newContact.phone,
        lastMessage: '',
        lastMessageTime: new Date(),
        unreadCount: 0
      };
      setContacts(prev => [...prev, contact]);
      setNewContact({ name: '', phone: '' });
      setShowAddContact(false);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[800px] bg-white shadow-xl flex flex-col z-50">
      {/* Header */}
      <div className="flex-shrink-0 bg-green-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-6 w-6" />
            <div>
              <h2 className="text-lg font-semibold">WhatsApp Business</h2>
              <p className="text-sm text-green-100">
                {connectionStatus === 'connected' ? '🟢 Conectado' : 
                 connectionStatus === 'connecting' ? '🟡 Conectando...' : '🔴 Desconectado'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-green-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Contactos */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Búsqueda */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar contactos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Lista de contactos */}
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.map((contact) => (
              <ContactItem
                key={contact.id}
                contact={contact}
                isSelected={selectedContact?.id === contact.id}
                onSelect={() => {
                  // Solo loggear en desarrollo
                  if (process.env.NODE_ENV === 'development') {
                    console.log('👆 Seleccionando contacto:', contact.name, contact.phone);
                  }
                  setSelectedContact(contact);
                  markAsRead(contact.phone);
                }}
              />
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="w-2/3 flex flex-col">
          {selectedContact ? (
            <>
              {/* Header del chat */}
              <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {selectedContact.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedContact.name}</h3>
                    <p className="text-sm text-gray-500">{selectedContact.phone}</p>
                  </div>
                </div>
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'sent'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      {message.documentUrl ? (
                        <div className="flex items-center space-x-2">
                          <File className="h-4 w-4" />
                          <span>{message.documentName}</span>
                          <a
                            href={message.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            Ver
                          </a>
                        </div>
                      ) : (
                        <p>{message.content}</p>
                      )}
                      <div className={`text-xs mt-1 flex items-center justify-between ${
                        message.type === 'sent' ? 'text-green-100' : 'text-gray-500'
                      }`}>
                        <span>
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {message.type === 'sent' && (
                          <span className="ml-2">
                            {message.status === 'sent' && '✓'}
                            {message.status === 'delivered' && '✓✓'}
                            {message.status === 'read' && '✓✓'}
                            {message.status === 'failed' && '❌'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex-shrink-0 p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    disabled={uploadingDocument}
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                  />
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Escribe un mensaje..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows={1}
                      style={{ minHeight: '40px', maxHeight: '120px' }}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || uploadingDocument}
                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Selecciona un contacto para comenzar a chatear</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}