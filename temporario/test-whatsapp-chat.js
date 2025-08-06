// Script para probar el componente WhatsAppIntegratedChat
const testWhatsAppChat = async () => {
  console.log('🧪 Probando componente WhatsAppIntegratedChat...');
  
  // Simular la función loadMessagesFromDB del componente
  const loadMessagesFromDB = async (contactPhone) => {
    try {
      console.log('🔄 loadMessagesFromDB - Iniciando carga para:', contactPhone);
      
      // Obtener todos los mensajes para poder filtrar tanto enviados como recibidos
      const response = await fetch('http://localhost:3001/api/whatsapp/messages');
      const data = await response.json();
      
      if (data.error) {
        console.error('❌ loadMessagesFromDB - Error:', data.error);
        return [];
      }
      
      console.log('📥 loadMessagesFromDB - Mensajes recibidos:', data.messages?.length || 0);
      
      // Filtrar mensajes relevantes para el contacto
      const relevantMessages = (data.messages || []).filter((dbMessage) => {
        // Incluir mensajes recibidos del contacto
        if (dbMessage.contact_id === contactPhone) return true;
        
        // Incluir mensajes enviados al contacto (cuando contact_id es el número de WhatsApp Business)
        if (dbMessage.contact_id === '670680919470999') return true;
        
        return false;
      });
      
      console.log('🔍 loadMessagesFromDB - Mensajes relevantes:', relevantMessages.length);
      
      // Convertir mensajes de la BD al formato del frontend
      const dbMessages = relevantMessages.map((dbMessage) => {
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
      
      console.log('🔄 loadMessagesFromDB - Mensajes convertidos:', dbMessages.length);
      
      // Ordenar mensajes por timestamp
      dbMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      console.log('📱 loadMessagesFromDB - Mensajes de BD cargados:', dbMessages.length);
      
      return dbMessages;
      
    } catch (error) {
      console.error('💥 loadMessagesFromDB - Error cargando mensajes de BD:', error);
      return [];
    }
  };
  
  // Simular la selección de un contacto
  const selectedContact = {
    id: '1',
    name: 'L\'igiene',
    phone: '5491135562673'
  };
  
  console.log('👤 Contacto seleccionado:', selectedContact);
  
  // Cargar mensajes para el contacto
  const messages = await loadMessagesFromDB(selectedContact.phone);
  
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
  console.log('✅ Los mensajes enviados deberían aparecer a la derecha (verde)');
  console.log('✅ Los mensajes recibidos deberían aparecer a la izquierda (blanco)');
  console.log('✅ El contador de no leídos debería mostrar:', chatState.unreadCount);
  
  console.log('✅ Simulación de WhatsAppIntegratedChat completada');
};

// Ejecutar simulación
testWhatsAppChat(); 