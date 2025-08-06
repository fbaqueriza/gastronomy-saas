// Script para verificar si el frontend está conectándose al SSE
const verificarSSEFrontend = async () => {
  console.log('🔍 VERIFICANDO CONEXIÓN SSE DEL FRONTEND');
  console.log('==========================================');
  
  // Verificar que el servidor esté funcionando
  try {
    const statusResponse = await fetch('http://localhost:3001/api/whatsapp/status');
    const statusData = await statusResponse.json();
    console.log('✅ Servidor funcionando:', statusData.service?.mode);
  } catch (error) {
    console.error('❌ Servidor no disponible:', error.message);
    return;
  }
  
  // Verificar estado SSE
  try {
    const sseResponse = await fetch('http://localhost:3001/api/whatsapp/sse-status');
    const sseData = await sseResponse.json();
    console.log('✅ Estado SSE:', sseData);
  } catch (error) {
    console.error('❌ Error verificando SSE:', error.message);
  }
  
  console.log('\n📱 INSTRUCCIONES PARA VERIFICAR:');
  console.log('1. Abre http://localhost:3001 en el navegador');
  console.log('2. Abre las herramientas de desarrollador (F12)');
  console.log('3. Ve a la pestaña Console');
  console.log('4. Busca estos logs:');
  console.log('   - "🔌 WhatsAppSync - Componente montado"');
  console.log('   - "🔌 Conectando SSE para mensajes en tiempo real..."');
  console.log('   - "✅ SSE conectado para mensajes en tiempo real"');
  console.log('5. Si aparecen estos logs, el frontend se está conectando al SSE');
  console.log('6. Si NO aparecen, hay un problema con la conexión');
  
  console.log('\n🔧 POSIBLES PROBLEMAS:');
  console.log('❌ Componente WhatsAppSync no se está montando');
  console.log('❌ Hook useWhatsAppSync no se está ejecutando');
  console.log('❌ EventSource no se puede conectar al endpoint');
  console.log('❌ CORS o problemas de red');
  
  console.log('\n📋 ESTADO ESPERADO:');
  console.log('✅ totalActiveClients: debería ser mayor que 0');
  console.log('✅ Logs de conexión SSE en la consola del navegador');
  console.log('✅ Mensajes SSE recibidos en tiempo real');
  
  console.log('\n🏁 Verificación completada');
};

// Ejecutar verificación
verificarSSEFrontend(); 