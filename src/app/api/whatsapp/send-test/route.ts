import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 API /api/whatsapp/send-test - Enviando mensaje de prueba...');
    
    const body = await request.json();
    const { to, message } = body;
    
    if (!to || !message) {
      return NextResponse.json({ 
        success: false, 
        error: 'Número de teléfono y mensaje requeridos' 
      }, { status: 400 });
    }
    
    // Normalizar el número de teléfono
    const normalizedNumber = to.startsWith('+') ? to : `+${to}`;
    
    console.log('🧪 Enviando mensaje de prueba:', {
      to: normalizedNumber,
      message: message
    });
    
    // Enviar mensaje usando la API de WhatsApp Business
    const response = await fetch(`https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: normalizedNumber,
        type: 'text',
        text: {
          body: message
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Error enviando mensaje:', response.status, errorData);
      return NextResponse.json({ 
        success: false, 
        error: 'Error enviando mensaje: ' + response.statusText,
        details: errorData
      }, { status: 500 });
    }
    
    const data = await response.json();
    
    console.log('✅ Mensaje enviado exitosamente:', data);
    
    return NextResponse.json({
      success: true,
      message: 'Mensaje enviado exitosamente',
      data: data
    });
    
  } catch (error) {
    console.error('❌ API send-test - Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor: ' + (error as Error).message 
    }, { status: 500 });
  }
}
