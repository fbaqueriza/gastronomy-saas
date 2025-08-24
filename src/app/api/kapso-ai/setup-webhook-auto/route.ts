import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Configurando webhook automáticamente...');
    
    const webhookUrl = 'https://ab3390cd06e0.ngrok-free.app/api/webhook/kapso';
    const apiKey = process.env.KAPSO_API_KEY;
    const baseUrl = process.env.KAPSO_BASE_URL;
    
    console.log('📡 URL del webhook:', webhookUrl);
    console.log('🔑 API Key configurada:', apiKey ? 'Sí' : 'No');
    console.log('🌐 Base URL:', baseUrl);
    
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API Key de Kapso AI no configurada' },
        { status: 400 }
      );
    }
    
    // Intentar diferentes endpoints para configurar el webhook
    const endpoints = [
      '/webhook',
      '/webhooks',
      '/config/webhook',
      '/settings/webhook'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔄 Intentando endpoint: ${baseUrl}${endpoint}`);
        
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: webhookUrl,
            events: ['message_received', 'message_sent', 'status_update'],
            headers: {
              'Content-Type': 'application/json'
            }
          }),
        });
        
        console.log(`📡 Respuesta de ${endpoint}:`, response.status, response.statusText);
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ Webhook configurado exitosamente:', result);
          
          return NextResponse.json({
            success: true,
            message: 'Webhook configurado automáticamente',
            endpoint: endpoint,
            webhookUrl,
            result
          });
        }
      } catch (error) {
        console.log(`❌ Error con endpoint ${endpoint}:`, error);
      }
    }
    
    // Si no se pudo configurar automáticamente, dar instrucciones manuales
    return NextResponse.json({
      success: false,
      message: 'No se pudo configurar automáticamente',
      manual_instructions: [
        '1. Ve a tu dashboard de Kapso AI',
        '2. Busca la sección "Webhooks" o "Integrations"',
        '3. Agrega un nuevo webhook con esta URL:',
        `   ${webhookUrl}`,
        '4. Si no encuentras webhooks, busca en:',
        '   - Configuración del agente',
        '   - Flujo del agente (nodo de webhook)',
        '   - Integraciones o APIs'
      ],
      webhook_url: webhookUrl
    });
    
  } catch (error) {
    console.error('❌ Error configurando webhook:', error);
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
    message: 'Endpoint para configurar webhook automáticamente',
    webhook_url: 'https://ab3390cd06e0.ngrok-free.app/api/webhook/kapso',
    usage: 'POST para intentar configuración automática'
  });
}
