// Script para probar el sistema SSE en tiempo real
const testSSERealtime = async () => {
  console.log('🧪 Probando sistema SSE en tiempo real...');
  
  // Test 1: Verificar estado del servicio
  try {
    const statusResponse = await fetch('http://localhost:3001/api/whatsapp/status');
    const statusData = await statusResponse.json();
    console.log('✅ Estado del servicio:', statusData.service?.mode);
  } catch (error) {
    console.error('❌ Error verificando estado:', error);
  }
  
  // Test 2: Verificar estado SSE
  try {
    const sseResponse = await fetch('http://localhost:3001/api/whatsapp/sse-status');
    const sseData = await sseResponse.json();
    console.log('✅ Estado SSE:', sseData);
  } catch (error) {
    console.error('❌ Error verificando SSE:', error);
  }
  
  // Test 3: Simular mensaje entrante
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
                      id: `test_${Date.now()}`,
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
  console.log('1. Abre http://localhost:3001 en el navegador');
  console.log('2. Abre las herramientas de desarrollador (F12)');
  console.log('3. Ve a la pestaña Console');
  console.log('4. Busca estos logs:');
  console.log('   - "📨 Mensaje SSE recibido:"');
  console.log('   - "📨 Mensaje SSE procesado para 5491135562673:"');
  console.log('5. Si aparecen estos logs, el SSE funciona correctamente');
  console.log('6. Deberías ver el nuevo mensaje en el chat');
  
  console.log('\n🏁 Prueba completada');
};

// Ejecutar prueba
testSSERealtime(); 