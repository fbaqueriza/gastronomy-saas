import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET: Obtener mensajes de un contacto
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('contactId');
    const userId = searchParams.get('userId');

    if (!contactId || !userId) {
      return NextResponse.json({ error: 'contactId and userId required' }, { status: 400 });
    }

    console.log('📥 Obteniendo mensajes para contacto:', contactId, 'usuario:', userId);

    // Normalizar contactId para búsqueda (remover + si existe)
    const normalizedContactId = contactId.replace(/^\+/, '');
    console.log('📥 ContactId normalizado:', normalizedContactId);

    const { data: messages, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('contact_id', contactId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error obteniendo mensajes:', error);
      return NextResponse.json({ error: 'Error obteniendo mensajes' }, { status: 500 });
    }

    console.log('📋 Mensajes obtenidos:', messages?.length || 0);
    return NextResponse.json({ messages: messages || [] });

  } catch (error) {
    console.error('Error en GET /api/whatsapp/messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Guardar un nuevo mensaje
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageSid, contactId, content, messageType, status, userId } = body;

    if (!messageSid || !contactId || !content || !messageType || !userId) {
      return NextResponse.json({ 
        error: 'messageSid, contactId, content, messageType, and userId required' 
      }, { status: 400 });
    }

    console.log('💾 Guardando mensaje:', { messageSid, contactId, content, messageType, userId });

    const { data, error } = await supabase
      .from('whatsapp_messages')
      .insert([{
        message_sid: messageSid,
        contact_id: contactId,
        content: content,
        message_type: messageType,
        status: status || 'received',
        user_id: userId,
        timestamp: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error guardando mensaje:', error);
      return NextResponse.json({ error: 'Error guardando mensaje' }, { status: 500 });
    }

    console.log('✅ Mensaje guardado exitosamente:', data);
    return NextResponse.json({ message: data });

  } catch (error) {
    console.error('Error en POST /api/whatsapp/messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 