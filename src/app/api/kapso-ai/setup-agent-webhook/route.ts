import { NextRequest, NextResponse } from 'next/server';
import { KapsoAIService } from '@/lib/kapsoAIService';

export async function POST(request: NextRequest) {
  try {
    const { webhookUrl } = await request.json();
    
    if (!webhookUrl) {
      return NextResponse.json(
        { success: false, error: 'URL del webhook requerida' },
        { status: 400 }
      );
    }

    console.log('🔧 Configurando webhook del agente de Kapso AI...');
    console.log('📡 URL del webhook:', webhookUrl);

    const kapsoService = new KapsoAIService({
      apiKey: process.env.KAPSO_API_KEY!,
      baseUrl: process.env.KAPSO_BASE_URL!,
      phoneNumberId: process.env.KAPSO_PHONE_NUMBER_ID!,
      agentId: process.env.KAPSO_AGENT_ID!
    });
    
    // Configurar el webhook del agente
    const result = await kapsoService.setupAgentWebhook(webhookUrl);
    
    if (result) {
      console.log('✅ Webhook del agente configurado exitosamente');
      return NextResponse.json({
        success: true,
        message: 'Webhook del agente configurado exitosamente',
        webhookUrl
      });
    } else {
      console.log('❌ Error configurando webhook del agente');
      return NextResponse.json(
        { success: false, error: 'Error configurando webhook del agente' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Error en setup-agent-webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Endpoint para configurar webhook del agente de Kapso AI',
    usage: 'POST con { "webhookUrl": "https://tu-dominio.com/api/kapso-ai/agent-webhook" }'
  });
}
