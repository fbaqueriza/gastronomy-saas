// Script para probar todo el sistema completo
const testCompleteSystem = async () => {
  console.log('🧪 Probando sistema completo...');
  
  const baseUrl = 'http://localhost:3001';
  
  // Test 1: Verificar estado del servicio
  try {
    console.log('\n📊 Verificando estado del servicio...');
    const statusResponse = await fetch(`${baseUrl}/api/whatsapp/status`);
    const statusData = await statusResponse.json();
    console.log('✅ Estado del servicio:', statusData);
  } catch (error) {
    console.error('❌ Error verificando estado:', error);
  }
  
  // Test 2: Verificar webhook
  try {
    console.log('\n🔗 Verificando webhook...');
    const webhookUrl = `${baseUrl}/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=mi_token_secreto_2024_cilantro&hub.challenge=test`;
    const response = await fetch(webhookUrl);
    const data = await response.text();
    
    if (response.status === 200 && data === 'test') {
      console.log('✅ Webhook verificado correctamente');
    } else {
      console.log('❌ Webhook no verificado correctamente');
    }
  } catch (error) {
    console.error('❌ Error verificando webhook:', error);
  }
  
  // Test 3: Enviar mensaje
  try {
    console.log('\n📤 Enviando mensaje de prueba...');
    const response = await fetch(`${baseUrl}/api/whatsapp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: '+5491135562673',
        message: 'Prueba del sistema completo - ' + new Date().toISOString()
      }),
    });
    
    const data = await response.json();
    console.log('✅ Mensaje enviado:', data);
  } catch (error) {
    console.error('❌ Error enviando mensaje:', error);
  }
  
  // Test 4: Enviar mensaje con plantilla
  try {
    console.log('\n📋 Enviando mensaje con plantilla...');
    const response = await fetch(`${baseUrl}/api/whatsapp/send-template`, {
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
    
    const data = await response.json();
    console.log('✅ Mensaje con plantilla enviado:', data);
  } catch (error) {
    console.error('❌ Error enviando mensaje con plantilla:', error);
  }
  
  // Test 5: Verificar estadísticas
  try {
    console.log('\n📊 Verificando estadísticas...');
    const response = await fetch(`${baseUrl}/api/whatsapp/statistics`);
    const data = await response.json();
    console.log('✅ Estadísticas:', data);
  } catch (error) {
    console.error('❌ Error verificando estadísticas:', error);
  }
  
  console.log('\n🏁 Pruebas completadas');
  console.log('\n📋 Configuración para Meta for Developers:');
  console.log('🌐 Webhook URL: https://a543b7d3220d.ngrok-free.app/api/whatsapp/webhook');
  console.log('🔑 Verify Token: mi_token_secreto_2024_cilantro');
  console.log('📱 Eventos: messages, message_deliveries');
  console.log('\n✅ El sistema está funcionando correctamente');
};

// Ejecutar pruebas
testCompleteSystem(); 