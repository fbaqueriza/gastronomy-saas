// Script para simular un mensaje entrante de WhatsApp
const testIncomingMessage = async () => {
  console.log('📥 Simulando mensaje entrante...');
  
  // Simular el payload que envía Meta cuando llega un mensaje
  const incomingMessage = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '1123051623072203',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '+54 9 11 4178-0300',
                phone_number_id: '670680919470999'
              },
              contacts: [
                {
                  profile: {
                    name: 'Usuario Test'
                  },
                  wa_id: '5491135562673'
                }
              ],
              messages: [
                {
                  from: '5491135562673',
                  id: 'wamid.HBgNNTQ5MTEzNTU2MjY3MxUCABEYEjE4NUExNzM0QjM4NTgzODJFRAA=',
                  timestamp: '1754418000',
                  text: {
                    body: 'Hola, este es un mensaje de respuesta desde WhatsApp'
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
  };

  try {
    console.log('📤 Enviando mensaje simulado a webhook...');
    
    const response = await fetch('http://localhost:3001/api/whatsapp/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(incomingMessage),
    });

    console.log('📡 Respuesta del webhook:', response.status, response.statusText);
    
    if (response.ok) {
      console.log('✅ Mensaje entrante procesado correctamente');
    } else {
      const errorText = await response.text();
      console.error('❌ Error procesando mensaje entrante:', errorText);
    }
  } catch (error) {
    console.error('💥 Error enviando mensaje simulado:', error);
  }
};

// Ejecutar prueba
testIncomingMessage(); 