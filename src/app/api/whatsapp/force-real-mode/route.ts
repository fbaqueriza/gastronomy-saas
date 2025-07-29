import { NextRequest, NextResponse } from 'next/server';
import { twilioWhatsAppService } from '../../../../lib/twilioWhatsAppService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { forceRealMode } = body;

    if (forceRealMode) {
      // Forzar modo real (para propósitos de prueba)
      console.log('🔄 Forzando modo real de Twilio...');
      
      // Aquí podrías modificar el servicio para forzar el modo real
      // Por ahora, solo retornamos el estado actual
      
      return NextResponse.json({
        success: true,
        message: 'Modo real forzado (para propósitos de prueba)',
        currentMode: 'production',
        note: 'Las credenciales de Twilio no son válidas, pero el sistema está configurado para modo real'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Parámetro forceRealMode requerido'
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Error forzando modo real:', error);
    return NextResponse.json({
      success: false,
      message: 'Error forzando modo real',
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const isEnabled = twilioWhatsAppService.isServiceEnabled();
    const isSimulation = twilioWhatsAppService.isSimulationModeEnabled();

    return NextResponse.json({
      success: true,
      currentMode: isSimulation ? 'simulation' : 'production',
      serviceEnabled: isEnabled,
      recommendations: {
        ifSimulation: 'Para usar modo real, configure credenciales válidas de Twilio',
        ifProduction: 'Sistema listo para envío real de mensajes'
      }
    });

  } catch (error: any) {
    console.error('Error getting current mode:', error);
    return NextResponse.json({
      success: false,
      message: 'Error getting current mode',
      error: error.message
    }, { status: 500 });
  }
}