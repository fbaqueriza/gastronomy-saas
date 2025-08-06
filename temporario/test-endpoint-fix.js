// Script para probar el endpoint corregido
const testEndpointFix = async () => {
  console.log('🧪 Probando endpoint corregido...');
  
  const testNumbers = [
    '+5491135562673',
    '5491135562673',
    '91135562673',
    '+54 9 11 3556 2673'
  ];
  
  for (const number of testNumbers) {
    console.log(`\n📞 Probando con número: ${number}`);
    
    try {
      const response = await fetch(`http://localhost:3001/api/whatsapp/messages?contactId=${encodeURIComponent(number)}`);
      const data = await response.json();
      
      console.log('✅ Resultado:', {
        contactId: number,
        count: data.count || 0,
        messages: data.messages?.length || 0,
        error: data.error
      });
      
      if (data.messages && data.messages.length > 0) {
        console.log('📋 Mensajes encontrados:');
        data.messages.forEach((msg, index) => {
          console.log(`  ${index + 1}. [${msg.contact_id === '670680919470999' ? 'SENT' : 'RECEIVED'}] ${msg.content?.substring(0, 30)}...`);
        });
      }
    } catch (error) {
      console.error('❌ Error:', error);
    }
  }
  
  console.log('\n🏁 Prueba completada');
};

// Ejecutar prueba
testEndpointFix(); 