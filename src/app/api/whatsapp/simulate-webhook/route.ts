import { NextRequest, NextResponse } from 'next/server';
import { sendMessageToClients } from '../../../../lib/sseUtils';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 SIMULACIÓN - Recibiendo mensaje simulado de Ligiene...');
    
    const body = await request.json();
    const { from, content } = body;
    
    if (!from || !content) {
      return NextResponse.json({ 
        success: false, 
        error: 'from y content son requeridos' 
      }, { status: 400 });
    }
    
    // Simular mensaje real de WhatsApp Business API
    const webhookMessage = {
      type: 'whatsapp_message',
      contactId: from.startsWith('+') ? from : `+${from}`,
      id: `wamid_${Date.now()}`,
      content: content,
      timestamp: new Date().toISOString(),
      status: 'delivered'
    };
    
    console.log('🧪 SIMULACIÓN - Enviando mensaje SSE:', webhookMessage);
    
    // Enviar por SSE como si fuera un webhook real
    sendMessageToClients(webhookMessage);
    
    console.log('✅ SIMULACIÓN - Mensaje enviado exitosamente');
    
    return NextResponse.json({
      success: true,
      message: 'Mensaje simulado enviado por SSE',
      data: webhookMessage
    });
    
  } catch (error) {
    console.error('❌ SIMULACIÓN - Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
