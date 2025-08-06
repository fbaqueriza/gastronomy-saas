import { NextResponse } from 'next/server';
import { metaWhatsAppService } from '../../../../lib/metaWhatsAppService';

export async function GET() {
  try {
    const statistics = await metaWhatsAppService.getStatistics();
    
    return NextResponse.json(statistics || {
      totalMessages: 0,
      automatedResponses: 0,
      humanInterventions: 0,
      simulatedMessages: 0,
      averageResponseTime: 0,
      mode: 'simulation'
    });
  } catch (error) {
    console.error('Error getting WhatsApp statistics:', error);
    return NextResponse.json(
      { 
        totalMessages: 0,
        automatedResponses: 0,
        humanInterventions: 0,
        simulatedMessages: 0,
        averageResponseTime: 0,
        mode: 'simulation',
        error: 'Error getting statistics'
      },
      { status: 500 }
    );
  }
} 