// Script para probar el webhook con ngrok
const testNgrokWebhook = async () => {
  console.log('🧪 Probando webhook con ngrok...');
  
  const ngrokUrl = 'https://a543b7d3220d.ngrok-free.app';
  const verifyToken = 'mi_token_secreto_2024_cilantro';
  
  // Test 1: Verificar webhook (GET)
  try {
    console.log('🔗 Probando verificación del webhook con ngrok...');
    const webhookUrl = `${ngrokUrl}/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=test`;
    
    console.log('📡 URL:', webhookUrl);
    
    const response = await fetch(webhookUrl);
    const data = await response.text();
    
    console.log('📊 Status:', response.status);
    console.log('📋 Response:', data);
    
    if (response.status === 200 && data === 'test') {
      console.log('✅ Webhook verificado correctamente con ngrok');
    } else {
      console.log('❌ Webhook no verificado correctamente');
    }
  } catch (error) {
    console.error('❌ Error verificando webhook:', error);
  }
  
  // Test 2: Simular mensaje entrante (POST)
  try {
    console.log('\n📨 Simulando mensaje entrante con ngrok...');
    
    const mockMessage = {
      object: 'whatsapp_business_account',
      entry: [{
        id: '123456789',
        changes: [{
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '+5491135562673',
              phone_number_id: '670680919470999'
            },
            contacts: [{
              profile: {
                name: 'Test User'
              },
              wa_id: '5491135562673'
            }],
            messages: [{
              from: '5491135562673',
              id: 'test_message_id',
              timestamp: Date.now().toString(),
              type: 'text',
              text: {
                body: 'Hola, esto es una prueba del webhook con ngrok'
              }
            }]
          },
          field: 'messages'
        }]
      }]
    };
    
    const response = await fetch(`${ngrokUrl}/api/whatsapp/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockMessage),
    });
    
    console.log('📊 Status:', response.status);
    const data = await response.text();
    console.log('📋 Response:', data);
    
    if (response.status === 200) {
      console.log('✅ Mensaje procesado correctamente con ngrok');
    } else {
      console.log('❌ Error procesando mensaje');
    }
  } catch (error) {
    console.error('❌ Error simulando mensaje:', error);
  }
  
  // Test 3: Probar envío de mensajes
  try {
    console.log('\n📤 Probando envío de mensajes...');
    
    const response = await fetch(`${ngrokUrl}/api/whatsapp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: '+5491135562673',
        message: 'Prueba desde ngrok - ' + new Date().toISOString()
      }),
    });
    
    const data = await response.json();
    console.log('📊 Status:', response.status);
    console.log('📋 Response:', data);
    
    if (response.status === 200 && data.success) {
      console.log('✅ Envío de mensajes funcionando con ngrok');
    } else {
      console.log('❌ Error enviando mensajes');
    }
  } catch (error) {
    console.error('❌ Error enviando mensajes:', error);
  }
  
  console.log('\n🏁 Pruebas de ngrok completadas');
  console.log('\n📋 Configuración para Meta for Developers:');
  console.log(`🌐 Webhook URL: ${ngrokUrl}/api/whatsapp/webhook`);
  console.log('🔑 Verify Token: mi_token_secreto_2024_cilantro');
  console.log('📱 Eventos: messages, message_deliveries');
};

// Ejecutar pruebas
testNgrokWebhook(); 