// Script de prueba para verificar Meta Cloud API en ambiente local
const testLocalMeta = async () => {
  console.log('🧪 Iniciando pruebas de Meta Cloud API en ambiente local...');
  
  const baseUrl = 'http://localhost:3001';
  
  // Test 1: Verificar estado del servicio
  try {
    console.log('📡 Verificando estado del servicio...');
    const statusResponse = await fetch(`${baseUrl}/api/whatsapp/status`);
    const statusData = await statusResponse.json();
    console.log('✅ Estado del servicio:', statusData);
    
    if (statusData.success) {
      console.log('🎉 Servicio funcionando correctamente');
      console.log('📊 Modo:', statusData.service.mode);
      console.log('📱 Phone Number ID:', statusData.service.phoneNumberId);
      console.log('⚙️ Configurado:', statusData.service.configured);
    }
  } catch (error) {
    console.error('❌ Error verificando estado:', error);
  }
  
  // Test 2: Verificar webhook local
  try {
    console.log('🔗 Verificando webhook local...');
    const webhookResponse = await fetch(`${baseUrl}/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=mi_token_secreto_2024_cilantro&hub.challenge=test`);
    const webhookData = await webhookResponse.text();
    console.log('✅ Webhook response:', webhookData);
    
    if (webhookData === 'test') {
      console.log('🎉 Webhook configurado correctamente');
    } else {
      console.log('⚠️ Webhook puede tener problemas');
    }
  } catch (error) {
    console.error('❌ Error verificando webhook:', error);
  }
  
  // Test 3: Enviar mensaje de prueba
  try {
    console.log('📤 Enviando mensaje de prueba...');
    const sendResponse = await fetch(`${baseUrl}/api/whatsapp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: '+5491135562673',
        message: 'Prueba de Meta Cloud API local - ' + new Date().toISOString()
      }),
    });
    
    const sendData = await sendResponse.json();
    console.log('✅ Mensaje enviado:', sendData);
    
    if (sendData.success) {
      console.log('🎉 Envío de mensajes funcionando');
      console.log('📋 Message ID:', sendData.messageId);
      console.log('🎭 Modo:', sendData.mode);
      console.log('🎭 Simulado:', sendData.simulated);
    }
  } catch (error) {
    console.error('❌ Error enviando mensaje:', error);
  }
  
  // Test 4: Verificar estadísticas
  try {
    console.log('📊 Verificando estadísticas...');
    const statsResponse = await fetch(`${baseUrl}/api/whatsapp/statistics`);
    const statsData = await statsResponse.json();
    console.log('✅ Estadísticas:', statsData);
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
  }
  
  // Test 5: Enviar mensaje con plantilla
  try {
    console.log('📋 Enviando mensaje con plantilla...');
    const templateResponse = await fetch(`${baseUrl}/api/whatsapp/send-template`, {
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
    console.log('✅ Mensaje con plantilla:', templateData);
  } catch (error) {
    console.error('❌ Error enviando plantilla:', error);
  }
  
  // Test 6: Probar diferentes formatos de números
  try {
    console.log('📞 Probando diferentes formatos de números...');
    const testNumbers = [
      '+5491135562673',
      '5491135562673',
      '91135562673',
      '+54 9 11 3556 2673'
    ];
    
    for (const number of testNumbers) {
      console.log(`\n📞 Probando número: ${number}`);
      const numberResponse = await fetch(`${baseUrl}/api/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: number,
          message: `Prueba formato número: ${number} - ${new Date().toISOString()}`
        }),
      });
      
      const numberData = await numberResponse.json();
      console.log('✅ Resultado:', numberData.success ? 'Éxito' : 'Error');
    }
  } catch (error) {
    console.error('❌ Error probando formatos de números:', error);
  }
  
  console.log('🏁 Pruebas locales completadas');
  console.log('\n📋 Resumen:');
  console.log('- Si ves "simulation" en el modo, el servicio está funcionando en modo de prueba');
  console.log('- Si ves "production", el servicio está enviando mensajes reales');
  console.log('- Verifica los logs en la consola del servidor para más detalles');
  console.log('\n🔧 Para probar webhooks locales:');
  console.log('- Usa ngrok: ngrok http 3001');
  console.log('- Actualiza WHATSAPP_WEBHOOK_URL con la URL de ngrok');
};

// Ejecutar pruebas
testLocalMeta(); 