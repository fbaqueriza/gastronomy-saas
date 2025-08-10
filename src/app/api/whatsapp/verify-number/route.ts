import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API /api/whatsapp/verify-number - Verificando número...');
    
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
    
    console.log('🔍 Verificando número:', normalizedNumber);
    
    // Verificar si el número está registrado en WhatsApp Business
    const response = await fetch(`https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('❌ Error verificando número:', response.status, response.statusText);
      return NextResponse.json({ 
        success: false, 
        error: 'Error verificando número: ' + response.statusText 
      }, { status: 500 });
    }
    
    const data = await response.json();
    
    console.log('✅ Verificación completada:', data);
    
    return NextResponse.json({
      success: true,
      message: 'Verificación completada',
      phoneNumber: normalizedNumber,
      verificationData: data
    });
    
  } catch (error) {
    console.error('❌ API verify-number - Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor: ' + (error as Error).message 
    }, { status: 500 });
  }
}
