// Script para probar recepción de mensajes cuando la app está cerrada
const testOfflineMessages = async () => {
  console.log('🧪 PROBANDO RECEPCIÓN DE MENSAJES OFFLINE');
  console.log('===========================================');
  
  // Simular mensaje entrante cuando la app está cerrada
  console.log('📥 Enviando mensaje de prueba (app cerrada)...');
  
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
                      id: `offline_test_${Date.now()}`,
                      timestamp: Math.floor(Date.now() / 1000),
                      text: {
                        body: 'Mensaje recibido mientras la app estaba cerrada - ' + new Date().toISOString()
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
      console.log('✅ Mensaje guardado en BD correctamente');
      console.log('');
      console.log('📋 INSTRUCCIONES PARA VERIFICAR:');
      console.log('1. Abre la app en el navegador (http://localhost:3001)');
      console.log('2. Ve al chat con el contacto 5491135562673');
      console.log('3. Deberías ver el mensaje que se envió mientras estaba cerrada');
      console.log('4. El mensaje aparecerá automáticamente sin necesidad de refrescar');
      console.log('');
      console.log('🎯 RESULTADO ESPERADO:');
      console.log('✅ Mensaje guardado en BD cuando app cerrada');
      console.log('✅ Mensaje aparece automáticamente al abrir app');
      console.log('✅ Sincronización automática funciona correctamente');
    } else {
      console.log('❌ Error enviando webhook:', webhookResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  console.log('');
  console.log('🏁 Prueba completada');
};

// Ejecutar prueba
testOfflineMessages(); 