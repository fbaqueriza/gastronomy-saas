// Script para enviar un nuevo mensaje y verificar el campo 'from'
const testSendNewMessage = async () => {
  console.log('🧪 Enviando nuevo mensaje para probar campo "from"...');
  
  try {
    const response = await fetch('http://localhost:3001/api/whatsapp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: '+5491135562673',
        message: 'Prueba del campo from - ' + new Date().toISOString()
      }),
    });

    const result = await response.json();
    console.log('✅ Mensaje enviado:', result);
    
    // Esperar un momento para que se guarde en la BD
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar los mensajes en la BD
    console.log('\n📥 Verificando mensajes en la BD...');
    const messagesResponse = await fetch('http://localhost:3001/api/whatsapp/messages');
    const messagesData = await messagesResponse.json();
    
    console.log('✅ Mensajes en BD:', {
      count: messagesData.count || 0,
      messages: messagesData.messages?.length || 0
    });
    
    if (messagesData.messages && messagesData.messages.length > 0) {
      console.log('📋 Últimos 3 mensajes:');
      messagesData.messages.slice(-3).forEach((msg, index) => {
        console.log(`  ${index + 1}. ID: ${msg.message_sid}, From: ${msg.from}, Content: ${msg.content?.substring(0, 50)}...`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  console.log('🏁 Prueba completada');
};

// Ejecutar prueba
testSendNewMessage(); 