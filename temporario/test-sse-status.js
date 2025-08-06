// Script simple para probar el estado SSE
const testSSEStatus = async () => {
  console.log('🧪 Probando estado SSE...');
  
  try {
    const response = await fetch('http://localhost:3001/api/whatsapp/sse-status');
    const data = await response.json();
    console.log('✅ Estado SSE:', data);
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

testSSEStatus(); 