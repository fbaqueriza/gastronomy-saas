'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip, Phone, Video, MoreVertical, Plus, Search, MessageSquare, UserPlus, X, FileText, Download, Image, File, Smile, Mic, RefreshCw } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { useGlobalChat } from '../contexts/GlobalChatContext';
import { WhatsAppMessage, Contact } from '../types/whatsapp';
import React from 'react';
import WhatsAppStatusIndicator from './WhatsAppStatusIndicator';
import { normalizePhoneNumber, phoneNumbersMatch } from '../lib/phoneUtils';
import NotificationPermission from './NotificationPermission';

interface IntegratedChatPanelProps {
  providers: any[];
  isOpen: boolean;
  onClose: () => void;
}

// Componente optimizado para contactos
const ContactItem = React.memo(({ 
  contact, 
  isSelected, 
  onSelect,
  unreadCount
}: { 
  contact: Contact; 
  isSelected: boolean; 
  onSelect: (contact: Contact) => void;
  unreadCount: number;
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
      {unreadCount > 0 && (
        <span className="ml-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </div>
  </div>
));

ContactItem.displayName = 'ContactItem';

// Componente para mostrar estados de mensaje como WhatsApp
const MessageStatus = ({ status }: { status: 'sent' | 'delivered' | 'read' | 'failed' }) => {
  if (status === 'failed') {
    return <span className="text-red-500">❌</span>;
  }
  
  return (
    <span className="text-gray-400">
      {status === 'sent' && '✓'}
      {status === 'delivered' && '✓✓'}
      {status === 'read' && '✓✓'}
    </span>
  );
};

export default function IntegratedChatPanel({
  providers,
  isOpen,
  onClose
}: IntegratedChatPanelProps) {
  
  const {
    selectedContact,
    messages,
    setMessages,
    messagesByContact,
    unreadCounts,
    setSelectedContact,
    addMessage,
    markAsRead,
    sendMessage,
    closeChat,
    isConnected,
    connectionStatus,
    setMessagesByContact
  } = useChat();

  const { isGlobalChatOpen, closeGlobalChat, currentGlobalContact } = useGlobalChat();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Usar el estado global del chat
  const isPanelOpen = isGlobalChatOpen || isOpen;
  const currentContact = currentGlobalContact || selectedContact;



  // Función para cerrar el chat usando el contexto global
  const handleClose = () => {
    closeGlobalChat();
    closeChat();
    if (onClose) onClose();
  };

  // Convertir proveedores a contactos (optimizado)
  useEffect(() => {
    if (providers && providers.length > 0) {
      const providerContacts: Contact[] = providers.map(provider => {
        const normalizedPhone = normalizePhoneNumber(provider.phone);
        
        return {
          id: provider.id,
          name: provider.name || 'Sin nombre',
          phone: normalizedPhone,
          lastMessage: provider.lastMessage || '',
          lastMessageTime: provider.lastMessageTime ? new Date(provider.lastMessageTime) : new Date(),
          unreadCount: provider.unreadCount || 0,
          providerId: provider.id,
          email: provider.email,
          address: provider.address,
          category: provider.category
        };
      });
      
      setContacts(providerContacts);
    }
  }, [providers]); // Solo depende de providers

  // Seleccionar automáticamente el primer contacto cuando se abre el chat
  useEffect(() => {
    if (isPanelOpen && contacts.length > 0 && !currentContact) {
      setSelectedContact(contacts[0] as any);
    }
  }, [isPanelOpen, contacts, currentContact?.id, setSelectedContact]);

  // Sincronizar mensajes cuando cambia el contacto
  useEffect(() => {
    if (currentContact?.phone) {
      const normalizedPhone = normalizePhoneNumber(currentContact.phone);
      const contactMessages = messagesByContact[normalizedPhone] || [];
      
      setMessages(contactMessages);
      markAsRead(normalizedPhone);
    } else {
      setMessages([]);
    }
  }, [currentContact?.phone, messagesByContact, setMessages, markAsRead]);

  // Scroll al final de los mensajes (optimizado)
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  }, []);

  // Scroll automático cuando cambian los mensajes o se abre el chat
  useEffect(() => {
    if (currentContact && messages && messages.length > 0) {
      // Scroll inmediatamente sin delay
      scrollToBottom();
      
      // Scroll adicional después de un breve delay para asegurar que se renderice
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [currentContact, messages.length, isPanelOpen, scrollToBottom]);

  // Auto-resize del textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [newMessage]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentContact) {
      return;
    }

    const messageToSend = newMessage.trim();
    
    // Limpiar el input inmediatamente para mejor UX
    setNewMessage('');
    
    try {
      await sendMessage(currentContact.phone, messageToSend);
    } catch (error) {
      // Restaurar el mensaje si falla
      setNewMessage(messageToSend);
      alert('Error al enviar mensaje. Inténtalo de nuevo.');
    }
  };

  const handleSendDocument = async (file: File) => {
    if (!currentContact) return;

    setUploadingDocument(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('recipient', currentContact.phone);

      const response = await fetch('/api/whatsapp/send-document', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        
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
        
        addMessage(currentContact.phone, documentMessage);
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
    if (file && currentContact) {
      handleSendDocument(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (newMessage.trim() && currentContact) {
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

  if (!isPanelOpen) {
    return null;
  }

  return (
    <div className="fixed inset-y-0 right-0 w-[800px] bg-white shadow-xl flex flex-col z-50">
      {/* Header */}
      <div className="flex-shrink-0 bg-green-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-6 w-6" />
            <div>
              <h2 className="text-lg font-semibold">WhatsApp Business</h2>
              <WhatsAppStatusIndicator className="text-green-100" />
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
                isSelected={currentContact?.id === contact.id}
                onSelect={() => {
                  setSelectedContact(contact as any);
                  // Marcar como leído solo cuando se selecciona el contacto
                  markAsRead(normalizePhoneNumber(contact.phone));
                }}
                unreadCount={unreadCounts[normalizePhoneNumber(contact.phone)] || 0}
              />
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="w-2/3 flex flex-col">
          {currentContact ? (
            <>
              {/* Header del chat */}
              <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {currentContact.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{currentContact.name}</h3>
                    <p className="text-sm text-gray-500">{currentContact.phone}</p>
                    {isTyping && (
                      <p className="text-xs text-green-600 mt-1">escribiendo...</p>
                    )}
                  </div>
                                     <div className="flex items-center space-x-2">
                     <NotificationPermission />
                     <button 
                       onClick={async () => {
                         try {
                           const response = await fetch('/api/whatsapp/sse-status');
                           const data = await response.json();
                           console.log('📊 Estado SSE:', data);
                           alert(`Clientes SSE conectados: ${data.clientCount}`);
                         } catch (error) {
                           console.error('❌ Error verificando SSE:', error);
                         }
                       }}
                       className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                       title="Verificar estado SSE"
                     >
                       <MessageSquare className="h-4 w-4" />
                     </button>
                     <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                       <Phone className="h-4 w-4" />
                     </button>
                     <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                       <Video className="h-4 w-4" />
                     </button>
                     <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                       <MoreVertical className="h-4 w-4" />
                     </button>
                   </div>
                </div>
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'sent'
                          ? 'bg-green-500 text-white'
                          : 'bg-white text-gray-900 shadow-sm'
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
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                      <div className={`text-xs mt-1 flex items-center justify-between ${
                        message.type === 'sent' ? 'text-green-100' : 'text-gray-500'
                      }`}>
                        <span>
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {message.type === 'sent' && (
                          <MessageStatus status={message.status || 'sent'} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
                <div className="flex items-end space-x-2">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    disabled={uploadingDocument}
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <div className="flex-1 relative">
                    <textarea
                      ref={textareaRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Escribe un mensaje..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows={1}
                      style={{ minHeight: '40px', maxHeight: '120px' }}
                    />
                  </div>
                  {newMessage.trim() ? (
                    <button
                      onClick={handleSendMessage}
                      disabled={uploadingDocument}
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  ) : (
                    <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                      <Mic className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                />
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