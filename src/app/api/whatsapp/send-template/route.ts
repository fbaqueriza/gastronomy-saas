import { NextRequest, NextResponse } from 'next/server';
import { metaWhatsAppService } from '../../../../lib/metaWhatsAppService';

export async function POST(request: NextRequest) {
  try {
    const { to, templateName, language = 'es', components } = await request.json();

    if (!to || !templateName) {
      return NextResponse.json(
        { error: 'Missing required fields: to and templateName' },
        { status: 400 }
      );
    }

    const result = await metaWhatsAppService.sendTemplateMessage(to, templateName, language, components);
    
    if (result && (result.id || result.simulated)) {
      return NextResponse.json({
        success: true,
        messageId: result.id || result.messages?.[0]?.id,
        timestamp: new Date().toISOString(),
        simulated: result.simulated || false,
        templateName,
        mode: metaWhatsAppService.isSimulationModeEnabled() ? 'simulation' : 'production'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send template message - Service not available' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending WhatsApp template message:', error);
    return NextResponse.json(
      { error: 'Error sending template message' },
      { status: 500 }
    );
  }
} 