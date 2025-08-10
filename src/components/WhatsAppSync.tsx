'use client';

import { useWhatsAppSync } from '../hooks/useWhatsAppSync';

export default function WhatsAppSync() {

  
  try {
    useWhatsAppSync();

  } catch (error) {
    console.error('❌ WhatsAppSync - Error ejecutando hook:', error);
  }
  
  return null;
}