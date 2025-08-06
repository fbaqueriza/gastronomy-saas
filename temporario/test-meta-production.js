// Script para probar Meta Cloud API en modo producción
const testMetaProduction = async () => {
  console.log('🧪 Probando Meta Cloud API en modo producción...');
  
  // Test 1: Verificar estado del servicio
  try {
    console.log('\n📊 Verificando estado del servicio...');
    const statusResponse = await fetch('http://localhost:3001/api/whatsapp/status');
    const statusData = await statusResponse.json();
    console.log('✅ Estado del servicio:', statusData);
  } catch (error) {
    console.error('❌ Error verificando estado:', error);
  }
  
  // Test 2: Probar envío de mensaje
  try {
    console.log('\n📤 Enviando mensaje de prueba...');
    const response = await fetch('http://localhost:3001/api/whatsapp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: '+5491135562673',
        message: 'Prueba desde Meta Cloud API - ' + new Date().toISOString()
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la API:', response.status, errorText);
    } else {
      const data = await response.json();
      console.log('✅ Mensaje enviado:', data);
    }
  } catch (error) {
    console.error('❌ Error enviando mensaje:', error);
  }
  
  // Test 3: Verificar credenciales directamente
  try {
    console.log('\n🔑 Verificando credenciales de Meta...');
    const accessToken = process.env.WHATSAPP_API_KEY;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    if (accessToken && phoneNumberId) {
      const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}?access_token=${accessToken}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Credenciales válidas:', data);
      } else {
        console.error('❌ Credenciales inválidas:', response.status);
      }
    } else {
      console.error('❌ Credenciales no configuradas');
    }
  } catch (error) {
    console.error('❌ Error verificando credenciales:', error);
  }
  
  console.log('\n🏁 Pruebas completadas');
};

// Ejecutar pruebas
testMetaProduction(); 