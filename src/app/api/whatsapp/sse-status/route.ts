import { NextRequest, NextResponse } from 'next/server';

// Importar la función que necesitamos para verificar clientes conectados
// Nota: Esto es una solución temporal para debugging
let clientCount = 0;

export async function GET(request: NextRequest) {
  try {
    // En un entorno real, deberíamos acceder al Set de clientes desde el módulo SSE
    // Por ahora, devolvemos información básica para debugging
    
    return NextResponse.json({
      success: true,
      message: 'SSE Status endpoint',
      timestamp: new Date().toISOString(),
      note: 'Para ver el número real de clientes conectados, revisa los logs del servidor cuando se envía un mensaje SSE'
    });
  } catch (error) {
    console.error('Error en SSE status:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error' 
    }, { status: 500 });
  }
}