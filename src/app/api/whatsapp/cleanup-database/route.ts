import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../../lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    // Obtener todos los mensajes
    const { data: messages, error: fetchError } = await supabase
      .from('whatsapp_messages')
      .select('*');

    if (fetchError) {
      return NextResponse.json({ error: 'Error fetching messages' }, { status: 500 });
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json({ message: 'No messages found' });
    }

    // Filtrar mensajes con contact_id incorrecto
    const messagesToUpdate = messages.filter((msg: any) => 
      msg.contact_id === '+670680919470999' || 
      msg.contact_id === '670680919470999'
    );

    if (messagesToUpdate.length === 0) {
      return NextResponse.json({ message: 'No messages to clean up' });
    }

    // Actualizar cada mensaje con el contact_id correcto
    let successCount = 0;
    let errorCount = 0;

    for (const message of messagesToUpdate) {
      const { error: updateError } = await supabase
        .from('whatsapp_messages')
        .update({ contact_id: '+5491112345678' })
        .eq('id', message.id);

      if (updateError) {
        errorCount++;
      } else {
        successCount++;
      }
    }

    return NextResponse.json({
      message: `Database cleanup completed`,
      totalMessages: messages.length,
      messagesToUpdate: messagesToUpdate.length,
      updatedMessages: successCount,
      errors: errorCount
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
