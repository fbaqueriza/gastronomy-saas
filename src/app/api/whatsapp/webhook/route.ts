import { NextRequest, NextResponse } from 'next/server';
import { whatsappService } from '../../../../lib/whatsappService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    // Verificación del webhook para WhatsApp
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log('Webhook verified successfully');
      return new NextResponse(challenge, { status: 200 });
    }

    return new NextResponse('Forbidden', { status: 403 });
  } catch (error) {
    console.error('Error in webhook verification:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar si el servicio de WhatsApp está habilitado
    if (!whatsappService.isServiceEnabled()) {
      console.log('WhatsApp webhook: Servicio deshabilitado, ignorando webhook');
      return new NextResponse('Service Disabled', { status: 200 });
    }

    const body = await request.json();
    
    // Verificar que es un webhook de WhatsApp
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      
      if (entry?.changes?.[0]?.value?.messages) {
        const messages = entry.changes[0].value.messages;
        
        // Procesar cada mensaje
        for (const message of messages) {
          await whatsappService.receiveMessage(message);
        }
        
        return new NextResponse('OK', { status: 200 });
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 