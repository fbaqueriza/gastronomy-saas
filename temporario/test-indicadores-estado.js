// Script para probar indicadores de estado de mensajes
// Ejecutar en el navegador en la consola de desarrollador

console.log('🧪 Iniciando prueba de indicadores de estado...');

// Función para enviar mensaje y observar estados
async function testIndicadoresEstado() {
  const testMessage = `Prueba de indicadores - ${new Date().toLocaleTimeString()}`;
  
  console.log('📤 Enviando mensaje de prueba:', testMessage);
  
  try {
    const response = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: '+5491135562673',
        message: testMessage
      }),
    });

    const result = await response.json();
    console.log('✅ Mensaje enviado:', result);
    
    // Observar cambios de estado
    console.log('⏱️ Observando cambios de estado...');
    console.log('📊 Estados esperados:');
    console.log('  1. ✓ (enviado) - inmediato');
    console.log('  2. ✓✓ (entregado) - después de respuesta exitosa');
    console.log('  3. ✓✓ (leído) - después de 2 segundos');
    
    return result;
  } catch (error) {
    console.error('❌ Error enviando mensaje:', error);
  }
}

// Función para verificar estados en el chat
function verificarEstadosEnChat() {
  console.log('🔍 Verificando estados en el chat...');
  
  // Buscar mensajes en el DOM
  const mensajes = document.querySelectorAll('[class*="bg-green-500"]');
  console.log(`📝 Encontrados ${mensajes.length} mensajes enviados`);
  
  mensajes.forEach((mensaje, index) => {
    const timestamp = mensaje.querySelector('.text-xs');
    if (timestamp) {
      console.log(`Mensaje ${index + 1}:`, timestamp.textContent);
    }
  });
}

// Ejecutar prueba
testIndicadoresEstado().then(() => {
  console.log('⏳ Esperando 5 segundos para verificar estados...');
  setTimeout(() => {
    verificarEstadosEnChat();
    console.log('✅ Prueba completada. Revisa los indicadores en el chat.');
  }, 5000);
});

console.log('💡 Instrucciones:');
console.log('1. Abre el chat de WhatsApp en la aplicación');
console.log('2. Selecciona el contacto +5491135562673');
console.log('3. Observa los indicadores de estado en los mensajes');
console.log('4. Los estados deberían cambiar: ✓ → ✓✓ → ✓✓ (leído)'); 