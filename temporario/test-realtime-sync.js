// Script para probar la sincronización en tiempo real
const testRealtimeSync = async () => {
  console.log('🧪 PROBANDO SINCRONIZACIÓN EN TIEMPO REAL');
  console.log('==========================================');
  
  // Test 1: Verificar estado inicial
  console.log('\n📊 Test 1: Verificando estado inicial...');
  try {
    const response = await fetch('http://localhost:3001/api/whatsapp/messages');
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Mensajes en BD:', data.messages.length);
      console.log('📋 Últimos 3 mensajes:');
      data.messages.slice(-3).forEach((msg, i) => {
        console.log(`   ${i + 1}. ${msg.content} (${msg.contact_id}) - ${new Date(msg.timestamp).toLocaleString()}`);
      });
    } else {
      console.log('❌ Error obteniendo mensajes:', data.error);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  // Test 2: Enviar mensaje de prueba
  console.log('\n📤 Test 2: Enviando mensaje de prueba...');
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
                      id: `realtime_test_${Date.now()}`,
                      timestamp: Math.floor(Date.now() / 1000),
                      text: {
                        body: 'Mensaje de prueba tiempo real - ' + new Date().toISOString()
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

    console.log('✅ Webhook enviado:', webhookResponse.status);
    
    if (webhookResponse.ok) {
      console.log('✅ Mensaje guardado en BD');
    } else {
      console.log('❌ Error enviando webhook:', webhookResponse.status);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  // Test 3: Verificar mensajes después del envío
  console.log('\n📊 Test 3: Verificando mensajes después del envío...');
  try {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos
    
    const response = await fetch('http://localhost:3001/api/whatsapp/messages');
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Mensajes en BD después del envío:', data.messages.length);
      console.log('📋 Último mensaje:');
      const lastMessage = data.messages[data.messages.length - 1];
      if (lastMessage) {
        console.log(`   ${lastMessage.content} (${lastMessage.contact_id}) - ${new Date(lastMessage.timestamp).toLocaleString()}`);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  // Test 4: Verificar estado SSE
  console.log('\n🔌 Test 4: Verificando estado SSE...');
  try {
    const sseResponse = await fetch('http://localhost:3001/api/whatsapp/sse-status');
    const sseData = await sseResponse.json();
    console.log('✅ Estado SSE:', sseData);
  } catch (error) {
    console.error('❌ Error verificando SSE:', error);
  }
  
  console.log('\n📋 INSTRUCCIONES PARA VERIFICAR:');
  console.log('1. Abre la app en el navegador (http://localhost:3001)');
  console.log('2. Ve al chat con el contacto 5491135562673');
  console.log('3. Deberías ver el mensaje de prueba que se envió INMEDIATAMENTE');
  console.log('4. Si no aparece, verifica que SSE esté funcionando');
  console.log('5. Revisa la consola del navegador para logs de SSE');
  
  console.log('\n🎯 RESULTADO ESPERADO:');
  console.log('✅ Mensaje guardado en BD');
  console.log('✅ Mensaje aparece en el frontend INMEDIATAMENTE');
  console.log('✅ Sincronización en tiempo real funciona');
  console.log('✅ No hay respuesta automática');
  console.log('✅ SSE conectado y funcionando');
  
  console.log('\n🔍 PARA DEBUGGEAR:');
  console.log('- Abre las herramientas de desarrollador (F12)');
  console.log('- Ve a la pestaña Console');
  console.log('- Busca logs que empiecen con "🔌" o "📨"');
  console.log('- Si no hay logs de SSE, hay un problema de conexión');
  
  console.log('\n🏁 Prueba completada');
};

// Ejecutar prueba
testRealtimeSync(); 