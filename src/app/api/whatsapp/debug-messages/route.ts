import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Verificar que las variables de entorno estén disponibles
if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Supabase no configurado para debug-messages');
}

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Obteniendo todos los mensajes de la BD');
    
    if (!supabase) {
      console.warn('⚠️ Supabase no configurado, retornando respuesta vacía');
      return NextResponse.json({ 
        totalMessages: 0,
        messages: [],
        error: 'Supabase no configurado'
      });
    }
    
    const { data: messages, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error obteniendo mensajes:', error);
      return NextResponse.json({ error: 'Error obteniendo mensajes' }, { status: 500 });
    }

    console.log('📋 DEBUG: Total de mensajes en BD:', messages?.length || 0);
    console.log('📋 DEBUG: Mensajes:', messages);

    return NextResponse.json({ 
      totalMessages: messages?.length || 0,
      messages: messages || [] 
    });

  } catch (error) {
    console.error('Error en debug messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 