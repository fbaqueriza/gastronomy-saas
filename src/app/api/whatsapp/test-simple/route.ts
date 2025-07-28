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

    // Simular envío de mensaje (sin usar Twilio real)
    console.log('Simulating message send:', {
      to,
      message,
      timestamp: new Date().toISOString()
    });

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      messageId: `sim_${Date.now()}`,
      timestamp: new Date().toISOString(),
      simulated: true,
      details: {
        to,
        message,
        status: 'sent'
      }
    });

  } catch (error: any) {
    console.error('Error in test-simple:', error);
    return NextResponse.json(
      { 
        error: 'Error in test endpoint',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
} 