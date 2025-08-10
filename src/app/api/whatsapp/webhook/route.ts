import { NextRequest, NextResponse } from 'next/server';
import { metaWhatsAppService } from '../../../../lib/metaWhatsAppService';
import { sendMessageToClients } from '../../../../lib/sseUtils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    // Debug de variables de entorno
    console.log('🔍 ENV DEBUG:', {
      WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN,
      NODE_ENV: process.env.NODE_ENV,
      allEnvKeys: Object.keys(process.env).filter(key => key.includes('WHATSAPP'))
    });

    console.log('🔍 Webhook verification debug:', {
      mode,
      token,
      expectedToken: process.env.WHATSAPP_VERIFY_TOKEN,
      challenge
    });

    // Verificación del webhook para WhatsApp
    const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'mi_token_de_verificacion_2024_cilantro';
    if (mode === 'subscribe' && token === expectedToken) {
      console.log('✅ Webhook verified successfully');
      return new NextResponse(challenge, { status: 200 });
    }

    console.log('❌ Webhook verification failed:', { modeMatch: mode === 'subscribe', tokenMatch: token === expectedToken });
    return new NextResponse('Forbidden', { status: 403 });
  } catch (error) {
    console.error('Error in webhook verification:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Webhook POST - Recibiendo mensaje entrante...');
    
    // Verificar si el servicio de WhatsApp está habilitado
    if (!metaWhatsAppService.isServiceEnabled()) {
      console.log('WhatsApp webhook: Servicio deshabilitado, ignorando webhook');
      return new NextResponse('Service Disabled', { status: 200 });
    }

    const body = await request.json();
    console.log('📋 Webhook POST - Body recibido:', JSON.stringify(body, null, 2));
    
    // Verificar que es un webhook de WhatsApp Business API
    if (body.object === 'whatsapp_business_account') {
      console.log('✅ Webhook POST - Es un webhook de WhatsApp Business API');
      
      const entry = body.entry?.[0];
      console.log('📋 Webhook POST - Entry:', entry);
      
      if (entry?.changes?.[0]?.value?.messages) {
        const messages = entry.changes[0].value.messages;
        console.log('📨 Webhook POST - Mensajes encontrados:', messages.length);
        
        // Procesar cada mensaje
        for (const message of messages) {
          console.log('🔄 Webhook POST - Procesando mensaje:', message);
          await metaWhatsAppService.processIncomingMessage(message);
          
          // Normalizar el número de teléfono para que coincida con el formato del frontend
          let normalizedFrom = message.from;
          if (normalizedFrom && !normalizedFrom.startsWith('+')) {
            normalizedFrom = `+${normalizedFrom}`;
          }

          // Enviar mensaje a través de SSE para actualización en tiempo real
          const sseMessage = {
            type: 'whatsapp_message',
            contactId: normalizedFrom,
            id: message.id,
            content: message.text?.body || message.content,
            timestamp: new Date().toISOString()
          };
          
          console.log('📤 Webhook POST - Enviando mensaje SSE:', sseMessage);
          
          // Enviar a todos los clientes conectados
          sendMessageToClients(sseMessage);
          console.log('✅ Webhook POST - Mensaje SSE enviado exitosamente');
        }
        
        console.log('✅ Webhook POST - Mensajes procesados correctamente');
        return new NextResponse('OK', { status: 200 });
      } else {
        console.log('⚠️ Webhook POST - No se encontraron mensajes en el webhook');
      }
    } else {
      console.log('❌ Webhook POST - No es un webhook de WhatsApp Business API');
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('💥 Error processing webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 