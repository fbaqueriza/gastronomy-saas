// Script para limpiar mensajes desde el servidor
const fetch = require('node-fetch');

async function limpiarMensajes() {
  console.log('🧹 LIMPIANDO MENSAJES DESDE EL SERVIDOR...');
  
  try {
    // 1. Limpiar mensajes de Supabase
    console.log('📊 Limpiando mensajes de Supabase...');
    const deleteResponse = await fetch('http://localhost:3001/api/whatsapp/messages', {
      method: 'DELETE'
    });
    
    if (deleteResponse.ok) {
      console.log('✅ Mensajes de Supabase eliminados');
    } else {
      console.log('⚠️ No se pudieron eliminar mensajes de Supabase');
    }
    
    // 2. Verificar estado SSE
    console.log('🔌 Verificando estado SSE...');
    const sseStatusResponse = await fetch('http://localhost:3001/api/whatsapp/sse-status');
    const sseStatus = await sseStatusResponse.json();
    console.log('📊 Estado SSE:', sseStatus.status);
    
    // 3. Probar conexión SSE
    console.log('🔌 Probando conexión SSE...');
    const sseResponse = await fetch('http://localhost:3001/api/whatsapp/sse');
    console.log('📡 Respuesta SSE:', sseResponse.status);
    
    // 4. Verificar configuración de Twilio
    console.log('📱 Verificando configuración de Twilio...');
    const configResponse = await fetch('http://localhost:3001/api/whatsapp/config');
    const config = await configResponse.json();
    console.log('📊 Configuración:', config.config);
    
    console.log('✅ Limpieza completada desde el servidor');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  }
}

limpiarMensajes(); 