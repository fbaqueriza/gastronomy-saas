// SCRIPT COMPLETO PARA LIMPIAR TODO Y ARREGLAR EL CHAT
// Copia y pega esto en la consola del navegador (F12)

console.log('🔧 LIMPIEZA COMPLETA DEL CHAT INICIADA...');

// 1. LIMPIAR LOCALSTORAGE COMPLETAMENTE
console.log('\n1️⃣ LIMPIANDO LOCALSTORAGE...');
let deletedCount = 0;
Object.keys(localStorage).forEach(key => {
  if (key.toLowerCase().includes('whatsapp') || key.toLowerCase().includes('message')) {
    localStorage.removeItem(key);
    console.log(`✅ Eliminado: ${key}`);
    deletedCount++;
  }
});
console.log(`📊 Total eliminado: ${deletedCount} elementos`);

// 2. FORZAR CONEXIÓN SSE
console.log('\n2️⃣ FORZANDO CONEXIÓN SSE...');
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

// 3. VERIFICAR ESTADO DEL CHAT
console.log('\n3️⃣ VERIFICANDO ESTADO DEL CHAT...');
setTimeout(() => {
  console.log('📊 Estado de conexión SSE:');
  console.log('- EventSource readyState:', eventSource.readyState);
  console.log('- URL:', eventSource.url);
  
  // Verificar si hay mensajes en localStorage
  const whatsappKeys = Object.keys(localStorage).filter(key => 
    key.toLowerCase().includes('whatsapp')
  );
  console.log('- Claves de WhatsApp en localStorage:', whatsappKeys);
  
  // Verificar si el componente de chat está presente
  const chatElements = document.querySelectorAll('[class*="chat"], [class*="Chat"]');
  console.log('- Elementos de chat encontrados:', chatElements.length);
  
  // Verificar si hay proveedores cargados
  const providerElements = document.querySelectorAll('[class*="provider"], [class*="Provider"]');
  console.log('- Elementos de proveedores encontrados:', providerElements.length);
  
  // 4. SIMULAR MENSAJE DE PRUEBA
  console.log('\n4️⃣ SIMULANDO MENSAJE DE PRUEBA...');
  
  // Crear un mensaje de prueba para verificar que funciona
  const testMessage = {
    id: `test_${Date.now()}`,
    type: 'received',
    content: 'Mensaje de prueba - Chat arreglado',
    timestamp: new Date().toISOString(),
    contactId: '+5491135562673',
    status: 'received'
  };
  
  console.log('📝 Mensaje de prueba creado:', testMessage);
  
  // 5. RECARGAR PÁGINA
  console.log('\n5️⃣ RECARGANDO PÁGINA...');
  setTimeout(() => {
    console.log('🔄 Recargando página en 3 segundos...');
    console.log('✅ Limpieza completada. El chat debería funcionar ahora.');
    
    // Cerrar conexión de prueba
    eventSource.close();
    console.log('🔌 Conexión de prueba cerrada');
    
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  }, 2000);
  
}, 3000); 