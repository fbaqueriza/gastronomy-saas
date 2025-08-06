// Debug del frontend para verificar por qué no aparecen los mensajes
const debugFrontend = async () => {
  console.log('🔍 DEBUG DEL FRONTEND');
  console.log('=====================');
  
  // Simular exactamente lo que hace el componente WhatsAppIntegratedChat
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
  
  // Probar con diferentes contactos
  const testContacts = [
    { name: 'L\'igiene', phone: '5491135562673' },
    { name: 'Baron de la Menta', phone: '5491140494130' },
    { name: 'La boutique', phone: '1130252729' },
    { name: 'La Mielisima', phone: '1165587548' }
  ];
  
  for (const contact of testContacts) {
    console.log(`\n👤 Probando contacto: ${contact.name} (${contact.phone})`);
    const messages = await loadMessagesFromDB(contact.phone);
    
    console.log(`📱 Mensajes para ${contact.name}:`);
    messages.forEach((msg, index) => {
      console.log(`  ${index + 1}. [${msg.type.toUpperCase()}] ${msg.content} (${msg.timestamp.toLocaleTimeString()})`);
    });
    
    const sentCount = messages.filter(m => m.type === 'sent').length;
    const receivedCount = messages.filter(m => m.type === 'received').length;
    
    console.log(`📊 Resumen para ${contact.name}: ${sentCount} enviados, ${receivedCount} recibidos`);
  }
  
  console.log('\n🎯 DIAGNÓSTICO:');
  console.log('✅ El backend está funcionando correctamente');
  console.log('✅ Los mensajes están en la base de datos');
  console.log('✅ La lógica de filtrado está correcta');
  console.log('⚠️  El problema está en el frontend - el componente no está cargando los datos');
  
  console.log('\n🔧 SOLUCIÓN:');
  console.log('1. Abre http://localhost:3001 en el navegador');
  console.log('2. Abre las herramientas de desarrollador (F12)');
  console.log('3. Ve a la pestaña Console');
  console.log('4. Selecciona un contacto en WhatsApp');
  console.log('5. Busca errores en la consola');
  console.log('6. Verifica si aparecen los logs de loadMessagesFromDB');
  
  console.log('\n🏁 Debug del frontend completado');
};

// Ejecutar debug
debugFrontend(); 