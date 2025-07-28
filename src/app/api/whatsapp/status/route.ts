import { NextResponse } from 'next/server';
import { twilioWhatsAppService } from '../../../../lib/twilioWhatsAppService';

export async function GET() {
  try {
    const isEnabled = twilioWhatsAppService.isServiceEnabled();
    
    return NextResponse.json({
      enabled: isEnabled,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking WhatsApp status:', error);
    return NextResponse.json(
      { enabled: false, error: 'Error checking status' },
      { status: 500 }
    );
  }
} 