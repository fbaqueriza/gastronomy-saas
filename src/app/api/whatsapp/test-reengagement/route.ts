import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 API /api/whatsapp/test-reengagement - Probando re-engagement...');
    
    const body = await request.json();
    const { phoneNumber } = body;
    
    if (!phoneNumber) {
      return NextResponse.json({ 
        success: false, 
        error: 'Número de teléfono requerido' 
      }, { status: 400 });
    }
    
    // Normalizar el número de teléfono
    const normalizedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    
    console.log('🔄 Enviando mensaje de re-engagement a:', normalizedNumber);
    
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
        type: 'template',
        template: {
          name: 'hello_world',
          language: {
            code: 'en_US'
          }
        }
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Mensaje de re-engagement enviado exitosamente:', result);
      return NextResponse.json({
        success: true,
        message: 'Mensaje de re-engagement enviado',
        result
      });
    } else {
      console.error('❌ Error enviando mensaje de re-engagement:', result);
      return NextResponse.json({
        success: false,
        error: 'Error enviando mensaje de re-engagement',
        details: result
      }, { status: response.status });
    }
    
  } catch (error) {
    console.error('❌ Error en test-reengagement:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
