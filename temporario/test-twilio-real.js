// Script para probar las credenciales reales de Twilio
const testTwilioReal = async () => {
  console.log('🧪 Probando credenciales reales de Twilio...');
  
  // Probar envío de mensaje real
  try {
    console.log('📤 Enviando mensaje real a Twilio...');
    
    const response = await fetch('http://localhost:3001/api/whatsapp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: '+5491135562673',
        message: 'Prueba de mensaje real desde Twilio - ' + new Date().toISOString()
      }),
    });

    const result = await response.json();
    console.log('📋 Resultado del envío:', result);
    
    if (result.success) {
      console.log('✅ Mensaje enviado exitosamente');
      console.log('📱 Message ID:', result.messageId);
      console.log('🕒 Timestamp:', result.timestamp);
      console.log('🎭 Modo:', result.mode);
    } else {
      console.error('❌ Error enviando mensaje:', result.error);
    }
    
  } catch (error) {
    console.error('💥 Error en la prueba:', error);
  }
  
  // Verificar estado del servicio
  try {
    console.log('\n📊 Verificando estado del servicio...');
    const statusResponse = await fetch('http://localhost:3001/api/whatsapp/status');
    const statusData = await statusResponse.json();
    console.log('📊 Estado del servicio:', statusData);
  } catch (error) {
    console.error('❌ Error verificando estado:', error);
  }
  
  console.log('\n🏁 Prueba de Twilio real completada');
};

// Ejecutar pruebas
testTwilioReal(); 