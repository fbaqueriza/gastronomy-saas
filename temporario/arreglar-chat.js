// Script para arreglar el chat
// Copia y pega esto en la consola del navegador (F12)

console.log('🔧 ARREGLANDO EL CHAT...');

// 1. Limpiar localStorage completamente
console.log('🧹 Limpiando localStorage...');
Object.keys(localStorage).forEach(key => {
  if (key.toLowerCase().includes('whatsapp') || key.toLowerCase().includes('message')) {
    localStorage.removeItem(key);
    console.log(`✅ Eliminado: ${key}`);
  }
});

// 2. Forzar conexión SSE
console.log('🔌 Forzando conexión SSE...');
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

// 3. Recargar página después de 3 segundos
setTimeout(() => {
  console.log('🔄 Recargando página...');
  window.location.reload();
}, 3000); 