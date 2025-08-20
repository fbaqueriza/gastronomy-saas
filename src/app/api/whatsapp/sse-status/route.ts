import { NextRequest, NextResponse } from 'next/server';
import { getClientCount } from '../../../../lib/sseUtils';

export async function GET(request: NextRequest) {
  try {
    const clientCount = getClientCount();
    

    
    return NextResponse.json({
      success: true,
      clientCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error obteniendo estado SSE:', error);
    return NextResponse.json({
      success: false,
      error: 'Error obteniendo estado SSE'
    }, { status: 500 });
  }
}
