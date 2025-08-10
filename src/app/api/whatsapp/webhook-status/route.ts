import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API /api/whatsapp/webhook-status - Verificando estado del webhook...');
    
    // Verificar configuración del webhook
    const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
    const verifyToken = process.env.WHATSAPP_VERIFICATION_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const apiKey = process.env.WHATSAPP_API_KEY;
    
    console.log('🔍 Configuración del webhook:', {
      webhookUrl: webhookUrl ? '✅ Configurado' : '❌ No configurado',
      verifyToken: verifyToken ? '✅ Configurado' : '❌ No configurado',
      phoneNumberId: phoneNumberId ? '✅ Configurado' : '❌ No configurado',
      apiKey: apiKey ? '✅ Configurado' : '❌ No configurado'
    });
    
    // Verificar si el webhook está configurado en Meta
    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/subscribed_apps`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('❌ Error verificando webhook:', response.status, response.statusText);
      return NextResponse.json({ 
        success: false, 
        error: 'Error verificando webhook: ' + response.statusText 
      }, { status: 500 });
    }
    
    const data = await response.json();
    
    console.log('✅ Estado del webhook:', data);
    
    return NextResponse.json({
      success: true,
      message: 'Estado del webhook verificado',
      webhookConfig: {
        webhookUrl: webhookUrl ? '✅ Configurado' : '❌ No configurado',
        verifyToken: verifyToken ? '✅ Configurado' : '❌ No configurado',
        phoneNumberId: phoneNumberId ? '✅ Configurado' : '❌ No configurado',
        apiKey: apiKey ? '✅ Configurado' : '❌ No configurado'
      },
      subscribedApps: data
    });
    
  } catch (error) {
    console.error('❌ API webhook-status - Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor: ' + (error as Error).message 
    }, { status: 500 });
  }
}
