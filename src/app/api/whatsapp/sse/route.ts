import { NextRequest, NextResponse } from 'next/server';
import { addClient, removeClient } from '../../../../lib/sseUtils';

// Forzar que este endpoint sea dinámico
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('🔌 Cliente SSE intentando conectar...');

  const stream = new ReadableStream({
    start(controller) {
      // Agregar cliente a la lista
      addClient(controller);

      // Enviar mensaje de prueba inicial
      const testMessage = {
        type: 'test',
        message: 'SSE conectado correctamente',
        timestamp: new Date().toISOString()
      };
      
      controller.enqueue(
        new TextEncoder().encode(`data: ${JSON.stringify(testMessage)}\n\n`)
      );

      // Mantener conexión viva
      const keepAlive = setInterval(() => {
        try {
          const pingMessage = {
            type: 'ping',
            timestamp: new Date().toISOString()
          };
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify(pingMessage)}\n\n`)
          );
        } catch (error) {
          console.log('Cliente SSE desconectado');
          clearInterval(keepAlive);
          removeClient(controller);
        }
      }, 30000); // Ping cada 30 segundos

      // Limpiar cuando el cliente se desconecte
      request.signal.addEventListener('abort', () => {
        console.log('🔌 Cliente SSE desconectado');
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