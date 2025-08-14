import { NextRequest, NextResponse } from 'next/server';
import { getClientsInfo, getClientCount } from '../../../../lib/sseUtils';

export async function GET(request: NextRequest) {
  try {
    const clientCount = getClientCount();
    const clientsInfo = getClientsInfo();
    
    console.log('📊 SSE Status - Clientes conectados:', clientCount);
    
    return NextResponse.json({
      success: true,
      clientCount,
      clientsInfo,
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
