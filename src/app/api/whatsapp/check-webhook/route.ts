import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Verificando configuración de webhook');
    
    // Información sobre la configuración actual
    const webhookInfo = {
      webhookUrl: 'https://your-domain.com/api/whatsapp/twilio/webhook',
      localUrl: 'http://localhost:3003/api/whatsapp/twilio/webhook',
      status: 'active',
      description: 'Webhook para recibir mensajes entrantes de WhatsApp'
    };
    
    return NextResponse.json({
      success: true,
      message: 'Configuración de webhook',
      webhook: webhookInfo,
      instructions: [
        '1. Ve a la consola de Twilio',
        '2. Navega a Messaging > Settings > WhatsApp Sandbox',
        '3. En "Webhook URL", coloca: https://your-domain.com/api/whatsapp/twilio/webhook',
        '4. En "HTTP Method", selecciona POST',
        '5. Guarda los cambios',
        '6. Para desarrollo local, usa ngrok para exponer el puerto 3003'
      ]
    });
    
  } catch (error) {
    console.error('Error verificando webhook:', error);
    return NextResponse.json({ error: 'Error verificando webhook' }, { status: 500 });
  }
} 