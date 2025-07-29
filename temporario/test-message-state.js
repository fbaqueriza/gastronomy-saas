// Script para probar el estado de los mensajes
const testMessageState = async () => {
  console.log('🧪 Probando estado de mensajes...');
  
  // Simular envío de mensaje y verificar estado
  const sendMessageAndCheckState = async (contactId, content) => {
    console.log(`\n📤 Enviando mensaje: "${content}" a ${contactId}`);
    
    try {
      const response = await fetch('http://localhost:3001/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: contactId,
          message: content
        }),
      });

      const result = await response.json();
      console.log('✅ Mensaje enviado:', result);
      
      // Verificar mensajes en la base de datos
      const messagesResponse = await fetch('http://localhost:3001/api/whatsapp/messages');
      const messagesData = await messagesResponse.json();
      console.log('📋 Mensajes en BD:', messagesData);
      
      return result;
    } catch (error) {
      console.error('❌ Error:', error);
    }
  };
  
  // Probar envío de mensajes
  const testMessages = [
    'Mensaje de prueba 1',
    'Mensaje de prueba 2',
    'Mensaje de prueba 3'
  ];
  
  for (const message of testMessages) {
    await sendMessageAndCheckState('+5491135562673', message);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🏁 Prueba de estado de mensajes completada');
};

// Ejecutar pruebas
testMessageState(); 