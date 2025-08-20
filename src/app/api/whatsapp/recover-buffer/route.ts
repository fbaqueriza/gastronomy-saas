import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../../lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    // Obtener mensajes recientes que no han sido leídos
    const { data: messages, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('message_type', 'text')
      .order('timestamp', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error recuperando mensajes del buffer:', error);
      return NextResponse.json({
        success: false,
        error: 'Error recuperando mensajes del buffer'
      }, { status: 500 });
    }

    // Transformar mensajes al formato SSE
    const bufferMessages = messages?.map(msg => ({
      type: 'whatsapp_message',
      contactId: msg.contact_id,
      id: msg.id,
      content: msg.content,
      timestamp: msg.timestamp,
      status: msg.status || 'delivered'
    })) || [];



    return NextResponse.json({
      success: true,
      message: 'Buffer recuperado desde base de datos',
      bufferMessages,
      count: bufferMessages.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en recover-buffer:', error);
    return NextResponse.json({
      success: false,
      error: 'Error recuperando buffer',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
