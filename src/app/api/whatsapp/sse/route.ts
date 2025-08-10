import { NextRequest, NextResponse } from 'next/server';
import { addClient, removeClient } from '../../../../lib/sseUtils';

export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      // Agregar el cliente a la lista
      addClient(controller);

      // Enviar un mensaje de prueba para confirmar la conexión
      controller.enqueue(`data: ${JSON.stringify({ type: 'connection', message: 'SSE conectado' })}\n\n`);

      // Mantener la conexión viva
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(`data: ${JSON.stringify({ type: 'ping', timestamp: Date.now() })}\n\n`);
        } catch (error) {
          clearInterval(keepAlive);
          removeClient(controller);
        }
      }, 30000); // Ping cada 30 segundos

      // Limpiar cuando se cierre la conexión
      request.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        removeClient(controller);
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

 