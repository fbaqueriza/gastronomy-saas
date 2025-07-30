import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Forzar que este endpoint sea dinámico
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Verificar que las variables de entorno estén disponibles
if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Supabase no configurado para messages');
}

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// GET: Obtener mensajes de un contacto
export async function GET(request: NextRequest) {
  try {
    const contactId = request.nextUrl.searchParams.get('contactId');
    const userId = request.nextUrl.searchParams.get('userId');

    console.log('📥 Obteniendo mensajes:', { contactId, userId });

    // Por ahora, devolver mensajes vacíos ya que Supabase no está configurado correctamente
    console.log('📥 Retornando mensajes vacíos (Supabase no configurado)');
    return NextResponse.json({ 
      messages: [],
      error: 'Supabase no configurado correctamente'
    });

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

    if (!supabase) {
      console.warn('⚠️ Supabase no configurado, no se puede guardar mensaje');
      return NextResponse.json({ 
        error: 'Supabase no configurado'
      }, { status: 500 });
    }

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

// DELETE: Limpiar todos los mensajes
export async function DELETE(request: NextRequest) {
  try {
    console.log('🧹 Limpiando todos los mensajes...');

    if (!supabase) {
      console.warn('⚠️ Supabase no configurado, no se pueden limpiar mensajes');
      return NextResponse.json({ 
        error: 'Supabase no configurado'
      }, { status: 500 });
    }

    const { error } = await supabase
      .from('whatsapp_messages')
      .delete()
      .neq('id', 0); // Eliminar todos los registros

    if (error) {
      console.error('Error limpiando mensajes:', error);
      return NextResponse.json({ error: 'Error limpiando mensajes' }, { status: 500 });
    }

    console.log('✅ Todos los mensajes eliminados exitosamente');
    return NextResponse.json({ 
      success: true, 
      message: 'Todos los mensajes han sido eliminados' 
    });

  } catch (error) {
    console.error('Error en DELETE /api/whatsapp/messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 