// Script para probar la sincronización completa
const testCompleteSync = async () => {
  console.log('🧪 Probando sincronización completa...');
  
  // Simular la función syncMessagesFromDatabase del ChatContext actualizada
  const syncMessagesFromDatabase = async (contactId) => {
    console.log('🔄 syncMessagesFromDatabase - Iniciando sincronización:', { contactId });
    
    try {
      // Obtener todos los mensajes para poder filtrar tanto enviados como recibidos
      const url = '/api/whatsapp/messages';
      
      const response = await fetch(`http://localhost:3001${url}`);
      const data = await response.json();
      
      if (data.error) {
        console.error('❌ syncMessagesFromDatabase - Error:', data.error);
        return [];
      }
      
      console.log('📥 syncMessagesFromDatabase - Mensajes recibidos:', data.messages?.length || 0);
      
      // Filtrar mensajes relevantes para el contacto
      const relevantMessages = (data.messages || []).filter((dbMessage) => {
        if (!contactId) return true; // Si no hay contacto, mostrar todos
        
        // Incluir mensajes recibidos del contacto
        if (dbMessage.contact_id === contactId) return true;
        
        // Incluir mensajes enviados al contacto (cuando contact_id es el número de WhatsApp Business)
        if (dbMessage.contact_id === '670680919470999') return true;
        
        return false;
      });
      
      console.log('🔍 syncMessagesFromDatabase - Mensajes relevantes:', relevantMessages.length);
      
      // Convertir mensajes de la BD al formato del frontend
      const convertedMessages = relevantMessages.map((dbMessage) => {
        // Determinar si el mensaje es enviado o recibido basado en el campo 'contact_id'
        const isFromBusiness = dbMessage.contact_id === '670680919470999'; // Tu número de WhatsApp Business
        
        console.log('🔄 Conversión de mensaje:', {
          messageId: dbMessage.message_sid || dbMessage.id,
          contactId: dbMessage.contact_id,
          isFromBusiness,
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
  
  // Verificar que los mensajes se muestren correctamente en el frontend
  console.log('\n🎯 Verificación para el frontend:');
  console.log('✅ Los mensajes deberían aparecer en el chat de la aplicación web');
  console.log('✅ Los mensajes enviados deberían aparecer a la derecha (azul)');
  console.log('✅ Los mensajes recibidos deberían aparecer a la izquierda (gris)');
  console.log('✅ El contador de no leídos debería mostrar:', chatState.unreadCount);
  
  console.log('✅ Simulación de frontend completa completada');
};

// Ejecutar simulación
testCompleteSync(); 