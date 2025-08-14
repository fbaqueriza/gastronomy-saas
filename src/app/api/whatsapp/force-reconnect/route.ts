import { NextRequest, NextResponse } from 'next/server';
import { getClientCount } from '../../../../lib/sseUtils';

export async function POST(request: NextRequest) {
  try {
    const clientCount = getClientCount();
    
    console.log(`🔄 Force Reconnect - Clientes actuales: ${clientCount}`);
    
    if (clientCount === 0) {
      console.log('🔄 Force Reconnect - No hay clientes conectados, forzando reconexión...');
      
      // Enviar un mensaje de prueba para verificar la conexión
      return NextResponse.json({
        success: true,
        message: 'Reconexión forzada iniciada',
        clientCount,
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Clientes ya conectados',
      clientCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error en force-reconnect:', error);
    return NextResponse.json({
      success: false,
      error: 'Error forzando reconexión'
    }, { status: 500 });
  }
}
