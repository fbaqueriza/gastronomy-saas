// Script para probar la sincronización de mensajes
const testMessageSync = async () => {
  console.log('🧪 Probando sincronización de mensajes...');
  
  // Test 1: Obtener mensajes desde la API
  try {
    console.log('📥 Obteniendo mensajes desde /api/whatsapp/messages...');
    const response = await fetch('http://localhost:3001/api/whatsapp/messages');
    const data = await response.json();
    
    console.log('✅ Mensajes obtenidos:', {
      count: data.count || 0,
      messages: data.messages?.length || 0,
      error: data.error
    });
    
    if (data.messages && data.messages.length > 0) {
      console.log('📋 Primeros 3 mensajes:');
      data.messages.slice(0, 3).forEach((msg, index) => {
        console.log(`  ${index + 1}. ID: ${msg.id}, From: ${msg.from}, Content: ${msg.content?.substring(0, 50)}...`);
      });
    }
  } catch (error) {
    console.error('❌ Error obteniendo mensajes:', error);
  }
  
  // Test 2: Obtener mensajes filtrados por contacto
  try {
    console.log('\n📥 Obteniendo mensajes para contacto específico...');
    const contactId = '5491135562673'; // El número que has estado usando
    const response = await fetch(`http://localhost:3001/api/whatsapp/messages?contactId=${contactId}`);
    const data = await response.json();
    
    console.log('✅ Mensajes para contacto:', {
      contactId,
      count: data.count || 0,
      messages: data.messages?.length || 0
    });
    
    if (data.messages && data.messages.length > 0) {
      console.log('📋 Mensajes del contacto:');
      data.messages.forEach((msg, index) => {
        console.log(`  ${index + 1}. ID: ${msg.message_sid}, Content: ${msg.content}, Timestamp: ${msg.timestamp}`);
      });
    }
  } catch (error) {
    console.error('❌ Error obteniendo mensajes por contacto:', error);
  }
  
  // Test 3: Verificar estadísticas
  try {
    console.log('\n📊 Verificando estadísticas...');
    const response = await fetch('http://localhost:3001/api/whatsapp/statistics');
    const data = await response.json();
    
    console.log('✅ Estadísticas:', {
      totalMessages: data.totalMessages,
      sentMessages: data.sentMessages,
      receivedMessages: data.receivedMessages,
      mode: data.mode
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
  }
  
  console.log('\n🏁 Pruebas de sincronización completadas');
};

// Ejecutar pruebas
testMessageSync(); 