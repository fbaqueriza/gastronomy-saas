// Script para limpiar localStorage y verificar conexión SSE
// Copia y pega esto en la consola del navegador (F12)

console.log('🧹 Limpiando localStorage...');

// Limpiar todas las claves relacionadas con WhatsApp
Object.keys(localStorage).forEach(key => {
  if (key.toLowerCase().includes('whatsapp') || key.toLowerCase().includes('message')) {
    localStorage.removeItem(key);
    console.log(`✅ Eliminado: ${key}`);
  }
});

console.log('🔌 Verificando conexión SSE...');

// Crear conexión SSE de prueba
const eventSource = new EventSource('/api/whatsapp/sse');

eventSource.onopen = () => {
  console.log('✅ SSE conectado correctamente');
};

eventSource.onmessage = (event) => {
  console.log('📨 Mensaje SSE recibido:', event.data);
};

eventSource.onerror = (error) => {
  console.error('❌ Error en SSE:', error);
};

// Verificar estado después de 5 segundos
setTimeout(() => {
  console.log('📊 Estado de conexión SSE:');
  console.log('- EventSource readyState:', eventSource.readyState);
  console.log('- URL:', eventSource.url);
  
  // Cerrar conexión de prueba
  eventSource.close();
  console.log('🔌 Conexión de prueba cerrada');
  
  console.log('🔄 Recargando página en 3 segundos...');
  setTimeout(() => {
    window.location.reload();
  }, 3000);
}, 5000); 