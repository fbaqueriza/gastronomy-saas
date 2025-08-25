import { NextRequest, NextResponse } from 'next/server';
import { KapsoService } from '@/lib/kapsoService';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-kapso-signature');
    const webhookSecret = process.env.KAPSO_WEBHOOK_SECRET;

    console.log('📥 Webhook Outbound Kapso AI - Recibiendo datos');
    console.log('📋 Body:', body);
    console.log('🔐 Signature:', signature);

    // Validar la firma del webhook
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('❌ Webhook Outbound - Firma inválida');
        return NextResponse.json({ error: 'Firma inválida' }, { status: 401 });
      }
    }

    const data = JSON.parse(body);
    console.log('📋 Webhook Outbound - Datos parseados:', data);

    // Procesar el mensaje de Kapso AI
    const kapsoService = new KapsoService({
      apiKey: process.env.KAPSO_API_KEY!,
      baseUrl: process.env.KAPSO_BASE_URL!
    });

    // Extraer información del mensaje
    const message = {
      type: 'kapso_message',
      contactId: data.from || data.phone_number,
      content: data.text || data.message || data.content,
      timestamp: new Date().toISOString(),
      status: 'received',
      source: 'kapso_ai',
      metadata: {
        agentId: data.agent_id,
        executionId: data.execution_id,
        sessionId: data.session_id
      }
    };

    console.log('📤 Webhook Outbound - Procesando mensaje:', message);

    // Enviar el mensaje a través de SSE para actualización en tiempo real
    const { sendMessageToClients } = await import('@/lib/sseUtils');
    sendMessageToClients(message);

    // Guardar en la base de datos (opcional)
    // await kapsoService.saveMessage(message);

    console.log('✅ Webhook Outbound - Mensaje procesado correctamente');

    return NextResponse.json({ 
      success: true, 
      message: 'Mensaje recibido correctamente' 
    });

  } catch (error) {
    console.error('❌ Webhook Outbound - Error:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      success: false 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Webhook Outbound Kapso AI - Endpoint activo',
    status: 'ready'
  });
}
