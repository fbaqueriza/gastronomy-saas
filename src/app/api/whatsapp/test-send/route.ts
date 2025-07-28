import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json();

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to and message' },
        { status: 400 }
      );
    }

    // Verificar configuración de Twilio
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !phoneNumber) {
      return NextResponse.json(
        { error: 'Twilio configuration missing' },
        { status: 500 }
      );
    }

    // Crear cliente de Twilio
    const client = twilio(accountSid, authToken);

    // Formatear número de teléfono
    const formattedTo = to.startsWith('+') ? to : `+${to}`;
    const formattedFrom = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    
    // Validar que no se esté enviando al mismo número
    if (formattedTo === formattedFrom) {
      return NextResponse.json(
        { 
          error: 'No se puede enviar un mensaje al mismo número',
          details: 'El número de destino no puede ser igual al número de origen'
        },
        { status: 400 }
      );
    }
    
    console.log('Attempting to send message:', {
      body: message,
      from: `whatsapp:${formattedFrom}`,
      to: `whatsapp:${formattedTo}`
    });
    
    // Enviar mensaje real con Twilio
    const twilioMessage = await client.messages.create({
      body: message,
      from: `whatsapp:${formattedFrom}`,
      to: `whatsapp:${formattedTo}`,
      statusCallback: 'https://httpbin.org/post', // URL temporal para evitar el error
    });
    
    console.log('Message sent successfully:', twilioMessage.sid);

    return NextResponse.json({
      success: true,
      messageId: twilioMessage.sid,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error sending test message:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      accountSid: process.env.TWILIO_ACCOUNT_SID ? 'Present' : 'Missing',
      authToken: process.env.TWILIO_AUTH_TOKEN ? 'Present' : 'Missing',
      phoneNumber: process.env.TWILIO_PHONE_NUMBER ? 'Present' : 'Missing'
    });
    
    // Verificar si es un error específico de Twilio
    if (error.code) {
      console.error('Twilio error code:', error.code);
      console.error('Twilio error message:', error.message);
      console.error('Twilio error moreInfo:', error.moreInfo);
    }
    
    return NextResponse.json(
      { 
        error: 'Error sending message',
        details: error.message || 'Unknown error',
        code: error.code,
        moreInfo: error.moreInfo
      },
      { status: 500 }
    );
  }
} 