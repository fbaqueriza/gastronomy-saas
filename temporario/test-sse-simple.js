// Test simple de SSE
// Copia y pega esto en la consola del navegador (F12)

console.log('🧪 TEST SIMPLE DE SSE');

// Limpiar localStorage
Object.keys(localStorage).forEach(key => {
  if (key.toLowerCase().includes('whatsapp')) {
    localStorage.removeItem(key);
    console.log(`✅ Eliminado: ${key}`);
  }
});

// Crear conexión SSE
const eventSource = new EventSource('/api/whatsapp/sse');

eventSource.onopen = () => {
  console.log('✅ SSE conectado');
};

eventSource.onmessage = (event) => {
  console.log('📨 Mensaje SSE:', event.data);
};

eventSource.onerror = (error) => {
  console.error('❌ Error SSE:', error);
};

// Verificar estado después de 5 segundos
setTimeout(() => {
  console.log('📊 Estado SSE:');
  console.log('- readyState:', eventSource.readyState);
  console.log('- URL:', eventSource.url);
  
  if (eventSource.readyState === 1) {
    console.log('✅ SSE funcionando correctamente');
  } else {
    console.log('❌ SSE no está conectado');
  }
  
  eventSource.close();
}, 5000); 