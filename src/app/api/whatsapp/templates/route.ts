import { NextRequest, NextResponse } from 'next/server';
import { metaWhatsAppService } from '../../../../lib/metaWhatsAppService';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 API templates - Obteniendo plantillas disponibles');

    const templates = await metaWhatsAppService.getTemplates();
    
    console.log('📋 API templates - Plantillas obtenidas:', templates);
    
    if (templates) {
      return NextResponse.json({
        success: true,
        templates,
        count: templates.length,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('❌ API templates - No se pudieron obtener plantillas');
      return NextResponse.json(
        { error: 'Failed to get templates - Service not available' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('💥 API templates - Error:', error);
    return NextResponse.json(
      { error: 'Error getting templates' },
      { status: 500 }
    );
  }
}
