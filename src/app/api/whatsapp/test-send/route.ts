import { NextRequest, NextResponse } from 'next/server';
import { metaWhatsAppService } from '../../../../lib/metaWhatsAppService';

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json();

    console.log('🧪 TEST - Enviando mensaje de prueba:', { to, message });

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to and message' },
        { status: 400 }
      );
    }

    // Verificar configuración del servicio
    console.log('🔍 TEST - Estado del servicio:', {
      enabled: metaWhatsAppService.isServiceEnabled(),
      simulationMode: metaWhatsAppService.isSimulationModeEnabled()
    });

    const result = await metaWhatsAppService.sendMessage(to, message);
    
    console.log('📋 TEST - Resultado:', result);
    
    if (result) {
      return NextResponse.json({
        success: true,
        messageId: result.id || result.messages?.[0]?.id,
        timestamp: new Date().toISOString(),
        simulated: result.simulated || false,
        mode: metaWhatsAppService.isSimulationModeEnabled() ? 'simulation' : 'production'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send test message' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('💥 TEST - Error:', error);
    return NextResponse.json(
      { error: 'Error sending test message' },
      { status: 500 }
    );
  }
}
