import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../../lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    // Marcar todos los mensajes recibidos como leídos
    const { error } = await supabase
      .from('whatsapp_messages')
      .update({ status: 'read' })
      .eq('message_type', 'text')
      .eq('status', 'delivered');

    if (error) {
      console.error('Error marcando todos los mensajes como leídos:', error);
      return NextResponse.json({ error: 'Error updating messages' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Todos los mensajes marcados como leídos' 
    });
  } catch (error) {
    console.error('Error en mark-all-as-read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
