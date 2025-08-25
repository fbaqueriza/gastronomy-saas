import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const messageData = await request.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Insertar el mensaje usando el service role key
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .insert({
        id: messageData.id,
        message_sid: messageData.message_sid,
        from: messageData.from,
        to: messageData.to,
        content: messageData.content,
        timestamp: messageData.timestamp,
        status: messageData.status,
        message_type: messageData.message_type,
        user_id: messageData.user_id,
        contact_id: messageData.to // Usar 'to' como contact_id
      });

    if (error) {
      console.error('Error insertando mensaje:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Mensaje guardado exitosamente',
      data
    });

  } catch (error) {
    console.error('Error en save-message:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
