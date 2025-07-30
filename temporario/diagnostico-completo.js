// Script de diagnóstico completo para el chat de WhatsApp
// Copia y pega esto en la consola del navegador (F12)

console.log('🔍 DIAGNÓSTICO COMPLETO DEL CHAT');

// 1. Limpiar localStorage
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

// 2. Verificar conexión SSE
console.log('\n2️⃣ VERIFICANDO CONEXIÓN SSE...');
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

// 3. Verificar estado del chat
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
  
  // 4. Probar envío de mensaje
  console.log('\n4️⃣ PROBANDO ENVÍO DE MENSAJE...');
  
  // Simular clic en un proveedor si existe
  const firstProvider = document.querySelector('[data-testid="provider-item"], .provider-item, [class*="provider"]');
  if (firstProvider) {
    console.log('✅ Proveedor encontrado, simulando clic...');
    firstProvider.click();
    
    setTimeout(() => {
      // Buscar input de mensaje
      const messageInput = document.querySelector('input[placeholder*="mensaje"], textarea[placeholder*="mensaje"], input[type="text"]');
      if (messageInput) {
        console.log('✅ Input de mensaje encontrado');
        messageInput.value = 'Test de diagnóstico';
        messageInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Buscar botón de enviar
        const sendButton = document.querySelector('button[type="submit"], button:contains("Enviar"), [class*="send"]');
        if (sendButton) {
          console.log('✅ Botón de enviar encontrado, simulando clic...');
          sendButton.click();
        } else {
          console.log('❌ Botón de enviar no encontrado');
        }
      } else {
        console.log('❌ Input de mensaje no encontrado');
      }
    }, 1000);
  } else {
    console.log('❌ No se encontraron proveedores');
  }
  
  // 5. Verificar estado final
  console.log('\n5️⃣ ESTADO FINAL...');
  setTimeout(() => {
    console.log('📊 Resumen del diagnóstico:');
    console.log('- SSE conectado:', eventSource.readyState === 1);
    console.log('- localStorage limpio:', deletedCount > 0);
    console.log('- Elementos de chat:', chatElements.length);
    console.log('- Elementos de proveedores:', providerElements.length);
    
    // Cerrar conexión de prueba
    eventSource.close();
    console.log('🔌 Conexión de prueba cerrada');
    
    console.log('\n🔄 Recargando página en 5 segundos...');
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  }, 3000);
  
}, 2000); 