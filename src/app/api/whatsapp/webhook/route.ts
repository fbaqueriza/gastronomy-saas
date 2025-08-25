import { NextRequest, NextResponse } from 'next/server';
import { metaWhatsAppService } from '../../../../lib/metaWhatsAppService';
import { sendMessageToClients } from '../../../../lib/sseUtils';
import { OrderNotificationService } from '../../../../lib/orderNotificationService';

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
    // Verificar si el servicio de WhatsApp está habilitado
    if (!metaWhatsAppService.isServiceEnabled()) {
      return new NextResponse('Service Disabled', { status: 200 });
    }

    const body = await request.json();
    
    // Verificar que es un webhook de WhatsApp Business API
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      
      if (entry?.changes?.[0]?.value?.messages) {
        const messages = entry.changes[0].value.messages;
        
        // Procesar cada mensaje - TIEMPO REAL
        for (const message of messages) {
          // Normalizar el número de teléfono para que coincida con el formato del frontend
          let normalizedFrom = message.from;
          if (normalizedFrom && !normalizedFrom.startsWith('+')) {
            normalizedFrom = `+${normalizedFrom}`;
          }

          // Extraer el contenido del mensaje
          let messageContent = '';
          if (message.text && message.text.body) {
            messageContent = message.text.body;
          } else if (message.content) {
            messageContent = message.content;
          } else if (message.type === 'image' && message.image) {
            messageContent = '[Imagen]';
          } else if (message.type === 'document' && message.document) {
            messageContent = `[Documento: ${message.document.filename}]`;
          } else {
            messageContent = '[Mensaje no soportado]';
          }

          // Procesar mensaje en base de datos (incluye SSE)
          await metaWhatsAppService.processIncomingMessage(message);

          // Verificar si es una respuesta de proveedor y enviar detalles del pedido (solo después del disparador inicial)
          if (messageContent && messageContent.trim().length > 0) {
            console.log('🔍 Verificando si es respuesta de proveedor:', normalizedFrom);
            
            try {
              // Verificar si hay un pedido pendiente para este proveedor
              const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
              const checkResponse = await fetch(`${baseUrl}/api/whatsapp/get-pending-order`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ providerPhone: normalizedFrom }),
              });

              // Solo enviar la orden si hay un pedido pendiente Y es la primera respuesta después del disparador
              if (checkResponse.ok) {
                const checkResult = await checkResponse.json();
                if (checkResult.success) {
                  // Verificar si este es el primer mensaje después del disparador
                  // Solo enviar la orden si el pedido fue creado recientemente (últimos 5 minutos)
                  const orderCreatedAt = new Date(checkResult.createdAt);
                  const now = new Date();
                  const timeDiff = now.getTime() - orderCreatedAt.getTime();
                  const fiveMinutes = 5 * 60 * 1000; // 5 minutos en milisegundos
                  
                  if (timeDiff <= fiveMinutes) {
                    const success = await OrderNotificationService.sendOrderDetailsAfterConfirmation(normalizedFrom);
                    if (success) {
                      console.log('✅ Detalles del pedido enviados automáticamente después de respuesta del proveedor');
                    }
                  } else {
                    console.log('ℹ️ Pedido pendiente pero no es la primera respuesta, no se envía orden automática');
                  }
                } else {
                  console.log('ℹ️ No hay pedido pendiente para este proveedor, no se envía orden automática');
                }
              } else {
                console.log('ℹ️ No hay pedido pendiente para este proveedor, no se envía orden automática');
              }
            } catch (error) {
              console.error('❌ Error procesando respuesta de proveedor:', error);
            }
          }
        }
        
        return new NextResponse('OK', { status: 200 });
      }
    } else {
      // console.log('❌ Webhook POST - No es un webhook de WhatsApp Business API');
      // console.log('📋 Webhook POST - Object recibido:', body.object);
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('💥 Error processing webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 