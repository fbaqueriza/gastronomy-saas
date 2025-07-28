'use client';

import { useState, useEffect } from 'react';
import WhatsAppChat from '@/components/WhatsAppChat';

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export default function WhatsAppDashboardPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar contactos desde localStorage o crear algunos de ejemplo
  useEffect(() => {
    const savedContacts = localStorage.getItem('whatsapp-contacts');
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    } else {
      // Contactos de ejemplo
      const defaultContacts: Contact[] = [
        {
          id: '1',
          name: 'Cliente Ejemplo',
          phoneNumber: '+5491135562673',
          lastMessage: 'Hola, ¿tienen delivery?',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0
        }
      ];
      setContacts(defaultContacts);
      localStorage.setItem('whatsapp-contacts', JSON.stringify(defaultContacts));
    }
  }, []);

  const addContact = (name: string, phoneNumber: string) => {
    // Verificar que el número no esté duplicado
    const existingContact = contacts.find(c => c.phoneNumber === phoneNumber);
    if (existingContact) {
      alert('Ya existe un contacto con este número de teléfono');
      return;
    }

    const newContact: Contact = {
      id: phoneNumber, // Usar el número como ID único
      name,
      phoneNumber,
      unreadCount: 0
    };
    
    const updatedContacts = [...contacts, newContact];
    setContacts(updatedContacts);
    localStorage.setItem('whatsapp-contacts', JSON.stringify(updatedContacts));
  };

  const sendMessage = async (to: string, message: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/whatsapp/test-send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, message }),
      });

      const result = await response.json();

      if (result.success) {
        // Actualizar último mensaje en el contacto
        const updatedContacts = contacts.map(contact => 
          contact.phoneNumber === to 
            ? { 
                ...contact, 
                lastMessage: message,
                lastMessageTime: new Date().toISOString()
              }
            : contact
        );
        setContacts(updatedContacts);
        localStorage.setItem('whatsapp-contacts', JSON.stringify(updatedContacts));
        
        return { success: true, messageId: result.messageId };
      } else {
        throw new Error(result.details || 'Error enviando mensaje');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-green-600 text-white p-4">
            <h1 className="text-2xl font-bold">WhatsApp Business Dashboard</h1>
            <p className="text-green-100">Gestiona conversaciones con múltiples contactos</p>
          </div>
          
          <div className="flex h-[600px]">
            {/* Lista de contactos */}
            <div className="w-1/3 border-r border-gray-200 bg-gray-50">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Contactos</h2>
                <button
                  onClick={() => {
                    const name = prompt('Nombre del contacto:');
                    const phone = prompt('Número de teléfono (+54...):');
                    if (name && phone) {
                      addContact(name, phone);
                    }
                  }}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  + Agregar Contacto
                </button>
              </div>
              
              <div className="overflow-y-auto h-full">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors ${
                      selectedContact?.id === contact.id ? 'bg-green-50 border-green-200' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                        <p className="text-sm text-gray-600">{contact.phoneNumber}</p>
                        {contact.lastMessage && (
                          <p className="text-sm text-gray-500 mt-1 truncate">
                            {contact.lastMessage}
                          </p>
                        )}
                      </div>
                      {contact.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                          {contact.unreadCount}
                        </span>
                      )}
                    </div>
                    {contact.lastMessageTime && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(contact.lastMessageTime).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Chat */}
            <div className="flex-1">
              {selectedContact ? (
                <WhatsAppChat
                  orderId={`chat-${selectedContact.id}`}
                  providerName={selectedContact.name}
                  providerPhone={selectedContact.phoneNumber}
                  isOpen={true}
                  onClose={() => setSelectedContact(null)}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-xl font-semibold mb-2">Selecciona un contacto</h3>
                    <p>Elige un contacto de la lista para comenzar a chatear</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 