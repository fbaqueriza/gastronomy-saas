// Script para probar la sincronización actualizada
const testUpdatedSync = async () => {
  console.log('🧪 Probando sincronización actualizada...');
  
  // Simular la función syncMessagesFromDatabase del ChatContext actualizada
  const syncMessagesFromDatabase = async (contactId) => {
    console.log('🔄 syncMessagesFromDatabase - Iniciando sincronización:', { contactId });
    
    try {
      const url = contactId 
        ? `/api/whatsapp/messages?contactId=${encodeURIComponent(contactId)}`
        : '/api/whatsapp/messages';
      
      const response = await fetch(`http://localhost:3001${url}`);
      const data = await response.json();
      
      if (data.error) {
        console.error('❌ syncMessagesFromDatabase - Error:', data.error);
        return [];
      }
      
      console.log('📥 syncMessagesFromDatabase - Mensajes recibidos:', data.messages?.length || 0);
      
      // Convertir mensajes de la BD al formato del frontend (lógica actualizada)
      const convertedMessages = (data.messages || []).map((dbMessage) => {
        // Determinar si el mensaje es enviado o recibido basado en el campo 'from'
        const isFromBusiness = dbMessage.from === '670680919470999'; // Tu número de WhatsApp Business
        const isFromContact = dbMessage.contact_id === contactId; // Mensaje del contacto actual
        
        console.log('🔄 Conversión de mensaje:', {
          messageId: dbMessage.message_sid || dbMessage.id,
          from: dbMessage.from,
          contactId: dbMessage.contact_id,
          isFromBusiness,
          isFromContact,
          content: dbMessage.content?.substring(0, 30) + '...'
        });
        
        return {
          id: dbMessage.message_sid || dbMessage.id,
          type: isFromBusiness ? 'sent' : 'received',
          content: dbMessage.content,
          timestamp: new Date(dbMessage.timestamp || Date.now()),
          status: dbMessage.status || 'delivered'
        };
      });
      
      console.log('🔄 syncMessagesFromDatabase - Mensajes convertidos:', convertedMessages.length);
      
      // Ordenar mensajes por timestamp
      convertedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      return convertedMessages;
      
    } catch (error) {
      console.error('💥 syncMessagesFromDatabase - Error:', error);
      return [];
    }
  };
  
  // Simular la selección de un contacto
  const selectedContact = {
    name: 'Francisco Baqueriza',
    phone: '5491135562673'
  };
  
  console.log('👤 Contacto seleccionado:', selectedContact);
  
  // Cargar mensajes para el contacto
  const messages = await syncMessagesFromDatabase(selectedContact.phone);
  
  console.log('📱 Mensajes cargados para el frontend:');
  messages.forEach((msg, index) => {
    console.log(`  ${index + 1}. [${msg.type.toUpperCase()}] ${msg.content} (${msg.timestamp.toLocaleTimeString()})`);
  });
  
  // Simular el estado del chat
  const chatState = {
    selectedContact,
    messages,
    unreadCount: messages.filter(m => m.type === 'received').length
  };
  
  console.log('💬 Estado del chat:', {
    contact: chatState.selectedContact.name,
    messageCount: chatState.messages.length,
    unreadCount: chatState.unreadCount,
    sentMessages: chatState.messages.filter(m => m.type === 'sent').length,
    receivedMessages: chatState.messages.filter(m => m.type === 'received').length
  });
  
  console.log('✅ Simulación de frontend actualizada completada');
};

// Ejecutar simulación
testUpdatedSync(); 