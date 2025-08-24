import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Nueva URL del webhook para Kapso AI',
    webhook_url: 'https://ab3390cd06e0.ngrok-free.app/api/webhook/kapso',
    instructions: [
      '1. Ve a Kapso AI Dashboard',
      '2. Configura el agente',
      '3. Actualiza la URL del webhook a: https://ab3390cd06e0.ngrok-free.app/api/webhook/kapso',
      '4. Asegúrate de que incluya el evento "message_sent"',
      '5. Guarda la configuración'
    ],
    events_required: [
      'message_received',
      'message_sent',
      'status_update'
    ]
  });
}
