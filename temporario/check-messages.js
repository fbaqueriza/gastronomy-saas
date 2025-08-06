// Script para verificar mensajes guardados en la base de datos
const checkMessages = async () => {
  console.log('📊 Verificando mensajes guardados...');
  
  try {
    const response = await fetch('http://localhost:3001/api/whatsapp/statistics');
    const stats = await response.json();
    
    console.log('📈 Estadísticas actuales:', stats);
    
    // También verificar el estado del servicio
    const statusResponse = await fetch('http://localhost:3001/api/whatsapp/status');
    const status = await statusResponse.json();
    
    console.log('🔍 Estado del servicio:', status);
    
  } catch (error) {
    console.error('❌ Error verificando mensajes:', error);
  }
};

checkMessages(); 