import { NextRequest, NextResponse } from 'next/server';
import { sendMessageToClients } from '../../../../lib/sseUtils';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    const { from, content, messageType = 'text' } = await request.json();

    console.log('📥 SIMULATE - Mensaje entrante simulado:', { from, content, messageType });

    if (!from || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: from and content' },
        { status: 400 }
      );
    }

    // Generar ID simulado
    const messageId = `sim_incoming_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Crear mensaje entrante simulado
    const incomingMessage = {
      type: 'whatsapp_message',
      id: messageId,
      from: from,
      to: '670680919470999', // Tu número de WhatsApp Business
      content: content,
      timestamp: new Date().toISOString(),
      status: 'delivered',
      isSimulated: true,
      messageType: messageType
    };

    console.log('📤 SIMULATE - Enviando mensaje entrante por SSE:', incomingMessage);
    
    // Enviar por SSE a todos los clientes conectados
    sendMessageToClients(incomingMessage);

    // Guardar en base de datos
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('whatsapp_messages')
          .insert([{
            message_sid: messageId,
            contact_id: from,
            content: content,
            message_type: messageType,
            status: 'delivered',
            user_id: 'default_user',
            timestamp: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) {
          console.error('Error guardando mensaje simulado:', error);
        } else {
          console.log('✅ SIMULATE - Mensaje simulado guardado en BD:', data);
        }
      } catch (error) {
        console.error('Error guardando mensaje simulado:', error);
      }
    }

    return NextResponse.json({
      success: true,
      messageId: messageId,
      timestamp: new Date().toISOString(),
      simulated: true,
      message: 'Mensaje entrante simulado enviado correctamente'
    });

  } catch (error) {
    console.error('💥 SIMULATE - Error simulando mensaje entrante:', error);
    return NextResponse.json(
      { error: 'Error simulating incoming message' },
      { status: 500 }
    );
  }
}
