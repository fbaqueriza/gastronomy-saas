import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { contactId } = await request.json();
    
    if (!contactId) {
      return NextResponse.json({ error: 'contactId es requerido' }, { status: 400 });
    }

    console.log('📝 Marcando mensajes como leídos para:', contactId);

    // Actualizar todos los mensajes recibidos de este contacto como leídos
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .update({ 
        status: 'read',
        read_at: new Date().toISOString()
      })
      .eq('contact_id', contactId)
      .eq('message_type', 'text')
      .eq('status', 'delivered');

    if (error) {
      console.error('❌ Error actualizando mensajes en Supabase:', error);
      return NextResponse.json({ error: 'Error actualizando mensajes' }, { status: 500 });
    }

    console.log('✅ Mensajes marcados como leídos:', data);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Mensajes marcados como leídos',
      updatedCount: data?.length || 0
    });

  } catch (error) {
    console.error('❌ Error en mark-as-read:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
