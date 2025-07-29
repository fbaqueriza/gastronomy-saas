import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Verificar que las variables de entorno estén disponibles
if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Supabase no configurado para sse-status');
}

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('contactId');
    
    console.log('🔍 Verificando estado SSE para contacto:', contactId);
    
    if (!supabase) {
      console.warn('⚠️ Supabase no configurado, retornando estado vacío');
      return NextResponse.json({ 
        success: true,
        status: {
          timestamp: new Date().toISOString(),
          totalActiveClients: 0,
          contactSpecific: contactId ? {
            contactId,
            isActive: false,
            lastSeen: null
          } : null,
          allClients: [],
          tableError: 'Supabase no configurado'
        }
      });
    }
    
    // Verificar si la tabla existe y obtener clientes activos
    let activeClients = [];
    let tableError = null;
    
    try {
      // Primero obtener todos los clientes para ver la estructura
      const { data, error } = await supabase
        .from('whatsapp_clients')
        .select('*')
        .limit(10);
      
      if (error) {
        console.error('Error obteniendo clientes:', error);
        tableError = error.message;
      } else {
        // Filtrar clientes activos basado en la estructura real
        activeClients = (data || []).filter(client => {
          // Verificar si el cliente está activo basado en last_seen o timestamp
          if (client.last_seen) {
            const lastSeen = new Date(client.last_seen);
            const now = new Date();
            const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);
            return diffMinutes < 5; // Considerar activo si se vio en los últimos 5 minutos
          }
          return true; // Si no hay last_seen, considerar activo
        });
      }
    } catch (error) {
      console.error('Error en consulta a BD:', error);
      tableError = error instanceof Error ? error.message : 'Error desconocido';
    }
    
    const status = {
      timestamp: new Date().toISOString(),
      totalActiveClients: activeClients.length,
      contactSpecific: contactId ? {
        contactId,
        isActive: activeClients.some(client => client.contact_id === contactId) || false,
        lastSeen: activeClients.find(client => client.contact_id === contactId)?.last_seen
      } : null,
      allClients: activeClients,
      tableError: tableError
    };
    
    console.log('📊 Estado SSE:', status);
    
    return NextResponse.json({
      success: true,
      status
    });
    
  } catch (error) {
    console.error('Error verificando estado SSE:', error);
    return NextResponse.json({ 
      error: 'Error verificando estado SSE',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
} 