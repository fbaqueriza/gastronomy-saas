import { NextRequest, NextResponse } from 'next/server';
import { whatsappService } from '../../../../lib/whatsappService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageType = 'text', content = 'Hola, esto es una prueba', from = '1234567890' } = body;

    // Simular mensaje entrante
    const mockMessage = {
      id: `msg_${Date.now()}`,
      from,
      to: 'business_phone_number',
      type: messageType,
      text: { body: content },
      timestamp: Math.floor(Date.now() / 1000)
    };

    // Procesar mensaje
    await whatsappService.receiveMessage(mockMessage);

    return NextResponse.json({
      success: true,
      message: 'Mensaje de prueba procesado',
      processedMessage: mockMessage
    });

  } catch (error) {
    console.error('Error processing test message:', error);
    return NextResponse.json({
      success: false,
      error: 'Error processing test message'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const isEnabled = whatsappService.isServiceEnabled();
    
    return NextResponse.json({
      serviceEnabled: isEnabled,
      message: isEnabled 
        ? 'WhatsApp service is ready for testing' 
        : 'WhatsApp service is not configured',
      testEndpoints: {
        sendMessage: 'POST /api/whatsapp/test',
        status: 'GET /api/whatsapp/status',
        webhook: 'POST /api/whatsapp/webhook'
      }
    });

  } catch (error) {
    console.error('Error checking test status:', error);
    return NextResponse.json({
      serviceEnabled: false,
      error: 'Error checking test status'
    }, { status: 500 });
  }
} 