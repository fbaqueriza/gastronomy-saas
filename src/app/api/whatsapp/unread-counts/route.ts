import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Función para normalizar números de teléfono
function normalizePhoneNumber(phone: string): string {
  // Remover espacios, guiones y paréntesis
  let normalized = phone.replace(/[\s\-\(\)]/g, '');
  
  // Agregar + si no tiene
  if (!normalized.startsWith('+')) {
    normalized = `+${normalized}`;
  }
  
  return normalized;
}

export async function GET(request: NextRequest) {
  try {
    // Usar una consulta más eficiente con agregación en la base de datos
    const { data: unreadCounts, error } = await supabase
      .from('whatsapp_messages')
      .select('contact_id')
      .in('message_type', ['received', 'text']) // Solo mensajes entrantes
      .neq('status', 'read') // No leídos
      .is('read_at', null);

    if (error) {
      console.error('❌ Error obteniendo mensajes no leídos:', error);
      return NextResponse.json({
        success: false,
        error: 'Error obteniendo contadores'
      }, { status: 500 });
    }

    // Procesar los resultados en memoria de manera más eficiente
    const counts: { [contactId: string]: number } = {};
    let totalUnread = 0;
    
    unreadCounts?.forEach(message => {
      if (message.contact_id) {
        const normalizedContactId = normalizePhoneNumber(message.contact_id);
        counts[normalizedContactId] = (counts[normalizedContactId] || 0) + 1;
        totalUnread++;
      }
    });

    return NextResponse.json({
      success: true,
      unreadCounts: counts,
      totalUnread
    });

  } catch (error) {
    console.error('❌ Error en unread-counts:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}
