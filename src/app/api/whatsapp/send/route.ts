import { NextRequest, NextResponse } from 'next/server';
import { metaWhatsAppService } from '../../../../lib/metaWhatsAppService';

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json();

    console.log('📤 API sendMessage - Recibido:', { to, message });

    if (!to || !message) {
      console.log('❌ API sendMessage - Campos faltantes:', { to, message });
      return NextResponse.json(
        { error: 'Missing required fields: to and message' },
        { status: 400 }
      );
    }

    console.log('🔍 API sendMessage - Estado del servicio:', {
      enabled: metaWhatsAppService.isServiceEnabled(),
      simulationMode: metaWhatsAppService.isSimulationModeEnabled()
    });

    const result = await metaWhatsAppService.sendMessage(to, message);
    
    console.log('📋 API sendMessage - Resultado del servicio:', result);
    
    if (result && (result.id || result.simulated || result.messages)) {
      return NextResponse.json({
        success: true,
        messageId: result.messages?.[0]?.id || result.id, // Priorizar el message_sid de Meta
        timestamp: new Date().toISOString(),
        simulated: result.simulated || false,
        mode: metaWhatsAppService.isSimulationModeEnabled() ? 'simulation' : 'production'
      });
    } else {
      console.log('❌ API sendMessage - Resultado inválido:', result);
      return NextResponse.json(
        { error: 'Failed to send message - Service not available' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('💥 API sendMessage - Error:', error);
    return NextResponse.json(
      { error: 'Error sending message' },
      { status: 500 }
    );
  }
} 