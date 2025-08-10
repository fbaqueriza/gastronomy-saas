import { NextRequest, NextResponse } from 'next/server';
import { metaWhatsAppService } from '../../../../lib/metaWhatsAppService';
import { sendMessageToContact } from '../../../../lib/sseUtils';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 TEST-WEBHOOK - Simulando mensaje entrante...');
    
    const body = await request.json();
    const { from, content, messageType = 'text' } = body;
    
    if (!from || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: from and content' },
        { status: 400 }
      );
    }
    
    // Simular mensaje entrante como si viniera de WhatsApp
    const simulatedMessage = {
      id: `test_webhook_${Date.now()}`,
      from: from,
      to: '5491141780300', // Tu número de WhatsApp Business
      text: {
        body: content
      },
      timestamp: new Date().toISOString(),
      type: messageType
    };
    
    console.log('📥 TEST-WEBHOOK - Procesando mensaje simulado:', simulatedMessage);
    
    // Procesar el mensaje como si fuera real
    await metaWhatsAppService.processIncomingMessage(simulatedMessage);
    
    // Enviar por SSE para tiempo real
    const sseMessage = {
      type: 'whatsapp_message',
      contactId: from,
      id: simulatedMessage.id,
      content: content,
      timestamp: new Date().toISOString()
    };
    
    console.log('📤 TEST-WEBHOOK - Enviando mensaje SSE:', sseMessage);
    sendMessageToContact(from, sseMessage);
    
    return NextResponse.json({
      success: true,
      message: 'Simulated incoming message processed successfully',
      messageId: simulatedMessage.id,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('💥 TEST-WEBHOOK - Error:', error);
    return NextResponse.json(
      { error: 'Error processing simulated webhook' },
      { status: 500 }
    );
  }
} 