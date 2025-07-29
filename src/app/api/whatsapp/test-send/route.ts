import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json();

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to and message' },
        { status: 400 }
      );
    }

    // Simular envío de mensaje (sin Twilio real)
    console.log('📤 Simulando envío de mensaje:', {
      to: to,
      message: message,
      timestamp: new Date().toISOString()
    });

    // Simular delay de envío
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generar ID simulado
    const messageId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('✅ Mensaje simulado enviado exitosamente:', messageId);

    return NextResponse.json({
      success: true,
      messageId: messageId,
      timestamp: new Date().toISOString(),
      simulated: true
    });

  } catch (error: any) {
    console.error('Error sending simulated message:', error);
    
    return NextResponse.json(
      { 
        error: 'Error sending message',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
} 