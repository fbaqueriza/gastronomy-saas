import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const contactId = request.nextUrl.searchParams.get('contactId');
    
    if (!contactId) {
      return NextResponse.json({ error: 'contactId es requerido' }, { status: 400 });
    }
    
    console.log('🧪 TEST SSE - Probando conexión SSE para contacto:', contactId);
    
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        console.log('✅ Conexión SSE de prueba establecida para:', contactId);
        
        // Enviar mensaje de prueba inmediatamente
        const testMessage = {
          id: 'TEST_' + Date.now(),
          contactId: contactId,
          content: 'Mensaje de prueba SSE',
          type: 'received',
          status: 'received',
          timestamp: new Date().toISOString()
        };
        
        const data = `data: ${JSON.stringify(testMessage)}\n\n`;
        controller.enqueue(encoder.encode(data));
        
        console.log('📤 Mensaje de prueba enviado:', testMessage);
        
        // Enviar otro mensaje después de 5 segundos
        setTimeout(() => {
          const delayedMessage = {
            id: 'TEST_DELAYED_' + Date.now(),
            contactId: contactId,
            content: 'Mensaje de prueba SSE (5 segundos después)',
            type: 'received',
            status: 'received',
            timestamp: new Date().toISOString()
          };
          
          const delayedData = `data: ${JSON.stringify(delayedMessage)}\n\n`;
          controller.enqueue(encoder.encode(delayedData));
          
          console.log('📤 Mensaje de prueba retrasado enviado:', delayedMessage);
        }, 5000);
        
        // Mantener conexión abierta por 10 segundos
        setTimeout(() => {
          console.log('🔌 Cerrando conexión SSE de prueba para:', contactId);
          controller.close();
        }, 10000);
      }
    });
    
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    });
    
  } catch (error) {
    console.error('Error en test SSE:', error);
    return NextResponse.json({ error: 'Error en test SSE' }, { status: 500 });
  }
} 