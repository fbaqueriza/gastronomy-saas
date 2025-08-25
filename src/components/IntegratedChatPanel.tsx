'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip, Phone, Video, MoreVertical, Plus, Search, MessageSquare, X, FileText, Download, Image, File, Smile, Mic, RefreshCw, MessageCircle } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { useGlobalChat } from '../contexts/GlobalChatContext';
import { WhatsAppMessage, Contact } from '../types/whatsapp';
import React from 'react';
import WhatsAppStatusIndicator from './WhatsAppStatusIndicator';
// Función simplificada para normalizar números de teléfono
const normalizeContactIdentifier = (identifier: string): string => {
  if (!identifier) return '';
  
  // Remover todos los caracteres no numéricos excepto el +
  let normalized = identifier.replace(/[^\d+]/g, '');
  
  // Si no empieza con +, agregarlo
  if (!normalized.startsWith('+')) {
    normalized = '+' + normalized;
  }
  
  // Para números que ya tienen el formato correcto, devolverlos tal como están
  if (normalized.startsWith('+54') || normalized.startsWith('+67')) {
    return normalized;
  }
  
  // Si es un número local sin código de país, asumir Argentina
  if (normalized.startsWith('+') && normalized.length === 11) {
    return '+54' + normalized.substring(1);
  }
  
  return normalized;
};
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
    messagesByContact,
    sortedContacts,
    unreadCounts,
    markAsRead,
    sendMessage,
    closeChat,
    isConnected,
    connectionStatus,
    selectContact
  } = useChat();

  // Función para verificar si han pasado 24 horas desde el último mensaje
  const hanPasado24Horas = (): boolean => {
    if (!currentContact) return false;
    
    const normalizedPhone = normalizeContactIdentifier(currentContact.phone);
    const contactMessages = messagesByContact[normalizedPhone];
    
    if (!contactMessages || contactMessages.length === 0) {
      return true; // Si no hay mensajes, considerar que han pasado 24h
    }
    
    // Obtener el último mensaje enviado
    const lastSentMessage = contactMessages
      .filter(msg => msg.type === 'sent')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
    if (!lastSentMessage) {
      return true; // Si no hay mensajes enviados, considerar que han pasado 24h
    }
    
    const lastMessageTime = new Date(lastSentMessage.timestamp);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastMessageTime.getTime()) / (1000 * 60 * 60);
    
    return hoursDiff >= 24;
  };

  // Función para enviar inicializador de conversación
  const enviarInicializadorConversacion = async () => {
    if (!currentContact) return;
    
    try {
      const normalizedPhone = normalizeContactIdentifier(currentContact.phone);
      
      const response = await fetch('/api/whatsapp/trigger-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: normalizedPhone,
          template_name: 'inicializador_de_conv'
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('✅ Inicializador de conversación enviado exitosamente\n\nSe ha reiniciado la ventana de 24 horas. Ahora puedes enviar mensajes manuales.');
        // Recargar la página para mostrar el nuevo mensaje
        window.location.reload();
      } else {
        alert('❌ Error enviando inicializador: ' + (result.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error enviando inicializador:', error);
      alert('❌ Error enviando inicializador de conversación');
    }
  };

  // Función de debug para mostrar información de contactos
  const debugContactos = () => {
    const contactosInfo = {
      sortedContacts: sortedContacts.map(c => ({ phone: c.phone, name: c.name })),
      providers: providers.map(p => ({ phone: p.phone, name: p.name })),
      contacts: contacts.map(c => ({ phone: c.phone, name: c.name })),
      messagesByContact: Object.keys(messagesByContact)
    };
    
    console.log('🔍 DEBUG CONTACTOS:', contactosInfo);
    alert(`Contactos disponibles: ${contactosInfo.sortedContacts.length}\nProveedores: ${contactosInfo.providers.length}\nContactos finales: ${contactosInfo.contacts.length}\nRevisa la consola para más detalles.`);
  };

  const { isGlobalChatOpen, closeGlobalChat, currentGlobalContact } = useGlobalChat();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
  const currentContact = selectedContact; // Usar solo selectedContact del contexto de chat



  // Función para cerrar el chat usando el contexto global
  const handleClose = () => {
    closeGlobalChat();
    closeChat();
    if (onClose) onClose();
  };

  // Combinar proveedores con contactos de mensajes - CARGA CON ESTADO DE CARGA
  useEffect(() => {
    // Si no hay proveedores cargados, mantener estado de carga
    if (!providers || providers.length === 0) {
      setIsLoading(true);
      return;
    }

    const allContacts: Contact[] = [];
    
    // PASO 1: Incluir todos los contactos con mensajes (menos estricto)
    if (sortedContacts && sortedContacts.length > 0) {
      sortedContacts.forEach(contact => {
        // Incluir todos los contactos con mensajes, incluso si no tienen proveedor
        // Asegurar que el contacto tenga un id
        const contactWithId: Contact = {
          id: contact.phone || `contact_${Date.now()}_${Math.random()}`,
          name: contact.name,
          phone: contact.phone,
          lastMessage: contact.lastMessage,
          lastMessageTime: contact.lastMessageTime || new Date(),
          unreadCount: contact.unreadCount
        };
        allContacts.push(contactWithId);
      });
    }
    
    // PASO 2: Agregar todos los proveedores con nombres correctos
    providers.forEach(provider => {
      const normalizedPhone = normalizeContactIdentifier(provider.phone);
      const existingContact = allContacts.find(c => c.phone === normalizedPhone);
      
      if (!existingContact) {
        // Proveedor sin mensajes - agregarlo con nombre correcto
        const providerDisplayName = provider.contactName 
          ? `${provider.name} - ${provider.contactName}`
          : provider.name;
        
        allContacts.push({
          id: provider.id,
          name: providerDisplayName,
          phone: normalizedPhone,
          providerId: provider.id,
          lastMessage: '',
          lastMessageTime: new Date(),
          unreadCount: 0
        });
      } else {
        // Actualizar el nombre del contacto existente con el nombre del proveedor
        const providerDisplayName = provider.contactName 
          ? `${provider.name} - ${provider.contactName}`
          : provider.name;
        
        existingContact.name = providerDisplayName;
        existingContact.providerId = provider.id;
      }
    });
    
    setContacts(allContacts);
    setIsLoading(false);
    
  }, [sortedContacts, providers]);

  // Listener para seleccionar contactos desde botones externos
  useEffect(() => {
    const handleSelectContact = (event: CustomEvent) => {
      const { contact } = event.detail;
      if (contact && contact.phone) {
        // Buscar el contacto en la lista
        const foundContact = contacts.find(c => c.phone === contact.phone);
        if (foundContact) {
          selectContact(foundContact);
        }
      }
    };

    window.addEventListener('selectContact', handleSelectContact as EventListener);
    
    return () => {
      window.removeEventListener('selectContact', handleSelectContact as EventListener);
    };
  }, [contacts, selectContact]);

  // Seleccionar automáticamente el primer contacto cuando se abre el chat
  useEffect(() => {
    if (isPanelOpen && contacts.length > 0 && !currentContact) {
      selectContact(contacts[0]);
    }
  }, [isPanelOpen, contacts, currentContact?.phone, selectContact]);

  // Marcar como leído cuando cambia el contacto (optimizado)
  useEffect(() => {
    if (currentContact?.phone && isPanelOpen) {
      const normalizedPhone = normalizeContactIdentifier(currentContact.phone);
      markAsRead(normalizedPhone);
    }
  }, [currentContact?.phone, isPanelOpen, markAsRead]);

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

  // Scroll automático solo cuando se cambia de contacto o se abre el chat
  useEffect(() => {
    if (currentContact && messagesEndRef.current) {
      // Scroll inmediatamente al final sin animación
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ 
            behavior: 'instant',
            block: 'end',
            inline: 'nearest'
          });
        }
      }, 200); // Aumentar delay para asegurar que el DOM esté listo
    }
  }, [currentContact?.phone]); // Solo cuando cambia el contacto, no cuando cambian los mensajes

  // Scroll adicional cuando se abre el chat por primera vez
  useEffect(() => {
    if (isPanelOpen && currentContact && messagesEndRef.current) {
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ 
            behavior: 'instant',
            block: 'end',
            inline: 'nearest'
          });
        }
      }, 300);
    }
  }, [isPanelOpen, currentContact?.phone]); // Solo cuando se abre el panel o cambia el contacto

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
      // Scroll al final después de enviar el mensaje
      setTimeout(() => {
        scrollToBottom();
      }, 100);
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
        
        // Documento enviado exitosamente
        } else {
        throw new Error('Error al enviar documento');
      }
    } catch (error) {
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
              <NotificationPermission />
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
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500 text-sm">Cargando contactos...</p>
                </div>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No hay contactos disponibles</p>
                </div>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <ContactItem
                  key={contact.phone}
                  contact={contact}
                  isSelected={currentContact?.phone === contact.phone}
                  onSelect={() => {
                    selectContact(contact);
                  }}
                  unreadCount={unreadCounts[contact.phone] || 0}
                />
              ))
            )}
          </div>
                    </div>

        {/* Chat */}
        <div className="w-2/3 flex flex-col min-h-0">
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
                <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-gray-100">
                  {(() => {
                    const normalizedPhone = currentContact ? normalizeContactIdentifier(currentContact.phone) : '';
                    const contactMessages = currentContact && messagesByContact[normalizedPhone];
                    
                    return contactMessages?.map((message) => (
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
                         <p className="whitespace-pre-wrap">{message.content}</p>
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
                   ));
                 })()}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
              <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
                {/* Inicializador de conversación - Solo visible si han pasado 24h */}
                {hanPasado24Horas() && (
                  <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">
                            Ventana de 24 horas expirada
                          </p>
                          <p className="text-xs text-yellow-600">
                            No puedes enviar mensajes manuales. Usa el inicializador para reactivar la conversación.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={enviarInicializadorConversacion}
                        className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                        title="Reiniciar ventana de 24 horas para poder enviar mensajes manuales"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Reiniciar Conversación</span>
                      </button>
                    </div>
                  </div>
                )}
                
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
                placeholder={hanPasado24Horas() ? "No puedes enviar mensajes. Usa el inicializador arriba." : "Escribe un mensaje..."}
                      className={`w-full px-4 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        hanPasado24Horas() 
                          ? 'border-yellow-300 bg-yellow-50 text-gray-500' 
                          : 'border-gray-300'
                      }`}
                      rows={1}
                      style={{ minHeight: '40px', maxHeight: '120px' }}
                      disabled={hanPasado24Horas()}
              />
                  </div>
                  {newMessage.trim() && !hanPasado24Horas() ? (
              <button
                      onClick={handleSendMessage}
                      disabled={uploadingDocument}
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  ) : hanPasado24Horas() ? (
                    <button 
                      disabled
                      className="p-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                      title="No puedes enviar mensajes. Usa el inicializador para reactivar la conversación."
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