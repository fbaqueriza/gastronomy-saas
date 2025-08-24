import { NextRequest, NextResponse } from 'next/server';
import { MessagingService } from '@/lib/supabase/messaging';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Webhook Kapso AI - Recibiendo mensaje');
    
    const body = await request.text();
    const signature = request.headers.get('x-kapso-signature');
    
    console.log('📋 Body recibido:', body);
    console.log('🔐 Signature:', signature);
    console.log('📋 Headers completos:', Object.fromEntries(request.headers.entries()));
    
    // Validar la firma del webhook (opcional)
    const webhookSecret = process.env.KAPSO_WEBHOOK_SECRET;
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');
      
      if (signature !== expectedSignature) {
        console.log('❌ Firma del webhook inválida');
        return NextResponse.json({ error: 'Firma inválida' }, { status: 401 });
      }
    }
    
    // Parsear el mensaje
    const data = JSON.parse(body);
    console.log('📋 Datos parseados:', data);
    

    
    // Procesar formato anterior (para compatibilidad)
    const {
      from,
      to,
      message,
      content, // Alternativo a 'message'
      agent_id,
      execution_id,
      session_id,
      message_id,
      type = 'message_sent', // Default
      event_type, // Alternativo a 'type'
      timestamp = new Date().toISOString()
    } = data;
    
    // Usar 'content' si 'message' no existe
    const messageContent = message || content;
    
    if (!from || !messageContent) {
      console.log('❌ Datos incompletos en el webhook');
      console.log('📋 Datos disponibles:', { from, to, message, content, type, event_type });
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }
    
    // Determinar la fuente del mensaje (más flexible)
    const messageType = type || event_type || 'message_sent';
    const source = messageType === 'message_sent' ? 'kapso_agent' : 'whatsapp';
    
    // Crear payload para el servicio de mensajería
    const payload = {
      from,
      to: to || process.env.WHATSAPP_PHONE_NUMBER_ID || '670680919470999',
      message: messageContent,
      agent_id,
      execution_id,
      session_id,
      message_id,
      type: messageType,
      timestamp
    };
    
    console.log('💾 Guardando mensaje en Supabase:', payload);
    
    // Guardar mensaje en Supabase
    const savedMessage = await MessagingService.saveMessage(payload, source);
    
    if (!savedMessage) {
      console.log('❌ Error guardando mensaje');
      return NextResponse.json(
        { error: 'Error guardando mensaje' },
        { status: 500 }
      );
    }
    
    console.log('✅ Mensaje guardado exitosamente:', savedMessage.id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Mensaje recibido y guardado',
      message_id: savedMessage.id,
      source: source,
      type: messageType
    });
    
  } catch (error) {
    console.error('❌ Error procesando webhook de Kapso AI:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Webhook de Kapso AI funcionando',
    timestamp: new Date().toISOString(),
    webhook_url: 'https://ab3390cd06e0.ngrok-free.app/api/webhook/kapso',
    instructions: [
      'Este webhook acepta cualquier tipo de mensaje de Kapso AI',
      'No necesita configuración específica de eventos',
      'Solo asegúrate de que Kapso AI envíe mensajes a esta URL'
    ]
  });
}
