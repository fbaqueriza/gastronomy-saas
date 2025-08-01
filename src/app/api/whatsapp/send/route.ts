import { NextRequest, NextResponse } from 'next/server';
import { twilioWhatsAppService } from '../../../../lib/twilioWhatsAppService';

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json();

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to and message' },
        { status: 400 }
      );
    }

    const result = await twilioWhatsAppService.sendMessage(to, message);
    
    if (result && (result.sid || result.simulated)) {
      return NextResponse.json({
        success: true,
        messageId: result.sid,
        timestamp: new Date().toISOString(),
        simulated: result.simulated || false,
        mode: twilioWhatsAppService.isSimulationModeEnabled() ? 'simulation' : 'production'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send message - Service not available' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return NextResponse.json(
      { error: 'Error sending message' },
      { status: 500 }
    );
  }
} 