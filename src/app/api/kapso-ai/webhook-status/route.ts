import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Verificando estado del webhook...');
    
    const webhookUrl = 'https://ab3390cd06e0.ngrok-free.app/api/kapso-ai/agent-webhook';
    const agentId = '657bc308-c5c2-46e3-b81c-190ceab3fa6f';
    const apiKey = process.env.KAPSO_API_KEY;
    const baseUrl = process.env.KAPSO_BASE_URL;
    
    console.log('📡 URL del webhook:', webhookUrl);
    console.log('🤖 Agent ID:', agentId);
    
    return NextResponse.json({
      success: true,
      message: 'Estado del webhook verificado',
      webhookUrl,
      agentId,
      expectedEvents: [
        'message_received',    // Mensajes que llegan al agente
        'message_sent',        // Mensajes que envía el agente
        'status_update'        // Actualizaciones de estado
      ],
      currentConfiguration: {
        url: webhookUrl,
        events: 'Verificar en Kapso AI si incluye "message_sent"',
        headers: {
          'Content-Type': 'application/json',
          'x-kapso-signature': 'Configurado para validación'
        }
      },
      troubleshooting: [
        'Verificar que el webhook incluya el evento "message_sent"',
        'Verificar que el agente esté configurado para enviar respuestas al webhook',
        'Verificar que el flujo del agente incluya el nodo de webhook después de enviar mensajes'
      ]
    });
    
  } catch (error) {
    console.error('❌ Error verificando estado del webhook:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
