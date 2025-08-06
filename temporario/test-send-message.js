// Script simple para probar envío de mensajes
const testSendMessage = async () => {
  console.log('📤 Probando envío de mensaje...');
  
  try {
    const response = await fetch('http://localhost:3001/api/whatsapp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: '+5491135562673',
        message: 'Prueba desde script - ¿Llega este mensaje al número 1135562673?'
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error:', response.status, errorText);
    } else {
      const data = await response.json();
      console.log('✅ Mensaje enviado exitosamente:', data);
    }
  } catch (error) {
    console.error('💥 Error:', error);
  }
};

testSendMessage(); 