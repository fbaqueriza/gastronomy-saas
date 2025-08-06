// Script para probar el envío desde el frontend
const testFrontendSend = async () => {
  console.log('🧪 Probando envío desde frontend...');
  
  // Simular la función sendMessage del ChatContext
  const sendMessage = async (contactId, content) => {
    console.log('🔍 DEBUG sendMessage - Iniciando envío:', { contactId, content });
    
    if (!contactId || !content.trim()) {
      console.error('❌ sendMessage - Parámetros inválidos:', { contactId, content });
      return;
    }

    // Normalizar número de teléfono
    let normalizedPhone = contactId.replace(/[\s\-\(\)]/g, '');
    if (!normalizedPhone.startsWith('+')) {
      normalizedPhone = `+${normalizedPhone}`;
    }
    
    console.log('📞 sendMessage - Teléfono normalizado:', { original: contactId, normalized: normalizedPhone });

    try {
      console.log('🌐 sendMessage - Enviando a la API:', { to: normalizedPhone, message: content });
      
      const response = await fetch('http://localhost:3001/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: normalizedPhone,
          message: content
        }),
      });

      console.log('📡 sendMessage - Respuesta de la API:', response.status, response.statusText);

      const result = await response.json();
      
      console.log('📋 sendMessage - Resultado de la API:', result);

      if (result.success) {
        console.log('✅ sendMessage - Mensaje enviado exitosamente:', result);
      } else {
        console.error('❌ sendMessage - Error sending message:', result.error);
      }
    } catch (error) {
      console.error('💥 sendMessage - Error sending message:', error);
    }
  };
  
  // Probar con diferentes formatos de números
  const testNumbers = [
    '+5491135562673',
    '5491135562673',
    '91135562673',
    '+54 9 11 3556 2673'
  ];
  
  for (const number of testNumbers) {
    console.log(`\n📞 Probando con número: ${number}`);
    await sendMessage(number, `Prueba desde frontend - ${new Date().toISOString()}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo entre pruebas
  }
  
  console.log('🏁 Pruebas de frontend completadas');
};

// Ejecutar pruebas
testFrontendSend(); 