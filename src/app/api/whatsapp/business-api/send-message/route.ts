import { NextRequest, NextResponse } from 'next/server';

const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '670680919470999';
const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message, type = 'text' } = body;

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Se requieren "to" y "message"' },
        { status: 400 }
      );
    }

    console.log('📤 Enviando mensaje a WhatsApp Business API:', { to, message, type });

    // Formatear número de teléfono
    const formattedTo = to.startsWith('+') ? to : `+${to}`;

    // Payload para WhatsApp Business API
    const whatsappPayload = {
      messaging_product: 'whatsapp',
      to: formattedTo,
      type: type,
      text: {
        body: message
      }
    };

    console.log('📤 Payload para WhatsApp:', whatsappPayload);

    // Enviar mensaje a WhatsApp Business API
    const response = await fetch(`https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHATSAPP_API_KEY}`
      },
      body: JSON.stringify(whatsappPayload)
    });

    console.log('📤 Status de respuesta de WhatsApp:', response.status);

    let responseData;
    try {
      responseData = await response.json();
    } catch (error) {
      console.log('❌ No se pudo parsear la respuesta como JSON');
      const textResponse = await response.text();
      console.log('📤 Respuesta como texto:', textResponse);
      responseData = { error: 'Respuesta no válida', text: textResponse };
    }

    if (!response.ok) {
      console.error('❌ Error enviando mensaje a WhatsApp:', responseData);
      return NextResponse.json(
        { 
          error: 'Error enviando mensaje a WhatsApp Business API',
          status: response.status,
          details: responseData
        },
        { status: response.status }
      );
    }

    console.log('✅ Mensaje enviado exitosamente a WhatsApp:', responseData);

    return NextResponse.json({
      success: true,
      message: 'Mensaje enviado exitosamente',
      whatsapp_response: responseData,
      sent_to: formattedTo,
      message_id: responseData.messages?.[0]?.id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error en API de WhatsApp Business:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'API de WhatsApp Business para envío de mensajes',
    endpoint: '/api/whatsapp/business-api/send-message',
    method: 'POST',
    required_fields: ['to', 'message'],
    optional_fields: ['type'],
    example: {
      to: '5491135562673',
      message: 'Hola desde la API',
      type: 'text'
    },
    whatsapp_config: {
      phone_number_id: WHATSAPP_PHONE_NUMBER_ID,
      business_account_id: WHATSAPP_BUSINESS_ACCOUNT_ID,
      api_version: 'v18.0'
    }
  });
}
