import { NextRequest, NextResponse } from 'next/server';
import { metaWhatsAppService } from '../../../../lib/metaWhatsAppService';
import { sendMessageToContact } from '../../../../lib/sseUtils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    console.log('🔍 Webhook verification debug:', {
      mode,
      token,
      expectedToken: process.env.WHATSAPP_VERIFY_TOKEN,
      challenge
    });

    // Verificación del webhook para WhatsApp
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log('✅ Webhook verified successfully');
      return new NextResponse(challenge, { status: 200 });
    }

    console.log('❌ Webhook verification failed:', {
      modeMatch: mode === 'subscribe',
      tokenMatch: token === process.env.WHATSAPP_VERIFY_TOKEN
    });

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
          
          // Enviar mensaje a través de SSE para actualización en tiempo real
          const sseMessage = {
            type: 'whatsapp_message',
            contactId: message.from,
            id: message.id,
            content: message.text?.body || message.content,
            timestamp: new Date().toISOString()
          };
          
          console.log('📤 Webhook POST - Enviando mensaje SSE:', sseMessage);
          
          // Verificar si hay clientes conectados antes de enviar
          const { getClientCount } = await import('../../../../lib/sseUtils');
          const clientCount = getClientCount();
          console.log('📊 Webhook POST - Clientes SSE conectados:', clientCount);
          
          if (clientCount > 0) {
            sendMessageToContact(message.from, sseMessage);
            console.log('✅ Webhook POST - Mensaje SSE enviado exitosamente');
            
            // Forzar sincronización inmediata después de enviar SSE
            setTimeout(async () => {
              try {
                console.log('🔄 Webhook POST - Forzando sincronización inmediata...');
                // La sincronización se hará automáticamente cuando el cliente reciba el SSE
              } catch (error) {
                console.error('❌ Webhook POST - Error en sincronización forzada:', error);
              }
            }, 100);
          } else {
            console.log('✅ Webhook POST - App cerrada, mensaje guardado en BD para sincronización posterior');
          }
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