import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Cache en memoria (se reinicia con cada deploy)
let cache = {
  data: null as any,
  timestamp: 0,
  ttl: 30000 // 30 segundos
};

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
    const now = Date.now();
    
    // Verificar si el caché es válido
    if (cache.data && (now - cache.timestamp) < cache.ttl) {
      return NextResponse.json({
        success: true,
        ...cache.data,
        cached: true,
        cacheAge: now - cache.timestamp
      });
    }

    // Obtener datos frescos
    const { data: unreadCounts, error } = await supabase
      .from('whatsapp_messages')
      .select('contact_id')
      .eq('status', 'delivered')
      .is('read_at', null);

    if (error) {
      console.error('❌ Error obteniendo mensajes no leídos:', error);
      return NextResponse.json({
        success: false,
        error: 'Error obteniendo contadores'
      }, { status: 500 });
    }

    // Procesar los resultados
    const counts: { [contactId: string]: number } = {};
    let totalUnread = 0;
    
    unreadCounts?.forEach(message => {
      if (message.contact_id) {
        const normalizedContactId = normalizePhoneNumber(message.contact_id);
        counts[normalizedContactId] = (counts[normalizedContactId] || 0) + 1;
        totalUnread++;
      }
    });

    const result = {
      unreadCounts: counts,
      totalUnread
    };

    // Actualizar caché
    cache.data = result;
    cache.timestamp = now;

    return NextResponse.json({
      success: true,
      ...result,
      cached: false,
      cacheAge: 0
    });

  } catch (error) {
    console.error('❌ Error en cached unread-counts:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

// Endpoint para invalidar caché
export async function POST(request: NextRequest) {
  cache.data = null;
  cache.timestamp = 0;
  
  return NextResponse.json({
    success: true,
    message: 'Cache invalidado'
  });
}
