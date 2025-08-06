// Script para verificar el esquema de la base de datos
const checkDatabaseSchema = async () => {
  console.log('🔍 Verificando esquema de la base de datos...');
  
  try {
    // Intentar insertar un mensaje de prueba con diferentes estructuras
    const testMessages = [
      {
        id: 'test_1',
        sender: 'test_user',
        recipient: 'test_recipient',
        content: 'Mensaje de prueba 1',
        timestamp: new Date().toISOString()
      },
      {
        id: 'test_2',
        from: 'test_user',
        to: 'test_recipient',
        content: 'Mensaje de prueba 2',
        timestamp: new Date().toISOString()
      }
    ];
    
    for (const message of testMessages) {
      console.log(`📝 Probando estructura:`, message);
      
      const response = await fetch('http://localhost:3001/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: '+5491135562673',
          message: `Prueba de esquema - ${message.content}`
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Envío exitoso:', result);
      } else {
        const error = await response.text();
        console.log('❌ Error en envío:', error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    console.error('💥 Error verificando esquema:', error);
  }
};

checkDatabaseSchema(); 