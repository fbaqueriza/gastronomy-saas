import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    webhook_status: 'Activo y funcionando',
    webhook_url: 'https://ab3390cd06e0.ngrok-free.app/api/webhook/kapso',
    expected_configuration: {
      url: 'https://ab3390cd06e0.ngrok-free.app/api/webhook/kapso',
      events: [
        'message_received',
        'message_sent',
        'status_update'
      ],
      headers: {
        'Content-Type': 'application/json',
        'x-kapso-signature': 'Opcional para validación'
      }
    },
    troubleshooting: [
      'Verificar que la URL en Kapso AI sea exactamente: https://ab3390cd06e0.ngrok-free.app/api/webhook/kapso',
      'Asegurar que el evento "message_sent" esté incluido',
      'Verificar que el agente esté configurado para enviar respuestas al webhook',
      'Comprobar que el flujo del agente incluya el nodo de webhook después de enviar mensajes'
    ],
    test_message: {
      method: 'POST',
      url: 'https://ab3390cd06e0.ngrok-free.app/api/webhook/kapso',
      body: {
        from: '5491112345678',
        to: '670680919470999',
        message: 'Mensaje de prueba',
        type: 'message_sent',
        agent_id: '657bc308-c5c2-46e3-b81c-190ceab3fa6f'
      }
    }
  });
}
