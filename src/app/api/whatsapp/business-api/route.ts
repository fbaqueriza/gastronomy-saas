import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json();

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to and message' },
        { status: 400 }
      );
    }

    // Verificar configuración de WhatsApp Business API
    const apiKey = process.env.WHATSAPP_API_KEY;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

    if (!apiKey || !phoneNumberId || !businessAccountId) {
      return NextResponse.json(
        { 
          error: 'WhatsApp Business API configuration missing',
          details: 'Necesitas configurar WHATSAPP_API_KEY, WHATSAPP_PHONE_NUMBER_ID y WHATSAPP_BUSINESS_ACCOUNT_ID'
        },
        { status: 500 }
      );
    }

    // Formatear número de teléfono
    const formattedTo = to.startsWith('+') ? to : `+${to}`;
    
    console.log('Attempting to send WhatsApp Business message:', {
      to: formattedTo,
      message,
      phoneNumberId,
      businessAccountId
    });

    // Enviar mensaje usando WhatsApp Business API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedTo,
          type: 'text',
          text: {
            body: message
          }
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error('WhatsApp Business API error:', result);
      return NextResponse.json(
        { 
          error: 'Error sending WhatsApp message',
          details: result.error?.message || 'Unknown error',
          code: result.error?.code
        },
        { status: response.status }
      );
    }

    console.log('WhatsApp message sent successfully:', result);

    return NextResponse.json({
      success: true,
      messageId: result.messages?.[0]?.id,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error sending WhatsApp Business message:', error);
    return NextResponse.json(
      { 
        error: 'Error sending message',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
} 