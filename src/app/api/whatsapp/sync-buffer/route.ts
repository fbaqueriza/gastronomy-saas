import { NextRequest, NextResponse } from 'next/server';
import { getClientCount } from '../../../../lib/sseUtils';

export async function POST(request: NextRequest) {
  try {
    const clientCount = getClientCount();
    
    console.log(`🔄 Sync Buffer - Clientes actuales: ${clientCount}`);
    
    if (clientCount === 0) {
      console.log('🔄 Sync Buffer - No hay clientes conectados, sincronización pendiente');
      
      return NextResponse.json({
        success: true,
        message: 'Sincronización pendiente - No hay clientes conectados',
        clientCount,
        timestamp: new Date().toISOString()
      });
    }
    
    // Si hay clientes conectados, la sincronización se hace automáticamente
    // a través del buffer en sseUtils.ts
    return NextResponse.json({
      success: true,
      message: 'Clientes conectados - Sincronización automática activa',
      clientCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error en sync-buffer:', error);
    return NextResponse.json({
      success: false,
      error: 'Error sincronizando buffer'
    }, { status: 500 });
  }
}
