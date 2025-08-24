import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, from } = body;

    console.log('🧪 Procesando mensaje de prueba:', { content, from });

    // Generar UUID para el mensaje
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    // Guardar mensaje de prueba directamente como LEÍDO
    const messageData = {
      id: generateUUID(),
      content: content || 'Mensaje de prueba',
      timestamp: new Date().toISOString(),
      message_sid: `test_${Date.now()}`,
      contact_id: from || '+5491112345678',
      message_type: 'text',
      user_id: 'default_user',
      status: 'read' // IMPORTANTE: Guardar como LEÍDO
    };

    const { error } = await supabase
      .from('whatsapp_messages')
      .insert(messageData);
    
    if (error) {
      console.error('Error guardando mensaje de prueba:', error);
      return NextResponse.json({
        success: false,
        error: 'Error guardando mensaje'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Mensaje de prueba procesado',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error procesando mensaje de prueba:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
