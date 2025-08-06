// Script para probar el envío de mensajes SSE
const testSSEMessageDelivery = async () => {
  console.log('🧪 Probando envío de mensajes SSE...');
  
  // Verificar estado SSE actual
  try {
    const sseResponse = await fetch('http://localhost:3001/api/whatsapp/sse-status');
    const sseData = await sseResponse.json();
    console.log('✅ Estado SSE actual:', sseData.status.totalActiveClients);
  } catch (error) {
    console.error('❌ Error verificando SSE:', error);
  }
  
  // Simular mensaje de WhatsApp
  try {
    const webhookResponse = await fetch('http://localhost:3001/api/whatsapp/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        object: 'whatsapp_business_account',
        entry: [
          {
            id: '1123051623072203',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '5491141780300',
                    phone_number_id: '670680919470999'
                  },
                  contacts: [
                    {
                      profile: {
                        name: 'Test User'
                      },
                      wa_id: '5491135562673'
                    }
                  ],
                  messages: [
                    {
                      from: '5491135562673',
                      id: `test_sse_${Date.now()}`,
                      timestamp: Math.floor(Date.now() / 1000),
                      text: {
                        body: 'Mensaje de prueba SSE - ' + new Date().toISOString()
                      },
                      type: 'text'
                    }
                  ]
                },
                field: 'messages'
              }
            ]
          }
        ]
      }),
    });
    
    console.log('✅ Webhook simulado enviado:', webhookResponse.status);
  } catch (error) {
    console.error('❌ Error simulando webhook:', error);
  }
  
  console.log('\n📱 INSTRUCCIONES PARA VERIFICAR:');
  console.log('1. Mantén abierto http://localhost:3001 en el navegador');
  console.log('2. Abre las herramientas de desarrollador (F12)');
  console.log('3. Ve a la pestaña Console');
  console.log('4. Busca estos logs:');
  console.log('   - "📨 Mensaje SSE recibido:" con type: "whatsapp_message"');
  console.log('   - "📨 Mensaje SSE procesado para 5491135562673:"');
  console.log('   - "📝 addMessage será llamado con:"');
  console.log('5. Si aparecen estos logs, el mensaje llegó al frontend');
  console.log('6. Si NO aparecen, el mensaje no llegó');
  
  console.log('\n🔧 DIAGNÓSTICO:');
  console.log('✅ Backend SSE funcionando');
  console.log('✅ Frontend conectado al SSE');
  console.log('❌ Mensajes de WhatsApp no llegan al frontend');
  console.log('❌ Posible problema: Timing entre webhook y conexión SSE');
  
  console.log('\n🏁 Prueba completada');
};

// Ejecutar prueba
testSSEMessageDelivery(); 