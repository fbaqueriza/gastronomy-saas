// Análisis integral del sistema de WhatsApp
const analisisIntegral = async () => {
  console.log('🔍 ANÁLISIS INTEGRAL DEL SISTEMA WHATSAPP');
  console.log('==========================================');
  
  // 1. Verificar estado del servidor
  console.log('\n1️⃣ VERIFICANDO ESTADO DEL SERVIDOR...');
  try {
    const statusResponse = await fetch('http://localhost:3001/api/whatsapp/status');
    const statusData = await statusResponse.json();
    console.log('✅ Servidor funcionando:', statusData);
  } catch (error) {
    console.error('❌ Servidor no disponible:', error.message);
    return;
  }
  
  // 2. Verificar mensajes en la base de datos
  console.log('\n2️⃣ VERIFICANDO MENSAJES EN LA BASE DE DATOS...');
  try {
    const messagesResponse = await fetch('http://localhost:3001/api/whatsapp/messages');
    const messagesData = await messagesResponse.json();
    console.log('✅ Total de mensajes en BD:', messagesData.messages?.length || 0);
    
    if (messagesData.messages && messagesData.messages.length > 0) {
      console.log('📋 Primeros 5 mensajes:');
      messagesData.messages.slice(0, 5).forEach((msg, index) => {
        console.log(`  ${index + 1}. ID: ${msg.message_sid}, From: ${msg.contact_id}, Content: ${msg.content?.substring(0, 30)}...`);
      });
    }
  } catch (error) {
    console.error('❌ Error obteniendo mensajes:', error.message);
  }
  
  // 3. Verificar configuración de Meta WhatsApp
  console.log('\n3️⃣ VERIFICANDO CONFIGURACIÓN DE META WHATSAPP...');
  try {
    const configResponse = await fetch('http://localhost:3001/api/whatsapp/status');
    const configData = await configResponse.json();
    console.log('✅ Configuración Meta:', {
      enabled: configData.enabled,
      simulationMode: configData.simulationMode,
      configured: configData.configured,
      phoneNumberId: configData.phoneNumberId
    });
  } catch (error) {
    console.error('❌ Error verificando configuración:', error.message);
  }
  
  // 4. Probar envío de mensaje
  console.log('\n4️⃣ PROBANDO ENVÍO DE MENSAJE...');
  try {
    const sendResponse = await fetch('http://localhost:3001/api/whatsapp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: '+5491135562673',
        message: 'Prueba de análisis integral - ' + new Date().toISOString()
      }),
    });
    
    const sendData = await sendResponse.json();
    console.log('✅ Mensaje enviado:', sendData);
  } catch (error) {
    console.error('❌ Error enviando mensaje:', error.message);
  }
  
  // 5. Verificar números de teléfono disponibles
  console.log('\n5️⃣ VERIFICANDO NÚMEROS DE TELÉFONO...');
  const testNumbers = [
    '+5491135562673',
    '5491135562673',
    '91135562673',
    '+54 9 11 3556 2673',
    '+5491140494130', // Baron de la Menta
    '+1130252729',    // La boutique
    '+1165587548'     // La Mielisima
  ];
  
  console.log('📞 Números de teléfono disponibles para pruebas:');
  testNumbers.forEach((number, index) => {
    console.log(`  ${index + 1}. ${number}`);
  });
  
  // 6. Verificar si puedes hablar a cualquier número
  console.log('\n6️⃣ VERIFICANDO SI PUEDES HABLAR A CUALQUIER NÚMERO...');
  console.log('📋 Para responder a esta pregunta, necesito verificar:');
  console.log('  - Si tu número de WhatsApp Business está verificado');
  console.log('  - Si tienes permisos para enviar mensajes a números no verificados');
  console.log('  - Si estás en modo simulación o producción');
  
  try {
    const statusResponse = await fetch('http://localhost:3001/api/whatsapp/status');
    const statusData = await statusResponse.json();
    
    if (statusData.simulationMode) {
      console.log('⚠️  Estás en MODO SIMULACIÓN - No puedes enviar mensajes reales');
      console.log('✅  Pero puedes probar la funcionalidad localmente');
    } else {
      console.log('✅  Estás en MODO PRODUCCIÓN - Puedes enviar mensajes reales');
      console.log('⚠️  Solo puedes enviar a números verificados en tu cuenta de WhatsApp Business');
    }
  } catch (error) {
    console.error('❌ Error verificando modo:', error.message);
  }
  
  // 7. Verificar componente frontend
  console.log('\n7️⃣ VERIFICANDO COMPONENTE FRONTEND...');
  console.log('📋 El componente WhatsAppIntegratedChat debería:');
  console.log('  - Cargar mensajes desde la BD');
  console.log('  - Mostrar mensajes enviados (derecha, verde)');
  console.log('  - Mostrar mensajes recibidos (izquierda, blanco)');
  console.log('  - Actualizar en tiempo real');
  
  // 8. Recomendaciones
  console.log('\n8️⃣ RECOMENDACIONES...');
  console.log('🔧 Para solucionar el problema:');
  console.log('  1. Recarga la página en http://localhost:3001');
  console.log('  2. Ve a la sección WhatsApp');
  console.log('  3. Selecciona un contacto');
  console.log('  4. Verifica que aparezcan tanto mensajes enviados como recibidos');
  console.log('  5. Si no aparecen, revisa la consola del navegador para errores');
  
  console.log('\n🏁 Análisis integral completado');
};

// Ejecutar análisis
analisisIntegral(); 