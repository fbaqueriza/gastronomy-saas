import { NextRequest, NextResponse } from 'next/server';
import { MessagingService } from '@/lib/supabase/messaging';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Webhook Kapso AI Agent - Recibiendo mensaje');
    
    const body = await request.json();
    console.log('📋 Body recibido:', body);
    console.log('📋 Headers completos:', Object.fromEntries(request.headers.entries()));
    
    // Extraer datos del mensaje de Kapso AI
    const {
      from,
      message,
      agent_id,
      execution_id,
      session_id,
      timestamp = new Date().toISOString()
    } = body;
    
    if (!from || !message) {
      console.log('❌ Datos incompletos en el webhook');
      console.log('📋 Datos disponibles:', { from, message, agent_id, execution_id, session_id });
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }
    
    // Crear payload para el servicio de mensajería
    const payload = {
      from,
      to: process.env.WHATSAPP_PHONE_NUMBER_ID || '670680919470999',
      message,
      agent_id,
      execution_id,
      session_id,
      message_id: `${execution_id}_${Date.now()}`, // Generar ID único
      type: 'message_received',
      timestamp
    };
    
    console.log('💾 Guardando mensaje en Supabase:', payload);
    
    // Guardar mensaje en Supabase
    const savedMessage = await MessagingService.saveMessage(payload, 'kapso_agent');
    
    if (!savedMessage) {
      console.log('❌ Error guardando mensaje');
      return NextResponse.json(
        { error: 'Error guardando mensaje' },
        { status: 500 }
      );
    }
    
    console.log('✅ Mensaje guardado exitosamente:', savedMessage.id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Mensaje recibido y procesado',
      message_id: savedMessage.id,
      source: 'kapso_agent',
      execution_id,
      session_id
    });
    
  } catch (error) {
    console.error('❌ Error procesando webhook de Kapso AI Agent:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Webhook de Kapso AI Agent funcionando',
    timestamp: new Date().toISOString(),
    webhook_url: 'https://ab3390cd06e0.ngrok-free.app/api/kapso-ai/agent-webhook',
    expected_format: {
      from: 'string (número de teléfono)',
      message: 'string (contenido del mensaje)',
      agent_id: 'string (ID del agente)',
      execution_id: 'string (ID de la ejecución)',
      session_id: 'string (ID de la sesión)',
      timestamp: 'string (ISO timestamp)'
    }
  });
}
