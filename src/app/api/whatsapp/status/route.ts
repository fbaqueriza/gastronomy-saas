import { NextRequest, NextResponse } from 'next/server';
import { twilioWhatsAppService } from '../../../../lib/twilioWhatsAppService';

export async function GET() {
  try {
    const isEnabled = twilioWhatsAppService.isServiceEnabled();
    const isSimulationMode = twilioWhatsAppService.isSimulationModeEnabled();
    
    return NextResponse.json({
      success: true,
      service: {
        enabled: isEnabled,
        mode: isSimulationMode ? 'simulation' : 'production',
        timestamp: new Date().toISOString()
      },
      message: isSimulationMode 
        ? 'WhatsApp service running in simulation mode (messages are simulated)'
        : 'WhatsApp service running in production mode'
    });
  } catch (error) {
    console.error('Error checking WhatsApp service status:', error);
    return NextResponse.json({
      success: false,
      error: 'Error checking service status',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 