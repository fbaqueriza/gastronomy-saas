import { NextRequest, NextResponse } from 'next/server';
import { getClientCount } from '../../../../lib/sseUtils';

// Forzar que este endpoint sea dinámico
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Verificando estado SSE...');
    
    // Obtener el número real de clientes SSE conectados
    const realClientCount = getClientCount();
    
    const status = {
      timestamp: new Date().toISOString(),
      totalActiveClients: realClientCount,
      realClientCount: realClientCount,
      message: 'SSE status endpoint funcionando'
    };
    
    console.log('📊 Estado SSE:', status);
    
    return NextResponse.json({
      success: true,
      status
    });
    
  } catch (error) {
    console.error('Error verificando estado SSE:', error);
    return NextResponse.json({ 
      error: 'Error verificando estado SSE',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
} 