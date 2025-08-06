// Script para verificar las variables de entorno
const checkEnvironment = async () => {
  console.log('🔍 Verificando variables de entorno...');
  
  try {
    const response = await fetch('http://localhost:3001/api/whatsapp/debug-env');
    const data = await response.json();
    console.log('📋 Variables de entorno:', data);
  } catch (error) {
    console.error('❌ Error verificando variables:', error);
  }
};

checkEnvironment(); 