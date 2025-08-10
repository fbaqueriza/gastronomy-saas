import { NextRequest, NextResponse } from 'next/server';
import { metaWhatsAppService } from '../../../../lib/metaWhatsAppService';
import { sendMessageToClients } from '../../../../lib/sseUtils';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('💥 TEST - Error parsing JSON:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { to, message, simulateIncoming = false } = body;

    console.log('🧪 TEST - Enviando mensaje de prueba:', { to, message, simulateIncoming });

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to and message' },
        { status: 400 }
      );
    }

    // Enviar mensaje real
    const result = await metaWhatsAppService.sendMessage(to, message);
    
    if (result && (result.id || result.simulated || result.messages)) {
      console.log('✅ TEST - Mensaje enviado exitosamente:', result);
      
      // Si se solicita simular mensaje entrante, enviar por SSE
      if (simulateIncoming) {
        const incomingMessage = {
          type: 'whatsapp_message',
          id: `test_${Date.now()}`,
          from: to,
          to: '670680919470999', // Tu número de WhatsApp Business
          content: `Respuesta simulada a: "${message}"`,
          timestamp: new Date().toISOString(),
          status: 'delivered',
          isSimulated: true
        };
        
        console.log('📤 TEST - Enviando mensaje entrante simulado por SSE:', incomingMessage);
        sendMessageToClients(incomingMessage);
      }
      
      return NextResponse.json({
        success: true,
        messageId: result.id || result.messages?.[0]?.id,
        timestamp: new Date().toISOString(),
        simulated: result.simulated || false,
        mode: metaWhatsAppService.isSimulationModeEnabled() ? 'simulation' : 'production',
        incomingSimulated: simulateIncoming
      });
    } else {
      console.log('❌ TEST - Error enviando mensaje de prueba:', result);
      return NextResponse.json(
        { error: 'Failed to send test message' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('💥 TEST - Error en endpoint de prueba:', error);
    return NextResponse.json(
      { error: 'Error sending test message' },
      { status: 500 }
    );
  }
} 