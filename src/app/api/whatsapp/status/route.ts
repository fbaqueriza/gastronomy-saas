import { NextRequest, NextResponse } from 'next/server';
import { metaWhatsAppService } from '../../../../lib/metaWhatsAppService';

export async function GET() {
  try {
    const status = await metaWhatsAppService.getServiceStatus();
    
    return NextResponse.json({
      success: true,
      service: {
        enabled: status.enabled,
        mode: status.simulationMode ? 'simulation' : 'production',
        configured: status.configured,
        phoneNumberId: status.phoneNumberId,
        businessAccountId: status.businessAccountId,
        timestamp: new Date().toISOString()
      },
      message: status.simulationMode 
        ? 'WhatsApp service running in simulation mode (messages are simulated)'
        : 'WhatsApp service running in production mode with Meta Cloud API'
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