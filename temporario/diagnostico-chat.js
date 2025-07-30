const fetch = require('node-fetch');

async function diagnosticarChat() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA DE CHAT');
  console.log('=' .repeat(50));

  // 1. Verificar estado del servidor
  console.log('\n📡 1. Verificando estado del servidor...');
  try {
    const statusResponse = await fetch('http://localhost:3001/api/whatsapp/status');
    const statusData = await statusResponse.json();
    console.log('✅ Estado del servidor:', JSON.stringify(statusData, null, 2));
  } catch (error) {
    console.log('❌ Error conectando al servidor:', error.message);
    return;
  }

  // 2. Verificar configuración de Twilio
  console.log('\n📱 2. Verificando configuración de Twilio...');
  try {
    const configResponse = await fetch('http://localhost:3001/api/whatsapp/config');
    const configData = await configResponse.json();
    console.log('✅ Configuración de Twilio:', JSON.stringify(configData, null, 2));
  } catch (error) {
    console.log('❌ Error obteniendo configuración:', error.message);
  }

  // 3. Probar envío de mensaje
  console.log('\n📤 3. Probando envío de mensaje...');
  try {
    const sendResponse = await fetch('http://localhost:3001/api/whatsapp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: '+5491135562673',
        message: 'Prueba de diagnóstico automático'
      })
    });

    if (sendResponse.ok) {
      const sendData = await sendResponse.json();
      console.log('✅ Mensaje enviado exitosamente:', JSON.stringify(sendData, null, 2));
    } else {
      const errorData = await sendResponse.text();
      console.log('❌ Error enviando mensaje:', sendResponse.status, errorData);
    }
  } catch (error) {
    console.log('❌ Error en envío:', error.message);
  }

  // 4. Verificar mensajes guardados
  console.log('\n💾 4. Verificando mensajes guardados...');
  try {
    const messagesResponse = await fetch('http://localhost:3001/api/whatsapp/messages');
    const messagesData = await messagesResponse.json();
    console.log('✅ Mensajes guardados:', JSON.stringify(messagesData, null, 2));
  } catch (error) {
    console.log('❌ Error obteniendo mensajes:', error.message);
  }

  // 5. Probar SSE
  console.log('\n🔌 5. Probando conexión SSE...');
  try {
    const sseResponse = await fetch('http://localhost:3001/api/whatsapp/sse-status');
    const sseData = await sseResponse.json();
    console.log('✅ Estado SSE:', JSON.stringify(sseData, null, 2));
  } catch (error) {
    console.log('❌ Error SSE:', error.message);
  }

  // 6. Verificar variables de entorno
  console.log('\n🔧 6. Verificando variables de entorno...');
  const envVars = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN', 
    'TWILIO_PHONE_NUMBER',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  envVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      const displayValue = varName.includes('TOKEN') || varName.includes('KEY') 
        ? `${value.substring(0, 10)}...` 
        : value;
      console.log(`✅ ${varName}: ${displayValue}`);
    } else {
      console.log(`❌ ${varName}: NO CONFIGURADA`);
    }
  });

  console.log('\n🏁 Diagnóstico completado');
}

diagnosticarChat().catch(console.error); 