// Script para verificar todos los mensajes y su clasificación
const checkAllMessages = async () => {
  console.log('🔍 Verificando todos los mensajes...');
  
  try {
    const response = await fetch('http://localhost:3001/api/whatsapp/messages');
    const data = await response.json();
    
    console.log('✅ Mensajes obtenidos:', data.messages?.length || 0);
    
    if (data.messages && data.messages.length > 0) {
      console.log('📋 Análisis de mensajes:');
      
      const businessNumber = '670680919470999';
      const contactNumber = '5491135562673';
      
      data.messages.forEach((msg, index) => {
        const isFromBusiness = msg.contact_id === businessNumber;
        const isFromContact = msg.contact_id === contactNumber;
        const type = isFromBusiness ? 'SENT' : 'RECEIVED';
        
        console.log(`  ${index + 1}. [${type}] ID: ${msg.message_sid}, From: ${msg.contact_id}, Content: ${msg.content?.substring(0, 50)}...`);
      });
      
      // Resumen
      const sentMessages = data.messages.filter(msg => msg.contact_id === businessNumber);
      const receivedMessages = data.messages.filter(msg => msg.contact_id === contactNumber);
      
      console.log('\n📊 Resumen:');
      console.log(`  - Mensajes enviados: ${sentMessages.length}`);
      console.log(`  - Mensajes recibidos: ${receivedMessages.length}`);
      console.log(`  - Total: ${data.messages.length}`);
      
      if (sentMessages.length > 0) {
        console.log('\n📤 Mensajes enviados:');
        sentMessages.forEach((msg, index) => {
          console.log(`  ${index + 1}. ${msg.content?.substring(0, 50)}...`);
        });
      }
      
      if (receivedMessages.length > 0) {
        console.log('\n📥 Mensajes recibidos:');
        receivedMessages.forEach((msg, index) => {
          console.log(`  ${index + 1}. ${msg.content?.substring(0, 50)}...`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  console.log('\n🏁 Verificación completada');
};

// Ejecutar verificación
checkAllMessages(); 