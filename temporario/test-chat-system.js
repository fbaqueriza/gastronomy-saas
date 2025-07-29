// Script de prueba para diagnosticar el sistema de chat
const testChatSystem = async () => {
  console.log('🧪 Iniciando pruebas del sistema de chat...');
  
  // Test 1: Verificar estado del servicio
  try {
    const statusResponse = await fetch('http://localhost:3001/api/whatsapp/status');
    const statusData = await statusResponse.json();
    console.log('✅ Estado del servicio:', statusData);
  } catch (error) {
    console.error('❌ Error verificando estado:', error);
  }
  
  // Test 2: Enviar mensaje de prueba
  try {
    const sendResponse = await fetch('http://localhost:3001/api/whatsapp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: '+5491135562673',
        message: 'Prueba desde script de diagnóstico'
      }),
    });
    
    const sendData = await sendResponse.json();
    console.log('✅ Mensaje enviado:', sendData);
  } catch (error) {
    console.error('❌ Error enviando mensaje:', error);
  }
  
  // Test 3: Verificar mensajes en la base de datos
  try {
    const messagesResponse = await fetch('http://localhost:3001/api/whatsapp/messages');
    const messagesData = await messagesResponse.json();
    console.log('✅ Mensajes en BD:', messagesData);
  } catch (error) {
    console.error('❌ Error obteniendo mensajes:', error);
  }
  
  // Test 4: Verificar estado SSE
  try {
    const sseResponse = await fetch('http://localhost:3001/api/whatsapp/sse-status');
    const sseData = await sseResponse.json();
    console.log('✅ Estado SSE:', sseData);
  } catch (error) {
    console.error('❌ Error verificando SSE:', error);
  }
  
  console.log('🏁 Pruebas completadas');
};

// Ejecutar pruebas
testChatSystem(); 