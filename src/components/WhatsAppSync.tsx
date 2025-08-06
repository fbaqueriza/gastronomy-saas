'use client';

import { useWhatsAppSync } from '../hooks/useWhatsAppSync';

export default function WhatsAppSync() {
  console.log('🔌 WhatsAppSync - Componente montado');
  
  try {
    useWhatsAppSync();
    console.log('✅ WhatsAppSync - Hook ejecutado correctamente');
  } catch (error) {
    console.error('❌ WhatsAppSync - Error ejecutando hook:', error);
  }
  
  return null;
}