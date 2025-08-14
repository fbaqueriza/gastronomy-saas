import { NextRequest, NextResponse } from 'next/server';
import { getClientCount, sendMessageToClients } from '../../../../lib/sseUtils';

export async function GET(request: NextRequest) {
  try {
    const clientCount = getClientCount();
    
    // Enviar un mensaje de prueba
    const testMessage = {
      type: 'whatsapp_message',
      contactId: '+5491135562673',
      id: `test_${Date.now()}`,
      content: 'Mensaje de prueba SSE - ' + new Date().toISOString(),
      timestamp: new Date().toISOString(),
      status: 'delivered'
    };
    
    sendMessageToClients(testMessage);
    
    return NextResponse.json({
      success: true,
      clientCount,
      testMessage,
      message: `Mensaje de prueba enviado a ${clientCount} clientes`
    });
    
  } catch (error) {
    console.error('Error en test-sse-connection:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}
