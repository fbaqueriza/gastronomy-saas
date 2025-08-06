// Script de prueba para verificar la migración a Meta Cloud API
const testMetaMigration = async () => {
  console.log('🧪 Iniciando pruebas de migración a Meta Cloud API...');
  
  // Test 1: Verificar estado del servicio
  try {
    const statusResponse = await fetch('http://localhost:3001/api/whatsapp/status');
    const statusData = await statusResponse.json();
    console.log('✅ Estado del servicio Meta:', statusData);
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
        message: 'Prueba de migración a Meta Cloud API'
      }),
    });
    
    const sendData = await sendResponse.json();
    console.log('✅ Mensaje enviado con Meta:', sendData);
  } catch (error) {
    console.error('❌ Error enviando mensaje:', error);
  }
  
  // Test 3: Enviar mensaje con plantilla
  try {
    const templateResponse = await fetch('http://localhost:3001/api/whatsapp/send-template', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: '+5491135562673',
        templateName: 'hello_world',
        language: 'es'
      }),
    });
    
    const templateData = await templateResponse.json();
    console.log('✅ Mensaje con plantilla enviado:', templateData);
  } catch (error) {
    console.error('❌ Error enviando plantilla:', error);
  }
  
  // Test 4: Verificar estadísticas
  try {
    const statsResponse = await fetch('http://localhost:3001/api/whatsapp/statistics');
    const statsData = await statsResponse.json();
    console.log('✅ Estadísticas del servicio:', statsData);
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
  }
  
  // Test 5: Verificar webhook
  try {
    const webhookResponse = await fetch('http://localhost:3001/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=test&hub.challenge=test');
    const webhookData = await webhookResponse.text();
    console.log('✅ Webhook response:', webhookData);
  } catch (error) {
    console.error('❌ Error verificando webhook:', error);
  }
  
  console.log('🏁 Pruebas de migración completadas');
};

// Ejecutar pruebas
testMetaMigration(); 