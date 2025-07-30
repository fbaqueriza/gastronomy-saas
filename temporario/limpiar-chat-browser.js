// Script para limpiar mensajes viejos del chat
// Copia y pega esto en la consola del navegador (F12)

console.log('🧹 Limpiando mensajes viejos del chat...');

// Lista de todas las claves que pueden contener mensajes
const keysToClean = [
  'whatsapp-messages-by-contact',
  'whatsapp-messages-1',
  'whatsapp-messages-2', 
  'whatsapp-messages-3',
  'whatsapp-messages-4',
  'whatsapp-messages-5',
  'whatsapp-messages-6',
  'whatsapp-messages-7',
  'whatsapp-messages-8',
  'whatsapp-messages-9',
  'whatsapp-messages-10'
];

let deletedCount = 0;

// Limpiar cada clave
keysToClean.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`✅ Eliminado: ${key}`);
    deletedCount++;
  }
});

// Buscar y eliminar cualquier otra clave que contenga "whatsapp"
Object.keys(localStorage).forEach(key => {
  if (key.toLowerCase().includes('whatsapp') || key.toLowerCase().includes('message')) {
    localStorage.removeItem(key);
    console.log(`✅ Eliminado: ${key}`);
    deletedCount++;
  }
});

console.log(`🎉 Limpieza completada! Se eliminaron ${deletedCount} elementos.`);
console.log('🔄 Recargando página en 2 segundos...');

setTimeout(() => {
  window.location.reload();
}, 2000); 