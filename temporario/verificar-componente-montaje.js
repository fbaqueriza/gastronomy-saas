// Script para verificar si el componente se está montando
const verificarComponenteMontaje = async () => {
  console.log('🔍 VERIFICANDO MONTAJE DEL COMPONENTE');
  console.log('=======================================');
  
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
    console.log('✅ Estado SSE:', sseData.status.totalActiveClients);
  } catch (error) {
    console.error('❌ Error verificando SSE:', error.message);
  }
  
  console.log('\n📱 INSTRUCCIONES PARA VERIFICAR:');
  console.log('1. Abre http://localhost:3001 en el navegador');
  console.log('2. Abre las herramientas de desarrollador (F12)');
  console.log('3. Ve a la pestaña Console');
  console.log('4. Busca estos logs EN ORDEN:');
  console.log('   - "🔌 WhatsAppSync - Componente montado"');
  console.log('   - "✅ WhatsAppSync - Hook ejecutado correctamente"');
  console.log('   - "🔌 Conectando SSE para mensajes en tiempo real..."');
  console.log('   - "✅ SSE conectado para mensajes en tiempo real"');
  
  console.log('\n🔧 DIAGNÓSTICO POR LOGS:');
  console.log('❌ Si NO aparece "Componente montado": Layout no renderiza el componente');
  console.log('❌ Si aparece "Componente montado" pero NO "Hook ejecutado": Error en el hook');
  console.log('❌ Si aparece "Hook ejecutado" pero NO "Conectando SSE": Error en EventSource');
  console.log('❌ Si aparece "Conectando SSE" pero NO "SSE conectado": Error de conexión');
  console.log('✅ Si aparecen TODOS los logs: El problema está en otro lugar');
  
  console.log('\n📋 ESTADO ESPERADO:');
  console.log('✅ totalActiveClients: debería ser mayor que 0');
  console.log('✅ Todos los logs deberían aparecer en orden');
  console.log('✅ Mensajes SSE deberían recibirse en tiempo real');
  
  console.log('\n🏁 Verificación completada');
};

// Ejecutar verificación
verificarComponenteMontaje(); 