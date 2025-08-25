import { NextRequest, NextResponse } from 'next/server';
import { addClient, removeClient, cleanupInactiveClients } from '../../../../lib/sseUtils';

export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      // Agregar el cliente a la lista y obtener su ID
      const clientId = addClient(controller);

      // Cliente conectado

      // Enviar un mensaje de prueba para confirmar la conexión
      controller.enqueue(`data: ${JSON.stringify({ 
        type: 'connection', 
        message: 'SSE conectado',
        clientId,
        timestamp: new Date().toISOString()
      })}\n\n`);

      // Limpiar clientes inactivos cada 5 minutos (sin pings)
      const cleanupInterval = setInterval(() => {
        cleanupInactiveClients();
      }, 300000); // 5 minutos

      // Limpiar cuando se cierre la conexión
      request.signal.addEventListener('abort', () => {
        clearInterval(cleanupInterval);
        removeClient(clientId);
      });
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
}

 