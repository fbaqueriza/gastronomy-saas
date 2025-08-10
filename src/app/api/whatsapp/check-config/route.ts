import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API /api/whatsapp/check-config - Verificando configuración...');
    
    // Verificar variables de entorno
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const apiKey = process.env.WHATSAPP_API_KEY;
    const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
    
    console.log('🔍 Variables de entorno:', {
      phoneNumberId: phoneNumberId ? '✅ Presente' : '❌ Faltante',
      apiKey: apiKey ? '✅ Presente' : '❌ Faltante',
      webhookUrl: webhookUrl ? '✅ Presente' : '❌ Faltante',
      verifyToken: verifyToken ? '✅ Presente' : '❌ Faltante'
    });
    
    if (!phoneNumberId || !apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Variables de entorno faltantes' 
      }, { status: 500 });
    }
    
    // Verificar información del número de teléfono
    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error verificando número:', response.status, errorText);
      return NextResponse.json({ 
        success: false, 
        error: 'Error verificando número: ' + response.statusText,
        details: errorText
      }, { status: 500 });
    }
    
    const data = await response.json();
    
    console.log('✅ Configuración verificada:', data);
    
    return NextResponse.json({
      success: true,
      message: 'Configuración verificada',
      config: {
        phoneNumberId,
        webhookUrl,
        verifyToken,
        phoneInfo: data
      }
    });
    
  } catch (error) {
    console.error('❌ API check-config - Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor: ' + (error as Error).message 
    }, { status: 500 });
  }
}
