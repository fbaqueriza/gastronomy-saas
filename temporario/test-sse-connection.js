// Script para probar la conexión SSE directamente
const testSSEConnection = () => {
  console.log('🧪 Probando conexión SSE directamente...');
  
  // Crear conexión SSE
  const eventSource = new EventSource('http://localhost:3001/api/whatsapp/sse');
  
  eventSource.onopen = () => {
    console.log('✅ SSE conectado exitosamente');
  };
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('📨 Mensaje SSE recibido:', data);
      
      if (data.type === 'test' || data.type === 'ping') {
        console.log('🔄 SSE ping/test recibido');
      } else if (data.type === 'whatsapp_message') {
        console.log('📨 Mensaje de WhatsApp recibido:', data);
      }
    } catch (error) {
      console.error('❌ Error parsing SSE message:', error);
    }
  };
  
  eventSource.onerror = (error) => {
    console.error('❌ Error en SSE:', error);
  };
  
  // Mantener la conexión abierta por 30 segundos
  setTimeout(() => {
    console.log('🔌 Cerrando conexión SSE de prueba');
    eventSource.close();
    process.exit(0);
  }, 30000);
  
  console.log('📡 Escuchando mensajes SSE por 30 segundos...');
};

// Ejecutar prueba
testSSEConnection(); 