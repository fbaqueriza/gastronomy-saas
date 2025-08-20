import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Función para normalizar números de teléfono
function normalizePhoneNumber(phone: string): string {
  let normalized = phone.replace(/[\s\-\(\)]/g, '');
  if (!normalized.startsWith('+')) {
    normalized = `+${normalized}`;
  }
  return normalized;
}

export async function GET(request: NextRequest) {
  try {
    // Obtener contactos únicos con su último mensaje
    const { data: contacts, error } = await supabase
      .from('whatsapp_messages')
      .select('contact_id, content, created_at, status, read_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo contactos:', error);
      return NextResponse.json({
        success: false,
        error: 'Error obteniendo contactos'
      }, { status: 500 });
    }

    // Procesar y agrupar por contacto
    const contactMap = new Map();
    
    contacts?.forEach(message => {
      if (message.contact_id) {
        const normalizedContactId = normalizePhoneNumber(message.contact_id);
        
        if (!contactMap.has(normalizedContactId)) {
          contactMap.set(normalizedContactId, {
            contactId: normalizedContactId,
            lastMessage: message.content,
            lastMessageTime: message.created_at,
            unreadCount: 0
          });
        }
        
        // Contar mensajes no leídos
        if (message.status === 'delivered' && !message.read_at) {
          const contact = contactMap.get(normalizedContactId);
          contact.unreadCount++;
        }
      }
    });

    const uniqueContacts = Array.from(contactMap.values())
      .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

    return NextResponse.json({
      success: true,
      contacts: uniqueContacts,
      count: uniqueContacts.length,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('❌ Error en contacts:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}
