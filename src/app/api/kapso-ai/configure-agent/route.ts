import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Configurando agente de Kapso AI automáticamente...');
    
    const webhookUrl = 'https://ab3390cd06e0.ngrok-free.app/api/kapso-ai/agent-webhook';
    const agentId = '657bc308-c5c2-46e3-b81c-190ceab3fa6f';
    const apiKey = process.env.KAPSO_API_KEY;
    const baseUrl = process.env.KAPSO_BASE_URL;
    
    console.log('📡 URL del webhook:', webhookUrl);
    console.log('🤖 Agent ID:', agentId);
    console.log('🔑 API Key configurada:', apiKey ? 'Sí' : 'No');
    console.log('🌐 Base URL:', baseUrl);
    
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API Key de Kapso AI no configurada' },
        { status: 400 }
      );
    }
    
    // Configurar el webhook del agente
    const webhookConfig = {
      url: webhookUrl,
      events: ['message_received', 'message_sent', 'status_update'],
      headers: {
        'Content-Type': 'application/json',
        'x-kapso-signature': process.env.KAPSO_WEBHOOK_SECRET || ''
      }
    };
    
    console.log('📋 Configuración del webhook:', webhookConfig);
    
    // Hacer la llamada a la API de Kapso AI
    const response = await fetch(`${baseUrl}/webhook`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookConfig),
    });
    
    console.log('📡 Respuesta de Kapso AI:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error configurando webhook:', errorText);
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Error configurando webhook: ${response.status}`,
          details: errorText
        },
        { status: 500 }
      );
    }
    
    const result = await response.json();
    console.log('✅ Webhook configurado exitosamente:', result);
    
    return NextResponse.json({
      success: true,
      message: 'Agente de Kapso AI configurado exitosamente',
      webhookUrl,
      agentId,
      result
    });
    
  } catch (error) {
    console.error('❌ Error configurando agente:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Endpoint para configurar automáticamente el agente de Kapso AI',
    usage: 'POST para configurar el webhook automáticamente',
    webhookUrl: 'https://ab3390cd06e0.ngrok-free.app/api/kapso-ai/agent-webhook',
    agentId: '657bc308-c5c2-46e3-b81c-190ceab3fa6f'
  });
}
