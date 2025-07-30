// Script para limpiar mensajes viejos del chat
// Ejecutar en el navegador en la consola de desarrollador

console.log('🧹 Iniciando limpieza de mensajes viejos...');

// 1. Limpiar localStorage
const keysToClean = [
  'whatsapp-messages-by-contact',
  'whatsapp-messages-1',
  'whatsapp-messages-2',
  'whatsapp-messages-3',
  'whatsapp-messages-4',
  'whatsapp-messages-5'
];

console.log('🗑️ Limpiando localStorage...');
keysToClean.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`✅ Eliminado: ${key}`);
  }
});

// 2. Limpiar mensajes de Supabase (si está configurado)
async function limpiarSupabase() {
  try {
    const response = await fetch('/api/whatsapp/messages', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Mensajes de Supabase eliminados:', result);
    } else {
      console.log('⚠️ No se pudo limpiar Supabase (puede no estar configurado)');
    }
  } catch (error) {
    console.log('⚠️ Error al limpiar Supabase:', error.message);
  }
}

// 3. Recargar la página para aplicar cambios
console.log('🔄 Recargando página...');
setTimeout(() => {
  window.location.reload();
}, 1000);

// Ejecutar limpieza de Supabase
limpiarSupabase(); 