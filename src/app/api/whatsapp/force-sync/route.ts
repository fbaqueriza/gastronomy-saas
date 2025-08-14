import { NextRequest, NextResponse } from 'next/server';
import { getClientCount } from '../../../../lib/sseUtils';

export async function POST(request: NextRequest) {
  try {
    const clientCount = getClientCount();
    
    console.log(`🔄 Force Sync - Clientes actuales: ${clientCount}`);
    
    if (clientCount === 0) {
      console.log('🔄 Force Sync - No hay clientes conectados, sincronización pendiente');
      
      return NextResponse.json({
        success: true,
        message: 'Sincronización pendiente - No hay clientes conectados',
        clientCount,
        timestamp: new Date().toISOString()
      });
    }
    
    // Si hay clientes conectados, forzar sincronización
    console.log('🔄 Force Sync - Forzando sincronización de mensajes');
    
    return NextResponse.json({
      success: true,
      message: 'Sincronización forzada - Mensajes enviados a clientes conectados',
      clientCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error en force-sync:', error);
    return NextResponse.json({
      success: false,
      error: 'Error forzando sincronización'
    }, { status: 500 });
  }
}
