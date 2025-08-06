// Script para probar el webhook de WhatsApp
const testWebhook = async () => {
  console.log('🧪 Probando webhook de WhatsApp...');
  
  const baseUrl = 'http://localhost:3001';
  const verifyToken = 'mi_token_secreto_2024_cilantro';
  
  // Test 1: Verificar webhook (GET)
  try {
    console.log('🔗 Probando verificación del webhook...');
    const webhookUrl = `${baseUrl}/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=test`;
    
    console.log('📡 URL:', webhookUrl);
    
    const response = await fetch(webhookUrl);
    const data = await response.text();
    
    console.log('📊 Status:', response.status);
    console.log('📋 Response:', data);
    
    if (response.status === 200 && data === 'test') {
      console.log('✅ Webhook verificado correctamente');
    } else {
      console.log('❌ Webhook no verificado correctamente');
    }
  } catch (error) {
    console.error('❌ Error verificando webhook:', error);
  }
  
  // Test 2: Simular mensaje entrante (POST)
  try {
    console.log('\n📨 Simulando mensaje entrante...');
    
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
                body: 'Hola, esto es una prueba del webhook'
              }
            }]
          },
          field: 'messages'
        }]
      }]
    };
    
    const response = await fetch(`${baseUrl}/api/whatsapp/webhook`, {
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
      console.log('✅ Mensaje procesado correctamente');
    } else {
      console.log('❌ Error procesando mensaje');
    }
  } catch (error) {
    console.error('❌ Error simulando mensaje:', error);
  }
  
  console.log('\n🏁 Pruebas de webhook completadas');
};

// Ejecutar pruebas
testWebhook(); 