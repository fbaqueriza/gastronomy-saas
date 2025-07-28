import { NextResponse } from 'next/server';
import { twilioWhatsAppService } from '../../../../lib/twilioWhatsAppService';

export async function GET() {
  try {
    const statistics = await twilioWhatsAppService.getStatistics();
    
    return NextResponse.json(statistics || {
      totalMessages: 0,
      automatedResponses: 0,
      humanInterventions: 0,
      averageResponseTime: 0
    });
  } catch (error) {
    console.error('Error getting WhatsApp statistics:', error);
    return NextResponse.json(
      { 
        totalMessages: 0,
        automatedResponses: 0,
        humanInterventions: 0,
        averageResponseTime: 0,
        error: 'Error getting statistics'
      },
      { status: 500 }
    );
  }
} 