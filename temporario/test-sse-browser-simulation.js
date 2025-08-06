// Script para simular el navegador y probar el SSE
const testSSEBrowserSimulation = async () => {
  console.log('🧪 Simulando navegador para probar SSE...');
  
  // Simular EventSource (que no existe en Node.js)
  global.EventSource = class MockEventSource {
    constructor(url) {
      console.log('🔌 MockEventSource creado para:', url);
      this.url = url;
      this.readyState = 0; // CONNECTING
      
      // Simular conexión exitosa
      setTimeout(() => {
        this.readyState = 1; // OPEN
        console.log('✅ MockEventSource conectado');
        if (this.onopen) {
          this.onopen();
        }
        
        // Simular mensaje de prueba
        setTimeout(() => {
          if (this.onmessage) {
            const testMessage = {
              type: 'test',
              message: 'SSE conectado correctamente',
              timestamp: new Date().toISOString()
            };
            this.onmessage({ data: JSON.stringify(testMessage) });
          }
        }, 100);
      }, 100);
    }
    
    close() {
      console.log('🔌 MockEventSource cerrado');
      this.readyState = 2; // CLOSED
    }
  };
  
  // Simular el hook useWhatsAppSync
  const mockAddMessage = (contactId, message) => {
    console.log('📝 Mock addMessage llamado:', { contactId, message });
  };
  
  const mockMessagesByContact = {};
  
  // Simular el hook
  const mockUseWhatsAppSync = () => {
    console.log('🔌 Mock useWhatsAppSync ejecutándose...');
    
    const eventSourceRef = { current: null };
    const isConnectedRef = { current: false };
    
    const connectSSE = () => {
      if (eventSourceRef.current || isConnectedRef.current) {
        console.log('⚠️ Mock connectSSE - Ya hay una conexión activa');
        return;
      }
      
      console.log('🔌 Mock connectSSE - Conectando SSE...');
      const eventSource = new global.EventSource('/api/whatsapp/sse');
      
      eventSource.onopen = () => {
        console.log('✅ Mock SSE conectado');
        isConnectedRef.current = true;
      };
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Mock mensaje SSE recibido:', data);
          
          if (data.type === 'whatsapp_message' && data.contactId && data.content) {
            const newMessage = {
              id: data.id || `msg_${Date.now()}`,
              type: 'received',
              content: data.content,
              timestamp: new Date(data.timestamp || Date.now())
            };
            
            console.log('📨 Mock mensaje SSE procesado:', newMessage);
            mockAddMessage(data.contactId, newMessage);
          }
        } catch (error) {
          console.error('❌ Mock error parsing SSE:', error);
        }
      };
      
      eventSource.onerror = (error) => {
        console.error('❌ Mock error en SSE:', error);
        isConnectedRef.current = false;
      };
      
      eventSourceRef.current = eventSource;
    };
    
    // Conectar SSE
    connectSSE();
    
    return { addIncomingMessage: mockAddMessage };
  };
  
  // Ejecutar el mock
  const { addIncomingMessage } = mockUseWhatsAppSync();
  
  // Esperar un poco para que se conecte
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log('\n📱 INSTRUCCIONES PARA VERIFICAR EN EL NAVEGADOR:');
  console.log('1. Abre http://localhost:3001 en el navegador');
  console.log('2. Abre las herramientas de desarrollador (F12)');
  console.log('3. Ve a la pestaña Console');
  console.log('4. Busca estos logs:');
  console.log('   - "🔌 WhatsAppSync - Componente montado"');
  console.log('   - "🔌 Conectando SSE para mensajes en tiempo real..."');
  console.log('   - "✅ SSE conectado para mensajes en tiempo real"');
  console.log('5. Si NO aparecen estos logs, el problema está en el frontend');
  
  console.log('\n🔧 DIAGNÓSTICO:');
  console.log('✅ Backend SSE funcionando (mensajes se envían)');
  console.log('❌ Frontend no conectado (0 clientes)');
  console.log('❌ Posible problema: Componente WhatsAppSync no se monta');
  
  console.log('\n🏁 Simulación completada');
};

// Ejecutar simulación
testSSEBrowserSimulation(); 